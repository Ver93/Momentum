
import { useState } from 'react'
import './Dashboard.css'
import SessionBuilder from './SessionBuilder'

export default function Dashboard({ session, onLogout }) {
  const [showBuilder, setShowBuilder] = useState(false)
  const [sessions, setSessions] = useState([])
  const [activePage, setActivePage] = useState('home')

  const username =
    session.user.user_metadata?.username ||
    session.user.email?.split('@')[0] ||
    'Athlete'

  const completedSessions = sessions.filter(
    (item) => item.completed
  )

  const latestSession = completedSessions[0]

  function handleCreate(newSession) {
    setSessions((prev) => [
      {
        ...newSession,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ])

    setShowBuilder(false)
    setActivePage('workouts')
  }

  function handleComplete(id) {
    setSessions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed: true }
          : item
      )
    )
  }

  function renderWorkout(item) {
    return (
      <article className="workout-card" key={item.id}>
        <div className="workout-card-top">
          <span className="workout-type">
            {item.type || 'WORKOUT'}
          </span>
          <span className="workout-date">
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('sv-SE')
              : ''}
          </span>
        </div>

        <h3>{item.name}</h3>

        <div className="workout-meta">
          {item.rounds && <span>{item.rounds} rounds</span>}
          {item.duration && <span>{item.duration} min</span>}
        </div>

        <div className="workout-card-bottom">
          <span className={item.completed ? 'status-done' : 'status-saved'}>
            {item.completed ? 'Completed' : 'Saved workout'}
          </span>

          {!item.completed && (
            <button
              className="complete-button"
              onClick={() => handleComplete(item.id)}
            >
              Mark complete
            </button>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="dashboard">

      <aside className="sidebar">
        <div className="dashboard-logo">
          <span className="logo-icon">M</span>
          <span>MOMENTUM</span>
        </div>

        <nav className="sidebar-nav">
          {[
            ['home', 'Home'],
            ['workouts', 'Workouts'],
            ['history', 'Training Log'],
            ['profile', 'Profile']
          ].map(([page, label]) => (
            <button
              key={page}
              className={`nav-item ${
                activePage === page ? 'active' : ''
              }`}
              onClick={() => setActivePage(page)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{username}</strong>
              <span>Member</span>
            </div>
          </div>

          <button className="logout-button" onClick={onLogout}>
            Log out →
          </button>
        </div>
      </aside>

      <main className="dashboard-main">

        {activePage === 'home' && (
          <>
            <header className="welcome-section">
              <div>
                <span className="eyebrow">YOUR TRAINING SPACE</span>
                <h1>Let's get to work.</h1>
                <p>Welcome back, {username}.</p>
              </div>

              <button
                className="create-button"
                onClick={() => setShowBuilder(true)}
              >
                + Create workout
              </button>
            </header>

            <section className="stats-grid">
              <div className="stat-card">
                <span>Total workouts</span>
                <strong>{sessions.length}</strong>
              </div>

              <div className="stat-card">
                <span>Completed</span>
                <strong>{completedSessions.length}</strong>
              </div>

              <div className="stat-card">
                <span>In library</span>
                <strong>{sessions.length - completedSessions.length}</strong>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-heading">
                <h2>Latest training</h2>
                <button onClick={() => setActivePage('history')}>
                  View all →
                </button>
              </div>

              {latestSession ? (
                renderWorkout(latestSession)
              ) : (
                <div className="empty-card">
                  <div className="empty-icon">↗</div>
                  <h3>Your journey starts here.</h3>
                  <p>
                    Complete your first workout and your results
                    will appear here.
                  </p>
                  <button
                    className="create-button"
                    onClick={() => setShowBuilder(true)}
                  >
                    Create your first workout
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {activePage === 'workouts' && (
          <section className="page-section">
            <header className="page-heading">
              <div>
                <span className="eyebrow">YOUR LIBRARY</span>
                <h1>My workouts</h1>
                <p>Your personal collection of workouts.</p>
              </div>

              <button
                className="create-button"
                onClick={() => setShowBuilder(true)}
              >
                + Create workout
              </button>
            </header>

            {sessions.length === 0 ? (
              <div className="empty-card">
                <h3>No workouts yet.</h3>
                <p>Create your first EMOM, AMRAP or workout.</p>
                <button
                  className="create-button"
                  onClick={() => setShowBuilder(true)}
                >
                  Create workout
                </button>
              </div>
            ) : (
              <div className="workout-grid">
                {sessions.map(renderWorkout)}
              </div>
            )}
          </section>
        )}

        {activePage === 'history' && (
          <section className="page-section">
            <header className="page-heading">
              <div>
                <span className="eyebrow">YOUR PROGRESS</span>
                <h1>Training log</h1>
                <p>Your completed training sessions.</p>
              </div>
            </header>

            {completedSessions.length === 0 ? (
              <div className="empty-card">
                <h3>No training history yet.</h3>
                <p>Your completed workouts will appear here.</p>
              </div>
            ) : (
              <div className="workout-grid">
                {completedSessions.map(renderWorkout)}
              </div>
            )}
          </section>
        )}

        {activePage === 'profile' && (
          <section className="page-section">
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1>Profile</h1>

            <div className="profile-card">
              <div className="avatar profile-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <h2>{username}</h2>
              <p>{session.user.email}</p>

              <button
                className="logout-button profile-logout"
                onClick={onLogout}
              >
                Log out →
              </button>
            </div>
          </section>
        )}

      </main>

      <nav className="mobile-nav">
        {[
          ['home', '⌂', 'Home'],
          ['workouts', '▤', 'Workouts'],
          ['history', '↗', 'Log'],
          ['profile', '○', 'Profile']
        ].map(([page, icon, label]) => (
          <button
            key={page}
            className={activePage === page ? 'mobile-nav-item active' : 'mobile-nav-item'}
            onClick={() => setActivePage(page)}
          >
            <span>{icon}</span>
            <small>{label}</small>
          </button>
        ))}
      </nav>

      {showBuilder && (
        <SessionBuilder
          onClose={() => setShowBuilder(false)}
          onCreate={handleCreate}
        />
      )}

    </div>
  )
}
