import { useEffect, useState } from 'react';
import * as userApi from '../api/users';
import type { AdminUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

export function AdminUsersPage({ onBack, onMovies }: { onBack(): void; onMovies(): void }) {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    userApi.listUsers(token)
      .then((result) => { setUsers(result); setError(''); })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load users.'))
      .finally(() => setLoading(false));
  }, [token]);

  return <main className="admin-shell">
    <header className="admin-header">
      <button className="admin-brand" type="button" onClick={onBack}>MovieFlex <small>ADMIN</small></button>
      <nav>
        <button type="button" onClick={onMovies}>Movies</button>
        <button type="button" disabled>Orders</button>
        <button className="active" type="button">Users</button>
      </nav>
      <div className="admin-user"><span>{user?.name}</span><button type="button" onClick={logout}>Sign out</button></div>
    </header>
    <section className="admin-content">
      <div className="admin-title-row">
        <div><h1>Users</h1><span className="admin-badge">ADMIN</span><span className="count-badge">{users.length} accounts</span></div>
      </div>
      {error && <div className="page-message error">{error}</div>}
      {loading ? <div className="page-message">Loading users…</div> : <div className="movie-table-wrap">
        <table className="movie-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {users.map((item) => <tr key={item.userId}>
              <td><div className="table-title"><span className="mini-poster">{item.name.charAt(0).toUpperCase()}</span><strong>{item.name}</strong></div></td>
              <td>{item.email}</td>
              <td><span className={item.role === 'ADMIN' ? 'status active' : 'status'}>{item.role}</span></td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>)}
          </tbody>
        </table>
      </div>}
    </section>
  </main>;
}
