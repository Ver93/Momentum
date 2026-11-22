
import { useEffect, useState } from 'react'
import { supabase } from '../../db/supabase'
import './ProfilePage.css'

export default function ProfilePage({ session, onLogout }) {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [createdAt, setCreatedAt] = useState('')

    const [newUsername, setNewUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(true)
    const [savingUsername, setSavingUsername] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!session?.user) return

        const user = session.user

        const currentUsername =
            user.user_metadata?.username ||
            user.email?.split('@')[0] ||
            'Athlete'

        setUsername(currentUsername)
        setNewUsername(currentUsername)
        setEmail(user.email || '')

        setCreatedAt(
            user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'Unknown'
        )

        setLoading(false)
    }, [session])

    const updateUsername = async event => {
        event.preventDefault()

        const trimmedUsername = newUsername.trim()

        if (!trimmedUsername) {
            setError('Username cannot be empty.')
            return
        }

        if (trimmedUsername.length > 30) {
            setError('Username cannot exceed 30 characters.')
            return
        }

        setSavingUsername(true)
        setError('')
        setMessage('')

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    username: trimmedUsername
                }
            })

            if (error) throw error

            setUsername(data.user.user_metadata.username)
            setNewUsername(data.user.user_metadata.username)

            setMessage('Username updated successfully.')

        } catch (err) {
            console.error(err)
            setError('Could not update username.')
        } finally {
            setSavingUsername(false)
        }
    }

    const updatePassword = async event => {
        event.preventDefault()

        setError('')
        setMessage('')

        if (newPassword.length < 8) {
            setError('Password must contain at least 8 characters.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setSavingPassword(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setNewPassword('')
            setConfirmPassword('')

            setMessage('Password updated successfully.')

        } catch (err) {
            console.error(err)
            setError('Could not update password.')
        } finally {
            setSavingPassword(false)
        }
    }

    if (loading) {
        return (
            <section className="profile-page">
                <p>Loading profile...</p>
            </section>
        )
    }

    return (
        <section className="profile-page">

            <header className="profile-heading">
                <h1>Profile</h1>
                <p>Manage your Momentum account.</p>
            </header>

            {message && (
                <div className="profile-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="profile-error">
                    {error}
                </div>
            )}

            <section className="profile-card">
                <div className="profile-avatar">
                    {username.charAt(0).toUpperCase()}
                </div>

                <div>
                    <h2>{username}</h2>
                    <p>{email}</p>
                </div>
            </section>

            <section className="profile-card">
                <h2>Account information</h2>

                <div className="profile-info-row">
                    <span>Email</span>
                    <strong>{email}</strong>
                </div>

                <div className="profile-info-row">
                    <span>Member since</span>
                    <strong>{createdAt}</strong>
                </div>
            </section>

            <section className="profile-card">
                <h2>Change username</h2>

                <form onSubmit={updateUsername}>
                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        type="text"
                        value={newUsername}
                        onChange={event => setNewUsername(event.target.value)}
                        maxLength={30}
                        required
                    />

                    <button
                        type="submit"
                        disabled={savingUsername}
                    >
                        {savingUsername ? 'Saving...' : 'Save username'}
                    </button>
                </form>
            </section>

            <section className="profile-card">
                <h2>Change password</h2>

                <form onSubmit={updatePassword}>
                    <label htmlFor="new-password">
                        New password
                    </label>

                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={event => setNewPassword(event.target.value)}
                        minLength={8}
                        autoComplete="new-password"
                        required
                    />

                    <label htmlFor="confirm-password">
                        Confirm password
                    </label>

                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                        minLength={8}
                        autoComplete="new-password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={savingPassword}
                    >
                        {savingPassword ? 'Updating...' : 'Update password'}
                    </button>
                </form>
            </section>

            <section className="profile-card profile-danger-zone">
                <h2>Account</h2>

                <button
                    type="button"
                    onClick={onLogout}
                >
                    Log out
                </button>
            </section>

        </section>
    )
}
