
import { supabase } from '../db/supabase'

export async function register(email, password, username) {
  const cleanUsername = (username || '').trim()

  if (cleanUsername.length < 3) {
    throw new Error('Username must have at least 3 characters.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: cleanUsername
      }
    }
  })

  if (error) {
    throw error
  }

  return data
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}
