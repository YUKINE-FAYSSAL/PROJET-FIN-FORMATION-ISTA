// ✅ fichier : components/Admin/Dashboard/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

import DashboardStats from '../DashboardStats/DashboardStats';
import BooksList from '../BooksList/BooksList';
import ReservationsList from '../ReservationsList/ReservationsList';
import UsersList from '../UsersList/UsersList';
import BesoinsList from '../BesoinsList/BesoinsList';
import PretsList from '../PretsList/PretsList';
import AddBook from '../AddBook/AddBook';
import EditBook from '../EditBook/EditBook';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activePage, setActivePage] = useState('stats');

  useEffect(() => {
    if (!user || user.Role !== "admin") {
      alert("Accès refusé: réservé à l'admin");
      navigate('/login');
    }
  }, [navigate, user]);

  const renderContent = () => {
    switch (activePage) {
      case 'stats': return <DashboardStats setActivePage={setActivePage} />;
      case 'books': return <BooksList setActivePage={setActivePage} setEditBookCote={() => {}} />;
      case 'addbook': return <AddBook setActivePage={setActivePage} />;
      case 'editbook': return <EditBook cote={null} setActivePage={setActivePage} />;
      case 'reservations': return <ReservationsList />;
      case 'utilisateurs': return <UsersList />;
      case 'besoins': return <BesoinsList />;
      case 'prets': return <PretsList />;
      default: return <DashboardStats setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
  <h2>📚</h2>
  <ul>
    <li onClick={() => setActivePage('stats')} className={activePage === 'stats' ? 'active' : ''} title="Statistiques">📊<span className="label">Statistiques</span></li>
    <li onClick={() => setActivePage('books')} className={activePage === 'books' ? 'active' : ''} title="Livres">📘<span className="label">Livres</span></li>
    <li onClick={() => setActivePage('reservations')} className={activePage === 'reservations' ? 'active' : ''} title="Réservations">📝<span className="label">Réservations</span></li>
    <li onClick={() => setActivePage('utilisateurs')} className={activePage === 'utilisateurs' ? 'active' : ''} title="Utilisateurs">👥<span className="label">Utilisateurs</span></li>
    <li onClick={() => setActivePage('besoins')} className={activePage === 'besoins' ? 'active' : ''} title="Besoins">📌<span className="label">Besoins</span></li>
    <li onClick={() => setActivePage('prets')} className={activePage === 'prets' ? 'active' : ''} title="Retours">🔁<span className="label">Retours</span></li>
  </ul>
</aside>


      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;