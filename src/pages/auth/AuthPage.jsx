
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
      if (mode === 'register') {
        const data = await register(
          form.email.trim(),
          form.password,
          (form.username || '').trim()
        )

        setMessage(
          data.session
            ? 'Account created successfully!'
            : 'Account created! Please check your email to confirm your account.'
        )

        setMessageType('success')

        if (!data.session) setMode('login')
      } else {
        await login(form.email.trim(), form.password)
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong.')
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
