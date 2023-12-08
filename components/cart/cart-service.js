import ShopifyService from './ajax-service';

export const CART_EVENTS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  LOADING: 'LOADING',
  FINISHED: 'FINISHED',
}

class CartService {
  constructor() {
    this.cart = {
      id: null,
      subtotal: {
        amount: 0,
        currencyCode: window.TMW?.localization?.currencyCode
      },
      lines: [],
    };
    this.loading = false;
    this.observers = [];

    this.get();

    // For backwards compatibility we will listen for events
    // However, we should avoid using events and import/call methods on CartService directly
    document.addEventListener('cart:add', (e) => this.add(e.detail?.payload));
    document.addEventListener('cart:updateAttributes', (e) => this.updateAttributes(e.detail?.payload));
    this.mode = ShopifyService.name;
  }

  async callShopify(method, event, ...params) {
    this.loading = true;
    this.notify(CART_EVENTS.LOADING);
    const cart = await ShopifyService[method](this.cart, ...params);
    if (cart) this.cart = cart;
    if (event) this.notify(event);
    this.loading = false;
    this.notify(CART_EVENTS.FINISHED);
    return cart;
  }

  async get(silent = false) {
    return this.callShopify('get', silent ? null : CART_EVENTS.CREATE);
  }

  async add(lines, silent = false) {
    return this.callShopify('add', silent ? null : CART_EVENTS.UPDATE, lines);
  }

  async remove(lines, silent = false) {
    return this.callShopify('remove', silent ? null : CART_EVENTS.UPDATE, lines);
  }

  async update(lines, silent = false) {
    return this.callShopify('update', silent ? null : CART_EVENTS.UPDATE, lines);
  }

  async updateAttributes(attributes, silent = true) {
    return this.callShopify('updateAttributes', silent ? null : CART_EVENTS.UPDATE, attributes);
  }

  notify(event) {
    this.observers.forEach((o) => o.call(o, event));
  }

  addListener(observer) {
    this.observers.push(observer);
  }

  removeListener(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
  }
}

const CartServiceSingleton = new CartService();
export default CartServiceSingleton;
