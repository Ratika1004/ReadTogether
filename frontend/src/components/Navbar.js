import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  const isActive = (path) => location.pathname === path;

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await API.get("/notifications/unread");
      setUnread(res.data.count);
    } catch { }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (location.pathname === "/notifications") setUnread(0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">📚</span>
        <span className="logo-text">ReadTogether</span>
      </Link>

      {user && (
        <ul className="nav-links">
          <li>
            <Link to="/feed" className={`nav-link${isActive("/feed") ? " active" : ""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Feed
            </Link>
          </li>
          <li>
            <Link to="/friends" className={`nav-link${isActive("/friends") ? " active" : ""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Friends
            </Link>
          </li>
          <li>
            <Link to="/people" className={`nav-link${isActive("/people") ? " active" : ""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              People
            </Link>
          </li>
          <li>
            <Link to="/search" className={`nav-link${isActive("/search") ? " active" : ""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Books
            </Link>
          </li>
          <li>
            <Link to="/notifications" className={`nav-link nav-bell${isActive("/notifications") ? " active" : ""}`} title="Notifications">
              <span className="bell-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unread > 0 && (
                  <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
                )}
              </span>
            </Link>
          </li>
          <li>
            <Link to="/profile" className={`nav-link${isActive("/profile") ? " active" : ""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </Link>
          </li>
          <li>
            <button className="nav-logout" onClick={handleLogout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </li>
        </ul>
      )}

      {!user && (
        <ul className="nav-links">
          <li><Link to="/login"  className="nav-link">Sign In</Link></li>
          <li><Link to="/signup" className="nav-link">Join</Link></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;