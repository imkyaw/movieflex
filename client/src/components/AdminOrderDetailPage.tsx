import { useEffect, useState } from 'react';
import * as adminApi from '../api/admin';
import type { AdminOrderDetail } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export function AdminOrderDetailPage({ orderId, onBack, onDashboard, onMovies, onUsers, onViewMovie }: { orderId: string; onBack(): void; onDashboard(): void; onMovies(): void; onUsers(): void; onViewMovie(movieId: string): void }) {
  const { token, user, logout } = useAuth();
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminApi.getOrderDetail(orderId, token)
      .then((result) => { setDetail(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load this order.'))
      .finally(() => setLoading(false));
  }, [token, orderId]);

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onDashboard}>Dashboard</button>
        <button type="button" onClick={onMovies}>Movies</button>
        <button className="active" type="button" onClick={onBack}>Orders</button>
        <button type="button" onClick={onUsers}>Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>Orders</button>
        <span>›</span>
        <span>{detail ? detail.customerName : 'Order'}</span>
      </nav>
      {loading ? <div className="page-message">Loading order…</div> : error ? <div className="page-message error">{error}</div> : detail && <>
        <div className="admin-title-row">
          <div><h1>{detail.customerName}</h1><span className="admin-badge">ADMIN</span></div>
        </div>
        <p className="modal-meta">{detail.customerEmail}</p>
        <p className="modal-director">
          Ordered {new Date(detail.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>

        <div className="stat-grid compact">
          <div className="stat-card">
            <span className="stat-label">Items</span>
            <strong className="stat-value">{detail.details.reduce((sum, item) => sum + item.quantity, 0)}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <strong className="stat-value">${(detail.totalCents / 100).toFixed(2)}</strong>
          </div>
        </div>

        <h3 className="section-heading">Order items</h3>
        <div className="order-card">
          <div className="cart-lines">
            {detail.details.map((item) => <div className="cart-line order-line" key={item.id}>
              <div className="confirmed-poster">{item.posterUrl ? <img src={item.posterUrl} alt={`${item.title} poster`} /> : <span>▧</span>}</div>
              <div className="confirmed-details"><h3><button className="link-button" type="button" onClick={() => onViewMovie(item.movieId)}>{item.title}</button></h3><p>Qty {item.quantity}</p></div>
              <strong>${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}</strong>
            </div>)}
          </div>
        </div>
      </>}
    </section>
  </main>;
}
