
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Logo from '../components/ui/Logo'

export default function DashboardLayout({
  username,
  activePage,
  setActivePage,
  onLogout,
  children
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar
        username={username}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        <header className="mobile-header">
          <Logo />
        </header>

        {children}
      </main>

      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
      />
    </div>
  )
}
