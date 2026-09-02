import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export function AuthPage({ onBack }: { onBack?: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    return score;
  }, [password]);

  function switchMode(nextMode: Mode) { setMode(nextMode); setError(''); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (mode === 'register' && !acceptedTerms) { setError('Please accept the terms to create your account.'); return; }
    setSubmitting(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(`${firstName} ${lastName}`.trim(), email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to continue.');
    } finally { setSubmitting(false); }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        {onBack && <button className="back-link" type="button" onClick={onBack}>← Back to catalogue</button>}
        <div className="brand-mark" aria-hidden="true">M</div>
        <h1 id="auth-title">MovieFlex</h1>
        <p className="auth-intro">{mode === 'login' ? 'Welcome back to your movie store.' : 'Create your movie store account.'}</p>
        <div className="auth-tabs" role="tablist" aria-label="Authentication">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Register</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && <div className="name-row">
            <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></label>
            <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></label>
          </div>}
          <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••" minLength={mode === 'register' ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {mode === 'register' && <>
            <label>Confirm password<input type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label>
            <div className="strength" aria-label="Password strength"><span>Password strength</span><strong>{['Weak', 'Weak', 'Medium', 'Strong'][passwordStrength]}</strong><div><i className={`score-${passwordStrength}`} /></div></div>
            <label className="terms"><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
          </>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}<button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create one' : 'Sign in'}</button></p>
      </section>
    </main>
  );
}
