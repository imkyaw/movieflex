import { useEffect, useState } from 'react';
import * as orderApi from '../api/orders';
import type { Order } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export function OrdersPage({ onBack, embedded }: { onBack?(): void; embedded?: boolean }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    if (!token) return;
    setLoading(true);
    orderApi.listOrders(token)
      .then((result) => { setOrders(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load your order history.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  const content = <>
    {error && <div className="form-error">{error}</div>}
    {loading ? <div className="page-message">Loading your orders…</div>
      : orders.length === 0 ? <div className="cart-empty">You haven't placed any orders yet.</div>
      : <div className="order-list">
        {orders.map((order) => <div className="order-card" key={order.orderId}>
          <div className="order-card-head">
            <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <strong>${(order.totalCents / 100).toFixed(2)}</strong>
          </div>
          <div className="cart-lines">
            {order.details.map((detail) => <div className="cart-line order-line" key={detail.id}>
              <div className="confirmed-poster">{detail.posterUrl ? <img src={detail.posterUrl} alt={`${detail.title} poster`} /> : <span>▧</span>}</div>
              <div className="confirmed-details"><h3>{detail.title}</h3><p>Qty {detail.quantity}</p></div>
              <strong>${((detail.unitPriceCents * detail.quantity) / 100).toFixed(2)}</strong>
            </div>)}
          </div>
        </div>)}
      </div>}
  </>;

  if (embedded) return content;

  return <main className="cart-shell">
    <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
    <h1>Order history</h1>
    {content}
  </main>;
}
