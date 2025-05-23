import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './ReservationsList.css';

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('en attente');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchReservations = () => {
    api.get('/all-reservations')
      .then(res => setReservations(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateStatus = (mat, coteExo, newStatus) => {
    const confirmed = window.confirm(`Confirmer que vous voulez mettre à jour le statut en "${newStatus}" ?`);
    if (!confirmed) return;

    api.put(`/reservation/${mat}/${coteExo}`, { Status: newStatus })
      .then(() => {
        alert(`Statut mis à jour en "${newStatus}" avec succès`);
        fetchReservations();
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de la mise à jour");
      });
  };

  const filtered = reservations.filter(r => {
    if (filter === 'toutes') return true;
    return r.Status?.toLowerCase() === filter.toLowerCase();
  });

  const statusList = ['en attente', 'réservé', 'annulée', 'toutes'];

  return (
    <div className="reservation-container">
      <h2 className="page-title">📚 Liste des Réservations</h2>

      <div className="filter-buttons">
        <div className="btn-group desktop-only">
          {statusList.map(st => (
            <button
              key={st}
              className={`filter-btn ${filter === st ? 'active' : ''}`}
              onClick={() => setFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="mobile-dropdown mobile-only">
          <button className="filter-btn dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)}>
            Filtrer: {filter.charAt(0).toUpperCase() + filter.slice(1)} ⌄
          </button>
          {showDropdown && (
            <div className="dropdown-menu-custom">
              {statusList.map(st => (
                <div
                  key={st}
                  className={`dropdown-item-custom ${filter === st ? 'active' : ''}`}
                  onClick={() => {
                    setFilter(st);
                    setShowDropdown(false);
                  }}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="reservation-table">
          <thead>
            <tr>
              <th>👤 Matricule</th>
              <th>📘 Cote</th>
              <th>📆 Date</th>
              <th>🛈 Statut</th>
              <th>🔧 Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(res => (
                <tr key={`${res.Mat}-${res.CoteExo}`} className={res.Status?.toLowerCase().replace(' ', '-')}>
                  <td>{res.Mat}</td>
                  <td>{res.CoteExo}</td>
                  <td>{res.DateReserv || '---'}</td>
                  <td>{res.Status}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      disabled={res.Status === 'réservé'}
                      onClick={() => updateStatus(res.Mat, res.CoteExo, 'réservé')}
                    >
                      ✅
                    </button>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      disabled={res.Status === 'annulée'}
                      onClick={() => updateStatus(res.Mat, res.CoteExo, 'annulée')}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">Aucune réservation trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReservationsList;
