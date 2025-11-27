import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📁</span>
          <span className="brand-text">Meme Vault</span>
        </Link>
        {isAuthenticated ? (
          <div className="navbar-right">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <div className="user-menu" ref={menuRef}>
              <button className="user-button" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user?.username}</span>
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user?.username}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    🚺 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="navbar-right">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
