import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

/** Confirmation pop-up shown before the user is signed out. */
export function SignOutDialog({ onCancel, onConfirm }: { onCancel(): void; onConfirm(): void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return createPortal(<div className="modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="signout-title" aria-describedby="signout-text">
      <h2 id="signout-title">Sign out?</h2>
      <p id="signout-text">Are you sure you want to sign out of MovieFlex?</p>
      <div className="confirm-actions">
        <button className="secondary-button" type="button" onClick={onCancel} autoFocus>Cancel</button>
        <button className="danger-button" type="button" onClick={onConfirm}>Sign out</button>
      </div>
    </div>
  </div>, document.body);
}

/** A "Sign out" button that asks for confirmation first. */
export function SignOutButton() {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  return <>
    <button type="button" onClick={() => setConfirming(true)}>Sign out</button>
    {confirming && <SignOutDialog onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); logout(); }} />}
  </>;
}
