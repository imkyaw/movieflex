import { AuthPage } from './components/AuthPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading, logout } = useAuth();
  if (loading) return <main className="auth-shell"><p className="loading">Loading MovieFlex…</p></main>;
  if (!user) return <AuthPage />;
  return <main className="auth-shell"><section className="auth-card session-card"><div className="brand-mark" aria-hidden="true">M</div><p className="eyebrow">Signed in</p><h1>{user.name}</h1><p className="auth-intro">{user.email}</p><span className="role-badge">{user.role}</span><button className="submit-button" type="button" onClick={logout}>Sign out</button></section></main>;
}
