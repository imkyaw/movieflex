import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OrdersPage } from './OrdersPage';

type Tab = 'profile' | 'orders';

function EditProfileForm() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  async function save() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile(name.trim());
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="profile-card">
    <span className="role-badge">{user.role}</span>
    <p className="profile-meta">Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>

    <label>Display name
      <input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} maxLength={100} />
    </label>
    {error && <div className="form-error">{error}</div>}
    {saved && <div className="profile-saved">Profile updated.</div>}
    <button className="primary-button" type="button" disabled={saving || !name.trim() || name.trim() === user.name} onClick={save}>
      {saving ? 'Saving…' : 'Save changes'}
    </button>

    <div className="profile-unavailable">
      <label>Email address
        <input value={user.email} disabled />
      </label>
      <p className="not-available">Not available — your email is tied to your sign-in identity and can't be changed here.</p>
    </div>

    <div className="profile-unavailable">
      <label>Password
        <input type="password" value="••••••••••" disabled />
      </label>
      <p className="not-available">Not available — this environment's identity provider doesn't support password changes yet.</p>
    </div>
  </div>;
}

export function ProfilePage({ onBack }: { onBack(): void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');

  if (!user) return null;

  return <main className="cart-shell profile-shell">
    <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>
    <h1>My account</h1>

    <div className="profile-tabs" role="tablist" aria-label="Account sections">
      <button type="button" role="tab" aria-selected={tab === 'profile'} className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile</button>
      <button type="button" role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
    </div>

    {tab === 'profile' && <EditProfileForm />}
    {tab === 'orders' && <OrdersPage embedded />}
  </main>;
}
