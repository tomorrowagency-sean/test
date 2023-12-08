function parseGID(gid) {
  return gid.split('/').splice(-1)[0];
}

class AjaxService {
  static name = 'ajax';

  /**
   * Gets a cart instance from a cart ID
   * @param {string} id cart id
   * @returns formatted cart object
   */
  async get() {
    return fetch(`${window.Shopify.routes.root}cart.js`)
      .then((response) => response.json());
  }

  async add(_, payload) {
    const payloadArray = Array.isArray(payload) ? payload : [payload];
    const body = {
      items: payloadArray.map(({merchandiseId, quantity, attributes, id}) => {
      const properties = (attributes || []).reduce(
        (acc, cur) => ({...acc, [cur.key]: cur.value}), {}
      );
      return {
        id: parseGID(merchandiseId) || parseGID(id),
        quantity,
        properties,
      }
      })
    }

    return fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then(this.get);
  }

  async remove(_, payload) {
    if (!payload) return null;
    const body = {
      updates: Object.fromEntries(payload.map((id) => [id, 0]))
    }
    return fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then(response => response.json());
  }

  async update(_, payload) {
    if (!payload) return null;
    let body;
    if (payload.note) body = { note: payload.note };
    else if (payload.attributes) body = { attributes: payload.attributes };
    else {
      body = {
        updates: Object.fromEntries(
          payload.map((item) => [item.id, item.quantity])
        )
      }
    }
    return fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then(response => response.json());
  }

  // AJAX Cart only supports updating properties on one line item at a time so payload only accepts an object
  async updateAttributes(_, payload) {
    if (!payload) return null;
    const { attributes, id, quantity } = payload;
    const properties = (attributes || []).reduce(
      (acc, cur) => ({...acc, [cur.key]: cur.value}), {}
    );
    const body = {
      id: parseGID(id),
    }
    if (quantity) body.quantity = quantity;
    if (attributes) body.properties = properties;
    return fetch(`${window.Shopify.routes.root}cart/change.js`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then(response => response.json());
  }
}

const AjaxServiceSingleton = new AjaxService();
export default AjaxServiceSingleton;
