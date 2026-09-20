import { useEffect, useState } from 'react';
import * as adminApi from '../api/admin';
import type { Dashboard } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export function AdminDashboardPage({ onBack, onMovies }: { onBack(): void; onMovies(): void }) {
  const { token, user, logout } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi.getDashboard(token)
      .then((result) => { setData(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load the dashboard.'))
      .finally(() => setLoading(false));
  }, [token]);

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button className="active" type="button">Dashboard</button>
        <button type="button" onClick={onMovies}>Movies</button>
        <button type="button" disabled>Orders</button>
        <button type="button" disabled>Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Dashboard</h1><span className="admin-badge">ADMIN</span></div>
      </div>
      {error && <div className="page-message error">{error}</div>}
      {loading || !data ? <div className="page-message">Loading dashboard…</div> : <>
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Movies</span>
            <strong className="stat-value">{data.activeMovieCount}</strong>
            <span className="stat-sub">{data.movieCount} total</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Low stock</span>
            <strong className={`stat-value${data.lowStockCount > 0 ? ' warn' : ''}`}>{data.lowStockCount}</strong>
            <span className="stat-sub">5 or fewer copies</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Users</span>
            <strong className="stat-value">{data.userCount}</strong>
            <span className="stat-sub">registered accounts</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Orders</span>
            <strong className="stat-value">{data.orderCount}</strong>
            <span className="stat-sub">completed checkouts</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Revenue</span>
            <strong className="stat-value">${(data.revenueCents / 100).toFixed(2)}</strong>
            <span className="stat-sub">all-time</span>
          </div>
        </div>

        <h2 className="section-heading">Recent orders</h2>
        {data.recentOrders.length === 0 ? <div className="page-message">No orders yet.</div> : <div className="movie-table-wrap">
          <table className="movie-table compact">
            <thead><tr><th>Customer</th><th>Email</th><th>Date</th><th>Total</th></tr></thead>
            <tbody>
              {data.recentOrders.map((order) => <tr key={order.orderId}>
                <td><strong>{order.customerName}</strong></td>
                <td>{order.customerEmail}</td>
                <td>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td><strong>${(order.totalCents / 100).toFixed(2)}</strong></td>
              </tr>)}
            </tbody>
          </table>
        </div>}
      </>}
    </section>
  </main>;
}
