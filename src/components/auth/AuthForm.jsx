
import { useState } from 'react'

export default function AuthForm({
  mode,
  setMode,
  onSubmit,
  message,
  messageType,
  loading
}) {
  const [form, setForm] = useState({
    // username: '',
    email: '',
    password: ''
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <main className="auth-page">
      <div className="auth-container">

        <header className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand-icon">M</span>
            MOMENTUM
          </div>

          <span className="auth-eyebrow">
            {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
          </span>

          <h1 className="auth-title">
            {mode === 'login'
              ? 'Train with purpose.'
              : 'Start your journey.'}
          </h1>

          <p className="auth-description">
            {mode === 'login'
              ? 'Sign in to continue your training journey.'
              : 'Create your account and build momentum.'}
          </p>
        </header>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>

          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>


          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              autoComplete={
                mode === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
              minLength={mode === 'register' ? 8 : undefined}
              required
            />
          </div>

          {message && (
            <div
              className={`message message-${messageType}`}
              role={messageType === 'error' ? 'alert' : 'status'}
            >
              {message}
            </div>
          )}

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}

            {!loading && <span>→</span>}
          </button>
        </form>

        <footer className="auth-footer">
          MOMENTUM · BUILT FOR PROGRESS
        </footer>

      </div>
    </main>
  )
}
