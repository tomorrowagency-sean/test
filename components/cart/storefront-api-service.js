import Storefront from 'utils/storefront';
import * as queries from 'utils/storefront/queries';
import { formatCart } from 'utils/storefront/format-resource';

/**
 * Formats line items for storefront API
 * @param {array|object} payload of line items to add or update
 * @returns payload formatted for the storefront API
 */
function formatCartUpdatePayload(cart, payload, updateType) {
  if (!payload || !updateType) return [];
  const payloadArray = Array.isArray(payload) ? payload : [payload];

  if (updateType === 'add') {
    return payloadArray.map((line) => {
      const merchandiseId = line.id;
      // eslint-disable-next-line no-param-reassign
      delete line.id;
      return {
        ...line,
        ...(merchandiseId && { merchandiseId }),
      };
    });
  }

  if (updateType === 'updateAttributes') {
    return [...cart.attributes, ...payloadArray];
  }

  return payloadArray;
}

class StorefrontApiService {
  constructor() {
    this.storefront = new Storefront();
    this.cartId = null;
  }

  /**
   * Gets a cart instance from a cart ID
   * @param {string} id cart id
   * @returns formatted cart object
   */
  async get() {
    if (!this.cartId) this.cartId = await this.create();
    const response = await this.storefront.request({
      query: queries.cartBuyerIdentityUpdate,
      variables: {
        cartId: this.cartId,
        buyerIdentity: {
          countryCode: window.TMW.localization.countryCode,
        },
      },
    });

    // There is an existing cart
    if (response?.data?.cartBuyerIdentityUpdate?.cart) {
      return formatCart(response?.data?.cartBuyerIdentityUpdate?.cart);
    }

    return null;
  }

  async add(cart, payload) {
    return this.updateCartLines({query: 'cartLinesAdd', lines: formatCartUpdatePayload(cart, payload, 'add')});
  }

  async remove(cart, payload) {
    return this.updateCartLines({query: 'cartLinesRemove', lineIds: formatCartUpdatePayload(cart, payload, 'remove')});
  }

  async update(cart, payload) {
    return this.updateCartLines({query: 'cartLinesUpdate', lines: formatCartUpdatePayload(cart, payload, 'update')});
  }

  async updateAttributes(cart, payload) {
    return this.updateCartLines({query: 'cartAttributesUpdate', attributes: formatCartUpdatePayload(cart, payload, 'updateAttributes')});
  }

  async create() {
    const { token } = await fetch(
      `${window.Shopify.routes.root}cart/update.js`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            'init': true,
          }
        }),
      }
    )
      .then((response) => response.json());
    return `gid://shopify/Cart/${token}`;
  }

  /**
   * Method for handling all cart requests (add/remove/update)
   * @param {array} lines
   * @param {array} lineIds
   * @param {string} query
   * @returns cart object (stored in state)
   */
  async updateCartLines({
    lines,
    lineIds,
    attributes,
    query,
  }) {
    const response = await this.storefront.request({
      query: queries[query],
      variables: {
        cartId: this.cartId,
        ...(lines && { lines }),
        ...(lineIds && { lineIds }),
        ...(attributes && { attributes }),
        countryCode: window.TMW.localization.countryCode,
      },
    });

    // eslint-disable-next-line no-console
    if (response.errors) console.error(response.errors);
    const updatedCart = formatCart(response.data[query].cart);
    const zeroQuantityItems = updatedCart.lines.filter(
      (line) => line.quantity === 0,
    );

    if (!zeroQuantityItems.length) return updatedCart;

    return this.remove(
      zeroQuantityItems.map((line) => line.id),
    );
  }
}

const StorefrontApiServiceSingleton = new StorefrontApiService();
export default StorefrontApiServiceSingleton;
