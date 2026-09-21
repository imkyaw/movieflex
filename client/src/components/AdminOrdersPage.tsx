import { useEffect, useMemo, useState } from 'react';
import * as adminApi from '../api/admin';
import type { AdminOrder } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export function AdminOrdersPage({ onBack, onDashboard, onMovies, onUsers, onView }: { onBack(): void; onDashboard(): void; onMovies(): void; onUsers(): void; onView(orderId: string): void }) {
  const { token, user, logout } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi.getOrders(token)
      .then((result) => { setOrders(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load orders.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => orders.filter((order) => {
    const term = search.toLowerCase();
    return !term || `${order.customerName} ${order.customerEmail}`.toLowerCase().includes(term);
  }), [orders, search]);

  const revenueCents = useMemo(() => filtered.reduce((sum, order) => sum + order.totalCents, 0), [filtered]);

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onDashboard}>Dashboard</button>
        <button type="button" onClick={onMovies}>Movies</button>
        <button className="active" type="button">Orders</button>
        <button type="button" onClick={onUsers}>Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Orders</h1><span className="admin-badge">ADMIN</span><span className="count-badge">{filtered.length} orders</span></div>
      </div>
      <div className="admin-filters">
        <input aria-label="Search orders" placeholder="Search by customer name or email…" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      {error && <div className="page-message error">{error}</div>}
      {loading ? <div className="page-message">Loading orders…</div> : <div className="movie-table-wrap">
        <table className="movie-table">
          <thead><tr><th>Customer</th><th>Email</th><th>Date</th><th>Items</th><th>Total</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((order) => <tr key={order.orderId}>
              <td><strong>{order.customerName}</strong></td>
              <td>{order.customerEmail}</td>
              <td>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              <td>{order.itemCount}</td>
              <td><strong>${(order.totalCents / 100).toFixed(2)}</strong></td>
              <td><div className="row-actions"><button type="button" onClick={() => onView(order.orderId)}>View</button></div></td>
            </tr>)}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="page-message">No orders match your filters.</div>}
      </div>}
      {!loading && filtered.length > 0 && <p className="admin-list-summary">Total revenue: <strong>${(revenueCents / 100).toFixed(2)}</strong></p>}
    </section>
  </main>;
}
