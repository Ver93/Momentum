
import { useState } from 'react'
import { login, register } from '../../services/authService'
import AuthForm from '../../components/auth/AuthForm'
import './AuthPage.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(form) {
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const email = (form.email || '').trim()
      const password = form.password || ''

      if (!email || !password) {
        throw new Error('Email and password are required.')
      }

      if (mode === 'register') {
        const username = (form.username || '').trim()

        if (username.length < 3) {
          throw new Error(
            'Username must have at least 3 characters.'
          )
        }

        if (password.length < 8) {
          throw new Error(
            'Password must have at least 8 characters.'
          )
        }

        const data = await register(
          email,
          password,
          username
        )

        setMessage(
          data.session
            ? 'Account created successfully!'
            : 'Account created! Please check your email to confirm your account.'
        )

        setMessageType('success')

        if (!data.session) {
          setMode('login')
        }

      } else {
        await login(email, password)
      }

    } catch (error) {
      setMessage(
        error.message || 'Something went wrong.'
      )

      setMessageType('error')

    } finally {
      setLoading(false)
    }
  }

  function changeMode(value) {
    setMode(value)
    setMessage('')
    setMessageType('')
  }

  return (
    <AuthForm
      mode={mode}
      setMode={changeMode}
      onSubmit={handleSubmit}
      message={message}
      messageType={messageType}
      loading={loading}
    />
  )
}
