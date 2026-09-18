import { useState } from 'react';
import * as orderApi from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';

export function CartPage({ onBack, onSignIn }: { onBack(): void; onSignIn(): void }) {
  const { user, token } = useAuth();
  const { items, totalCents, updateQuantity, removeItem, clear } = useCart();
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<{ items: CartItem[]; totalCents: number } | null>(null);

  async function placeOrder() {
    if (!token) { onSignIn(); return; }
    setPlacing(true);
    setError('');
    try {
      const order = await orderApi.checkout(items.map((item) => ({ movieId: item.movieId, quantity: item.quantity })), token);
      setConfirmed({ items, totalCents: order.totalCents });
      clear();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to complete your order.');
    } finally {
      setPlacing(false);
    }
  }

  if (confirmed) {
    return <main className="cart-shell">
      <div className="confirmation-card">
        <h1>Order confirmed</h1>
      </div>
      <div className="confirmed-items">
        {confirmed.items.map((item) => <div className="confirmed-item" key={item.movieId}>
          <div className="confirmed-poster">{item.posterUrl ? <img src={item.posterUrl} alt={`${item.title} poster`} /> : <span>▧</span>}</div>
          <div className="confirmed-details">
            <h3>{item.title}</h3>
            <p>{item.releaseDate?.slice(0, 4)} · {item.classification} · {item.genre}</p>
            <p>Qty {item.quantity} · ${(item.priceCents / 100).toFixed(2)} each</p>
          </div>
          <strong>${((item.priceCents * item.quantity) / 100).toFixed(2)}</strong>
        </div>)}
      </div>
      <button className="primary-button" type="button" onClick={onBack}>Back to catalogue</button>
    </main>;
  }

  return <main className="cart-shell">
    <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
    <h1>Your order</h1>
    {error && <div className="form-error">{error}</div>}
    {items.length === 0 ? <div className="cart-empty">Your cart is empty.</div> : <>
      <div className="cart-lines">
        {items.map((item) => <div className="cart-line" key={item.movieId}>
          <div className="confirmed-poster">{item.posterUrl ? <img src={item.posterUrl} alt={`${item.title} poster`} /> : <span>▧</span>}</div>
          <div className="confirmed-details">
            <h3>{item.title}</h3>
            <p>{item.releaseDate?.slice(0, 4)} · {item.classification} · {item.genre}</p>
            <p>${(item.priceCents / 100).toFixed(2)} each</p>
          </div>
          <div className="cart-line-actions">
            <div className="qty-stepper">
              <button type="button" onClick={() => updateQuantity(item.movieId, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.movieId, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
            </div>
            <strong>${((item.priceCents * item.quantity) / 100).toFixed(2)}</strong>
            <button className="cart-remove" type="button" onClick={() => removeItem(item.movieId)}>Remove</button>
          </div>
        </div>)}
      </div>
      <div className="cart-summary">
        <span>Total</span>
        <strong>${(totalCents / 100).toFixed(2)}</strong>
      </div>
      {!user && <p className="auth-intro">Sign in to check out.</p>}
      <button className="primary-button" type="button" disabled={placing} onClick={placeOrder}>
        {placing ? 'Placing order…' : user ? 'Checkout' : 'Sign in to checkout'}
      </button>
    </>}
  </main>;
}
