
const navigation = [
  { id: 'home', label: 'Overview', icon: '⌂' },
  { id: 'build', label: 'Build', icon: '+' },
  { id: 'log', label: 'Log', icon: '▤' },
  { id: 'statistics', label: 'Statistics', icon: '▥' },
  { id: 'profile', label: 'Profile', icon: '○' },
]

export default function MobileNav({
  activePage,
  setActivePage
}) {
  return (
    <nav className="mobile-nav">
      {navigation.map(item => (
        <button
          key={item.id}
          type="button"
          className={`mobile-nav-item ${
            activePage === item.id ? 'active' : ''
          }`}
          onClick={() => setActivePage(item.id)}
        >
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  )
}
