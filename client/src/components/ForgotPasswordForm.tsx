import { useState, type FormEvent } from 'react';
import * as authApi from '../api/auth';
import { PASSWORD_RULES, meetsPasswordRules } from '../passwordRules';

type Step = 'email' | 'reset' | 'done';

/** Two-step password reset: request an emailed code, then choose a new password. */
export function ForgotPasswordForm({ initialEmail, onBack }: { initialEmail: string; onBack(email: string): void }) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setResent(step === 'reset');
      setStep('reset');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to send the code.');
    } finally { setSubmitting(false); }
  }

  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setSubmitting(true);
    try {
      await authApi.resetPassword(email.trim(), code.trim(), password);
      setStep('done');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reset the password.');
    } finally { setSubmitting(false); }
  }

  if (step === 'done') {
    return <div className="forgot-form">
      <div className="profile-saved" role="status">Your password has been reset. You can now sign in.</div>
      <button className="submit-button" type="button" onClick={() => onBack(email.trim())}>Back to sign in</button>
    </div>;
  }

  if (step === 'email') {
    return <form className="forgot-form" onSubmit={sendCode}>
      <p className="forgot-text">Enter your email address and we will send you a 6-digit code to reset your password.</p>
      <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="submit-button" type="submit" disabled={submitting || !email.trim()}>{submitting ? 'Please wait…' : 'Send code'}</button>
      <button className="text-link" type="button" onClick={() => onBack(email.trim())}>Back to sign in</button>
    </form>;
  }

  return <form className="forgot-form" onSubmit={reset}>
    <p className="forgot-text">If an account exists for <strong>{email.trim()}</strong>, we have sent a 6-digit code to that address.{resent && ' A new code is on its way.'}</p>
    <label>Verification code<input inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus /></label>
    <label>New password<input type="password" autoComplete="new-password" placeholder="••••••••" maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    <ul className="password-rules">
      {PASSWORD_RULES.map((rule) => <li key={rule.label} className={rule.test(password) ? 'met' : ''}>{rule.label}</li>)}
    </ul>
    <label>Confirm new password<input type="password" autoComplete="new-password" placeholder="••••••••" maxLength={128} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></label>
    {error && <div className="form-error" role="alert">{error}</div>}
    <button className="submit-button" type="submit" disabled={submitting || code.length !== 6 || !meetsPasswordRules(password) || password !== confirm}>{submitting ? 'Please wait…' : 'Reset password'}</button>
    <div className="forgot-links">
      <button className="text-link" type="button" disabled={submitting} onClick={() => void sendCode()}>Resend code</button>
      <button className="text-link" type="button" onClick={() => onBack(email.trim())}>Back to sign in</button>
    </div>
  </form>;
}
