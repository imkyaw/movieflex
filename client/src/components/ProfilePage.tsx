import { useAuth } from '../context/AuthContext';

export function ProfilePage({ onBack }: { onBack(): void }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="auth-shell">
      <section className="auth-card session-card" aria-labelledby="profile-title">
        <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
        <div className="brand-mark" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
        <p className="eyebrow">My account</p>
        <h1 id="profile-title">{user.name}</h1>
        <span className="role-badge">{user.role}</span>
        <dl className="profile-details">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Member since</dt><dd>{memberSince}</dd></div>
        </dl>
        <button className="submit-button" type="button" onClick={logout}>Sign out</button>
      </section>
    </main>
  );
}
