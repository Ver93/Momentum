
import { supabase } from '../db/supabase'

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  })

  if (error) throw new Error('Incorrect email or password.')

  return data
}

export async function register(email, password, username) {
  if (username.trim().length < 3) {
    throw new Error('Username must have at least 3 characters.')
  }

  if (password.length < 8) {
    throw new Error('Password must have at least 8 characters.')
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { username: username.trim() }
    }
  })

  if (error) throw error

  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}
