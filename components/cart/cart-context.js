import { h, createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import CartService, { CART_EVENTS } from './cart-service';

const Context = createContext();

const CartContext = ({ children, data }) => {
  const [cartState, setCartState] = useState(CartService.cart);
  const [loading, setLoading] = useState(CartService.loading);

  useEffect(() => {
    const listener = (event) => {
      setLoading(CartService.loading);
      setCartState(CartService.cart);
      if (event === CART_EVENTS.UPDATE) {
        document.dispatchEvent(new CustomEvent('cart:open'));
      }
    }
    CartService.addListener(listener);
    setCartState(CartService.cart);
    return () => {
      CartService.removeListener(listener);
    }
  }, [])

  /**
   * Wrapper for cart API to make interactions more simple
   */
  const cart = {
    add: (...params) => CartService.add(...params),
    remove: (...params) => CartService.remove(...params),
    update: (...params) => CartService.update(...params),
    state: cartState,
  };

  return (
    <Context.Provider value={{ cart, cartLoading: loading, data }}>
      {children}
    </Context.Provider>
  );
};

export const withCartContext = (Rendered) => (props) =>
  (
    <Context.Consumer>
      {(value) => <Rendered {...props} {...value} />}
    </Context.Consumer>
  );

export default CartContext;
