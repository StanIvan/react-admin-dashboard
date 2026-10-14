import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import './AuthPage.css'

type AuthMode = 'sign-in' | 'sign-in-split' | 'sign-up' | 'forgot-password' | 'otp'

export function AuthPage({
  onExit,
  onNotify,
}: {
  onExit: () => void
  onNotify: (message: string) => void
}) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setFormError('')
  }

  function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onNotify('Form checks passed. Sign-in is a preview; no account was authenticated.')
  }

  function submitSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setFormError('The passwords do not match.')
      return
    }
    onNotify('Form checks passed. Account creation is not connected to a server.')
  }

  function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    changeMode('otp')
    onNotify('This is a preview. No recovery email or verification code was sent.')
  }

  function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onNotify('Code format accepted. Verification is not connected to a server.')
  }

  const isSplit = mode === 'sign-in-split'
  const isSignIn = mode === 'sign-in' || isSplit
  const heading = isSignIn
    ? 'Welcome back'
    : mode === 'sign-up'
      ? 'Create your account'
      : mode === 'forgot-password'
        ? 'Reset your password'
        : 'Check your inbox'

  return (
    <main className={`auth-page${isSplit ? ' auth-page-split' : ''}`}>
      <header className="auth-topbar">
        <button className="auth-brand" onClick={onExit}><span><Sparkles size={17} /></span>northstar</button>
        <button className="auth-back-button" onClick={onExit}><ArrowLeft size={15} /> Back to workspace</button>
      </header>

      <section className="auth-layout">
        {isSplit && <aside className="auth-story-panel"><span className="auth-story-mark"><Sparkles size={20} /></span><div><p className="auth-story-kicker">NORTHSTAR STUDIO</p><h2>Make good work, together.</h2><p>Bring your team, projects, and ideas into one calm, focused workspace.</p></div><div className="auth-story-footer"><span>✳</span> One space for your next big thing.</div></aside>}

        <div className="auth-form-column">
          <div className="auth-card">
            <div className="auth-card-icon">{mode === 'otp' ? <ShieldCheck size={20} /> : mode === 'forgot-password' ? <KeyRound size={20} /> : <Sparkles size={20} />}</div>
            <div className="auth-heading"><h1>{heading}</h1><p>{isSignIn ? 'Enter your details to access your workspace.' : mode === 'sign-up' ? 'Start organizing your work with your team.' : mode === 'forgot-password' ? 'Enter the email address linked to your account.' : `Enter the six-digit code for ${email || 'your email address'}.`}</p></div>

            {isSignIn && <form className="auth-form" onSubmit={submitSignIn}>
              <label className="auth-field">Email address<div className="auth-input-wrap"><Mail size={16} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
              <label className="auth-field">Password<div className="auth-input-wrap"><KeyRound size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
              <button type="button" className="auth-inline-link auth-forgot-link" onClick={() => changeMode('forgot-password')}>Forgot password?</button>
              <button className="auth-submit" type="submit">Sign in <ArrowRight size={16} /></button>
              <div className="auth-divider"><span />or continue with<span /></div>
              <div className="auth-social-buttons"><button type="button" onClick={() => onNotify('Google sign-in is not configured in this preview.')}>G<span>Google</span></button><button type="button" onClick={() => onNotify('GitHub sign-in is not configured in this preview.')}>⌘<span>GitHub</span></button></div>
              <p className="auth-switch-copy">New to Northstar? <button type="button" className="auth-inline-link" onClick={() => changeMode('sign-up')}>Create an account</button></p>
              {!isSplit && <button className="auth-variant-link" type="button" onClick={() => changeMode('sign-in-split')}>Preview two-column sign-in</button>}
              {isSplit && <button className="auth-variant-link" type="button" onClick={() => changeMode('sign-in')}>Use the standard sign-in layout</button>}
            </form>}

            {mode === 'sign-up' && <form className="auth-form" onSubmit={submitSignUp}>
              <label className="auth-field">Full name<div className="auth-input-wrap"><input autoComplete="name" maxLength={80} required placeholder="Your name" /></div></label>
              <label className="auth-field">Email address<div className="auth-input-wrap"><Mail size={16} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
              <label className="auth-field">Password<div className="auth-input-wrap"><KeyRound size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
              <label className="auth-field">Confirm password<div className="auth-input-wrap"><KeyRound size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" /></div></label>
              {formError && <p className="auth-form-error" role="alert">{formError}</p>}
              <button className="auth-submit" type="submit">Create account <ArrowRight size={16} /></button>
              <p className="auth-switch-copy">Already have an account? <button type="button" className="auth-inline-link" onClick={() => changeMode('sign-in')}>Sign in</button></p>
            </form>}

            {mode === 'forgot-password' && <form className="auth-form" onSubmit={submitRecovery}>
              <label className="auth-field">Email address<div className="auth-input-wrap"><Mail size={16} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
              <div className="auth-demo-note"><span>i</span>This preview does not send email. Continuing lets you see the one-time-code screen only.</div>
              <button className="auth-submit" type="submit">Continue <ArrowRight size={16} /></button>
              <button type="button" className="auth-inline-link auth-back-link" onClick={() => changeMode('sign-in')}><ArrowLeft size={14} /> Back to sign in</button>
            </form>}

            {mode === 'otp' && <form className="auth-form" onSubmit={submitOtp}>
              <label className="auth-field">One-time code<input className="auth-otp-input" aria-label="One-time code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder="000000" /></label>
              <div className="auth-demo-note"><span>i</span>No code was sent. This is a visual preview; the code cannot be verified without a server.</div>
              <button className="auth-submit" type="submit">Verify code <ArrowRight size={16} /></button>
              <p className="auth-switch-copy">Didn’t receive a code? <button type="button" className="auth-inline-link" onClick={() => onNotify('Code delivery is not configured in this preview.')}>Resend code</button></p>
              <button type="button" className="auth-inline-link auth-back-link" onClick={() => changeMode('forgot-password')}><ArrowLeft size={14} /> Use a different email</button>
            </form>}

            <p className="auth-legal-copy">By continuing, you acknowledge this authentication preview does not create or verify accounts.</p>
          </div>
          <p className="auth-footer">© 2026 Northstar Studio · Authentication preview</p>
        </div>
      </section>
    </main>
  )
}
