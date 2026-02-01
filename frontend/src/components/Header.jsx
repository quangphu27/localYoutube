import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header({ setIsAuthenticated }) {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    setIsAuthenticated(false)
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <span className="logo-icon">▶</span>
          <span className="logo-text">YouTube Downloader</span>
        </Link>
        <nav className="header-nav">
          <Link 
            to="/download" 
            className={`nav-link ${location.pathname === '/download' ? 'active' : ''}`}
          >
            Tải Video
          </Link>
          <Link 
            to="/watch" 
            className={`nav-link ${location.pathname === '/watch' ? 'active' : ''}`}
          >
            Phát Video
          </Link>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  )
}

export default Header
