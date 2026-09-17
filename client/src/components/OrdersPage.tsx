import { useEffect, useState } from 'react';
import * as orderApi from '../api/orders';
import type { Order } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export function OrdersPage({ onBack, embedded }: { onBack?(): void; embedded?: boolean }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returningId, setReturningId] = useState('');

  function load() {
    if (!token) return;
    setLoading(true);
    orderApi.listOrders(token)
      .then((result) => { setOrders(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load your rental history.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function returnItem(orderId: string, itemId: string) {
    if (!token) return;
    setReturningId(itemId);
    setError('');
    try {
      const updated = await orderApi.returnItem(orderId, itemId, token);
      setOrders((current) => current.map((order) => order.orderId === orderId
        ? { ...order, details: order.details.map((detail) => (detail.id === itemId ? updated : detail)) }
        : order));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to return this movie.');
    } finally {
      setReturningId('');
    }
  }

  const content = <>
    {error && <div className="form-error">{error}</div>}
    {loading ? <div className="page-message">Loading your rentals…</div>
      : orders.length === 0 ? <div className="cart-empty">You haven't rented any movies yet.</div>
      : <div className="order-list">
        {orders.map((order) => <div className="order-card" key={order.orderId}>
          <div className="order-card-head">
            <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <strong>${(order.totalCents / 100).toFixed(2)}</strong>
          </div>
          <div className="cart-lines">
            {order.details.map((detail) => <div className="cart-line order-line" key={detail.id}>
              <div><h3>{detail.title}</h3><p>Qty {detail.quantity} · ${(detail.unitPriceCents / 100).toFixed(2)} each</p></div>
              {detail.returnedAt
                ? <span className="status active">Returned {new Date(detail.returnedAt).toLocaleDateString()}</span>
                : <button className="secondary-button compact" type="button" disabled={returningId === detail.id} onClick={() => returnItem(order.orderId, detail.id)}>
                  {returningId === detail.id ? 'Returning…' : 'Return movie'}
                </button>}
            </div>)}
          </div>
        </div>)}
      </div>}
  </>;

  if (embedded) return content;

  return <main className="cart-shell">
    <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
    <h1>Rental history</h1>
    {content}
  </main>;
}
