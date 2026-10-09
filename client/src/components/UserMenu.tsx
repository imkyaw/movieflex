import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SignOutDialog } from './SignOutDialog';

/** Avatar button that opens a dropdown with Profile and Log out. */
export function UserMenu({ onProfile }: { onProfile(): void }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!user) return null;

  return <div className="user-menu" ref={rootRef}>
    <button className="avatar-button" type="button" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" title={user.name} onClick={() => setOpen((value) => !value)}>
      {user.name.charAt(0).toUpperCase()}
    </button>
    {open && <div className="menu-dropdown" role="menu">
      <button className="menu-item" type="button" role="menuitem" onClick={() => { setOpen(false); onProfile(); }}>Profile</button>
      <button className="menu-item danger" type="button" role="menuitem" onClick={() => { setOpen(false); setConfirming(true); }}>Log out</button>
    </div>}
    {confirming && <SignOutDialog onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); logout(); }} />}
  </div>;
}
