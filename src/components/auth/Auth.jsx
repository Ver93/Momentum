
import { useState } from 'react'
import { supabase } from '../../db/supabase'
import AuthForm from './AuthForm'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  const handleModeChange = (value) => {
    setMode(value)
    setMessage('')
    setMessageType('')
  }

  const handleSubmit = async (form) => {
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      if (mode === 'register') {
        const username = form.username.trim()

        if (username.length < 3) {
          throw new Error('Username must have at least 3 characters.')
        }

        if (form.password.length < 8) {
          throw new Error('Password must have at least 8 characters.')
        }

        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { username }
          }
        })

        if (error) throw error

        setMessage(
          data.session
            ? 'Your account has been created successfully.'
            : 'Account created! Check your email to confirm your account.'
        )

        setMessageType('success')

        if (!data.session) {
          setMode('login')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password
        })

        if (error) {
          throw new Error('Incorrect email or password.')
        }
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      mode={mode}
      setMode={handleModeChange}
      onSubmit={handleSubmit}
      message={message}
      messageType={messageType}
      loading={loading}
    />
  )
}
