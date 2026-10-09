import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

const RULES: Array<{ label: string; test(value: string): boolean }> = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'An uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'A lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'A number', test: (value) => /[0-9]/.test(value) },
  { label: 'A special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

function PasswordField({ label, value, onChange, autoComplete }: { label: string; value: string; onChange(value: string): void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return <label>{label}
    <span className="password-field">
      <input type={visible ? 'text' : 'password'} value={value} autoComplete={autoComplete} maxLength={128} onChange={(event) => onChange(event.target.value)} />
      <button type="button" className="password-toggle" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} onClick={() => setVisible((shown) => !shown)}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  </label>;
}

/** Pop-up form that lets a signed-in user replace their password. */
export function ChangePasswordDialog({ onClose }: { onClose(): void }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rulesMet = RULES.every((rule) => rule.test(next));
  const matches = next.length > 0 && next === confirm;
  const canSave = !saving && current.length > 0 && rulesMet && matches && next !== current;

  async function save() {
    setSaving(true);
    setError('');
    try {
      await changePassword(current, next);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to change your password.');
    } finally {
      setSaving(false);
    }
  }

  return createPortal(<div className="modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="confirm-dialog password-dialog" role="dialog" aria-modal="true" aria-labelledby="password-title">
      <h2 id="password-title">Change password</h2>
      {done ? <>
        <div className="profile-saved">Your password has been changed.</div>
        <div className="confirm-actions"><button className="primary-button compact" type="button" onClick={onClose} autoFocus>Done</button></div>
      </> : <>
        <PasswordField label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
        <PasswordField label="New password" value={next} onChange={setNext} autoComplete="new-password" />
        <ul className="password-rules">
          {RULES.map((rule) => <li key={rule.label} className={rule.test(next) ? 'met' : ''}>{rule.label}</li>)}
        </ul>
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        {confirm.length > 0 && !matches && <p className="password-hint">The two new passwords do not match.</p>}
        {error && <div className="form-error">{error}</div>}
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button compact" type="button" disabled={!canSave} onClick={save}>{saving ? 'Saving…' : 'Save password'}</button>
        </div>
      </>}
    </div>
  </div>, document.body);
}
