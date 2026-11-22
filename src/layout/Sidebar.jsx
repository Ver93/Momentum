import Logo from '../components/ui/Logo'

const navigation = [
  { id: 'home', label: 'Overview', icon: '⌂' },
  { id: 'build', label: 'Build', icon: '+' },
  { id: 'log', label: 'Log', icon: '▤' },
  { id: 'statistics', label: 'Statistics', icon: '▥' },
  { id: 'profile', label: 'Profile', icon: '○' }
]

export default function Sidebar({
  username,
  activePage,
  setActivePage,
  onLogout
}) {
  return (
    <aside className="sidebar">
      <Logo />

      <div className="sidebar-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        {navigation.map(item => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>{username}</strong>
            <span>Member</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          Log out <span>↗</span>
        </button>
      </div>
    </aside>
  )
}