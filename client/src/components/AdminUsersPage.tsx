import { useEffect, useMemo, useState } from 'react';
import * as adminApi from '../api/admin';
import type { AdminUser } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export function AdminUsersPage({ onBack, onDashboard, onMovies, onOrders, onView }: { onBack(): void; onDashboard(): void; onMovies(): void; onOrders(): void; onView(userId: string): void }) {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi.getUsers(token)
      .then((result) => { setUsers(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load users.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => users.filter((account) => {
    const term = search.toLowerCase();
    return (!role || account.role === role) && (!status || account.status === status) && (!term || `${account.name} ${account.email}`.toLowerCase().includes(term));
  }), [role, status, search, users]);

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onDashboard}>Dashboard</button>
        <button type="button" onClick={onMovies}>Movies</button>
        <button type="button" onClick={onOrders}>Orders</button>
        <button className="active" type="button">Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Users</h1><span className="admin-badge">ADMIN</span><span className="count-badge">{filtered.length} accounts</span></div>
      </div>
      <div className="admin-filters">
        <input aria-label="Search users" placeholder="Search by name or email…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by role" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">Role</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      {error && <div className="page-message error">{error}</div>}
      {loading ? <div className="page-message">Loading users…</div> : <div className="movie-table-wrap">
        <table className="movie-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Orders</th><th>Total spent</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((account) => <tr key={account.userId}>
              <td><strong>{account.name}</strong></td>
              <td>{account.email}</td>
              <td><span className={`status${account.role === 'ADMIN' ? ' active' : ''}`}>{account.role}</span></td>
              <td><span className={`status${account.status === 'ACTIVE' ? ' active' : ' inactive'}`}>{account.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td>
              <td>{new Date(account.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              <td>{account.orderCount}</td>
              <td><strong>${(account.totalSpentCents / 100).toFixed(2)}</strong></td>
              <td><div className="row-actions"><button type="button" onClick={() => onView(account.userId)}>View</button></div></td>
            </tr>)}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="page-message">No users match your filters.</div>}
      </div>}
    </section>
  </main>;
}
