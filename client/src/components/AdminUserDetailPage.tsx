import { useEffect, useState } from 'react';
import * as adminApi from '../api/admin';
import type { AdminUserDetail } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export function AdminUserDetailPage({ userId, onBack, onDashboard, onMovies, onOrders }: { userId: string; onBack(): void; onDashboard(): void; onMovies(): void; onOrders(): void }) {
  const { token, user, logout } = useAuth();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminApi.getUserDetail(userId, token)
      .then((result) => { setDetail(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load this user.'))
      .finally(() => setLoading(false));
  }, [token, userId]);

  async function toggleStatus() {
    if (!token || !detail) return;
    const nextStatus = detail.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setUpdatingStatus(true);
    setStatusError('');
    try {
      await adminApi.updateUserStatus(detail.userId, nextStatus, token);
      setDetail({ ...detail, status: nextStatus });
    } catch (caught: unknown) {
      setStatusError(caught instanceof Error ? caught.message : 'Unable to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  const canToggleStatus = !!detail && detail.role !== 'ADMIN' && detail.userId !== user?.userId;

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onDashboard}>Dashboard</button>
        <button type="button" onClick={onMovies}>Movies</button>
        <button type="button" onClick={onOrders}>Orders</button>
        <button className="active" type="button" onClick={onBack}>Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}>Users</button>
        <span>›</span>
        <span>{detail ? detail.name : 'User'}</span>
      </nav>
      {loading ? <div className="page-message">Loading user…</div> : error ? <div className="page-message error">{error}</div> : detail && <>
        <div className="admin-title-row">
          <div><h1>{detail.name}</h1><span className="admin-badge">ADMIN</span></div>
          {canToggleStatus && <button className={`secondary-button${detail.status === 'ACTIVE' ? ' danger' : ''}`} type="button" onClick={toggleStatus} disabled={updatingStatus}>
            {updatingStatus ? 'Updating…' : detail.status === 'ACTIVE' ? 'Deactivate account' : 'Activate account'}
          </button>}
        </div>
        {statusError && <div className="page-message error">{statusError}</div>}
        <p className="modal-meta">{detail.email}</p>
        <p className="modal-director">
          <span className={`status${detail.role === 'ADMIN' ? ' active' : ''}`}>{detail.role}</span>
          {' '}<span className={`status${detail.status === 'ACTIVE' ? ' active' : ' inactive'}`}>{detail.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
          {' '}· Joined {new Date(detail.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>

        {detail.role !== 'ADMIN' && <>
          <div className="stat-grid compact">
            <div className="stat-card">
              <span className="stat-label">Orders</span>
              <strong className="stat-value">{detail.orderCount}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total spent</span>
              <strong className="stat-value">${(detail.totalSpentCents / 100).toFixed(2)}</strong>
            </div>
          </div>

          <h3 className="section-heading">Order history</h3>
          {detail.orders.length === 0 ? <p className="reviews-empty">No orders yet.</p> : <div className="order-list">
            {detail.orders.map((order) => <div className="order-card" key={order.orderId}>
              <div className="order-card-head">
                <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <strong>${(order.totalCents / 100).toFixed(2)}</strong>
              </div>
              <div className="cart-lines">
                {order.details.map((item) => <div className="cart-line order-line" key={item.id}>
                  <div className="confirmed-poster">{item.posterUrl ? <img src={item.posterUrl} alt={`${item.title} poster`} /> : <span>▧</span>}</div>
                  <div className="confirmed-details"><h3>{item.title}</h3><p>Qty {item.quantity}</p></div>
                  <strong>${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}</strong>
                </div>)}
              </div>
            </div>)}
          </div>}
        </>}
      </>}
    </section>
  </main>;
}
