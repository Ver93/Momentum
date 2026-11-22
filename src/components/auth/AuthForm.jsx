
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
    username: '',
    email: '',
    password: ''
  })

  function handleChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    onSubmit({
      username: form.username,
      email: form.email,
      password: form.password
    })
  }

  function toggleMode(value) {
    setForm({
      username: '',
      email: '',
      password: ''
    })

    setMode(value)
  }

  return (
    <div className="auth-form">

      <div className="auth-tabs">
        <button
          type="button"
          onClick={() => toggleMode('login')}
          className={mode === 'login' ? 'active' : ''}
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => toggleMode('register')}
          className={mode === 'register' ? 'active' : ''}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {mode === 'register' && (
          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              minLength={3}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>

        {message && (
          <div className={`auth-message ${messageType}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : mode === 'register'
              ? 'Create account'
              : 'Login'
          }
        </button>

      </form>
    </div>
  )
}
