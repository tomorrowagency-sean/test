import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import Panel from 'utils/panel';
import { formatMoney, formatCartLinesAjax } from 'utils/storefront/format-resource';
import { withCartContext } from './cart-context';
import CartItem from './cart-item';

const Cart = (props) => {
  const { cart } = props;
  const closeTriggerEl = useRef(null);
  const isCartRedirect = new URLSearchParams(window.location.search).get(
    'cart',
  );
  const [panelTriggers, setPanelTriggers] = useState({
    openTriggerEl: document.querySelector('[data-header-cart-trigger]'),
    closeTriggerEl: null,
  });

  useEffect(() => {
    if (!closeTriggerEl.current) return;
    setPanelTriggers((value) => ({
      ...value,
      closeTriggerEl: closeTriggerEl.current,
    }));
  }, [closeTriggerEl]);

  const lines = cart?.mode === 'storefront' ? cart?.state?.lines : formatCartLinesAjax(cart?.state?.items);

  return (
    <Panel triggers={panelTriggers} defaultOpen={isCartRedirect} context="cart">
      <div>
        <div>
          <button type="button" ref={closeTriggerEl}>
            {window.TMW.Strings.cart.close}
          </button>
        </div>
        <div>
          {lines.map((line) => (
            <CartItem key={line.id} line={line} />
          ))}
        </div>
        <div>
          <span>
            {cart.mode === 'storefront'
            ? formatMoney(cart?.state?.subtotal || {amount: 0})
            : formatMoney(
              cart?.state?.total_price
                ? {amount: cart.state.total_price}
                : {amount: 0}, true
            )}
          </span>
          <a
            className="justify-center w-full button button--primary"
            href="/checkout"
          >
            {cart.mode === 'storefront' ? cart?.state?.checkoutUrl : window.TMW.Strings.cart.checkout}
          </a>
        </div>
      </div>
    </Panel>
  );
};

export default withCartContext(Cart);
