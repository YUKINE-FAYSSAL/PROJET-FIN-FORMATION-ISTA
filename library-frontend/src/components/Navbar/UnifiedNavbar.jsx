import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../asset/logo/log.png';
import iconMan from '../../asset/icons/man.png';
import iconWoman from '../../asset/icons/woman.png';
import api from '../../services/api';
import './UnifiedNavbar.css';

const UnifiedNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.Role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user && !isAdmin) {
      api.get(`/notifications/${user.Mat}`)
        .then(res => setNotifications(res.data))
        .catch(err => console.error("Erreur de notifications:", err));
    }
  }, [user, isAdmin]);

  const handleClearNotifications = async () => {
    try {
      await api.delete(`/notifications/${user.Mat}`);
      setNotifications([]);
    } catch (err) {
      console.error("❌ Erreur suppression notifications:", err);
    }
  };

  const navItems = [
    { path: "/", text: "ACCUEIL" },
    { path: "/catalogue", text: "CATALOGUE" },
    ...(user
      ? isAdmin
        ? [{ path: "/admin/dashboard", text: "DASHBOARD" }]
        : [
            { path: "/mes-reservations", text: "MES RÉSERVATIONS" },
            { path: "/demande-besoin", text: "DEMANDE BESOIN" }
          ]
      : [])
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top main-navbar">
      <div className="container">
<Link className="navbar-brand" to="/">
  <img src={logo} alt="Logo" height="28" className="mobile-logo" />
</Link>


        {/* 🔻 Mobile icons only */}
        <div className="d-flex align-items-center d-lg-none ms-auto gap-2">
          {!user && (
<Link to="/login" className="user-profile login-btn">
  <i className="fas fa-sign-in-alt"></i>
  <span>Connexion</span>
</Link>

          )}
          {user && !isAdmin && (
            <div className="dropdown position-relative">
              <button className="nav-notif dropdown-toggle" id="notifDropdownSmall" data-bs-toggle="dropdown">
                <i className="fas fa-bell bell-icon"></i>
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length}</span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li className="dropdown-header fw-bold px-3 d-flex justify-content-between">
                  Notifications
                  {notifications.length > 0 && (
                    <button onClick={handleClearNotifications} className="btn btn-sm btn-danger py-0 px-2" style={{ fontSize: '0.7rem' }}>
                      Vider
                    </button>
                  )}
                </li>
                {notifications.length === 0 ? (
                  <li className="dropdown-item text-muted">Aucune notification</li>
                ) : (
                  notifications.map((notif, i) => (
                    <li key={i}>
                      <Link to={`/book/${notif.cote_exo}`} className="dropdown-item small">
                        {notif.message}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {user && (
            <div className="dropdown position-relative">
              <button className="user-profile dropdown-toggle" id="userDropdownSmall" data-bs-toggle="dropdown">
                <img
  src={
    user?.Photo
      ? `http://localhost:5000/static/profil-icons/${user.Photo}`
      : user?.Genre?.toUpperCase() === 'F'
        ? iconWoman
        : iconMan
  }
  alt="avatar"
  className="avatar-img"
/>

              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link className="dropdown-item" to={isAdmin ? "/admin/profile" : "/profile"} onClick={closeMenu}><i className="fas fa-user me-2"></i> Profil</Link></li>
                {!isAdmin && <li><Link className="dropdown-item" to="/mes-besoins" onClick={closeMenu}><i className="fas fa-bookmark me-2"></i> Mes Besoins</Link></li>}
                <li><Link className="dropdown-item" to={isAdmin ? "/admin/settings" : "/settings"} onClick={closeMenu}><i className="fas fa-cog me-2"></i> Paramètres</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Déconnexion</button></li>
              </ul>
            </div>
          )}

          <button className="navbar-toggler ms-2" type="button" onClick={toggleMenu}>
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* 🔻 Main menu & icons for large screens */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 mobile-menu">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link className={`nav-link ${isActive(item.path) ? 'active' : ''}`} to={item.path} onClick={closeMenu}>
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-none d-lg-flex align-items-center gap-3">
            {user && !isAdmin && (
              <div className="dropdown position-relative">
                <button className="nav-notif dropdown-toggle" id="notifDropdown" data-bs-toggle="dropdown">
                  <i className="fas fa-bell bell-icon"></i>
                  {notifications.length > 0 && (
                    <span className="notif-badge">{notifications.length}</span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="dropdown-header fw-bold px-3 d-flex justify-content-between">
                    Notifications
                    {notifications.length > 0 && (
                      <button onClick={handleClearNotifications} className="btn btn-sm btn-danger py-0 px-2" style={{ fontSize: '0.7rem' }}>
                        Vider
                      </button>
                    )}
                  </li>
                  {notifications.length === 0 ? (
                    <li className="dropdown-item text-muted">Aucune notification</li>
                  ) : (
                    notifications.map((notif, i) => (
                      <li key={i}>
                        <Link to={`/book/${notif.cote_exo}`} className="dropdown-item small">
                          {notif.message}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            {user && (
              <div className="dropdown position-relative">
                <button className="user-profile dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown">
                  <img
    src={
      user?.Photo
        ? `http://localhost:5000/static/profil-icons/${user.Photo}`
        : user?.Genre?.toUpperCase() === 'F'
          ? iconWoman
          : iconMan
    }
    alt="avatar"
    className="avatar-img"
  />
                  <span className="ms-2 text-white">{isAdmin ? "Admin" : user?.Nom}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile" onClick={closeMenu}><i className="fas fa-user me-2"></i> Profil</Link></li>
                  {!isAdmin && <li><Link className="dropdown-item" to="/mes-besoins"><i className="fas fa-bookmark me-2"></i> Mes Besoins</Link></li>}
                  <li><Link className="dropdown-item" to="/settings" onClick={closeMenu}><i className="fas fa-cog me-2"></i> Paramètres</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Déconnexion</button></li>
                </ul>
              </div>
            )}

            {!user && (
              <Link to="/login" className="user-profile login-btn">
  <i className="fas fa-sign-in-alt"></i>
  <span>Connexion</span>
</Link>

            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UnifiedNavbar;
