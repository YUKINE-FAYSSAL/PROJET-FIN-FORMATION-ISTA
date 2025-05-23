import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import Footer from '../../Footer/Footer';
import dayjs from 'dayjs';
import './MesReservations.css';

function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [vue, setVue] = useState('actuelles');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (user && (user.Mat || user["Numéro stagiaire"])) {
          const mat = user.Mat || user["Numéro stagiaire"];
          const response = await api.get(`/mes-reservations?mat=${mat}`);
          setReservations(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
        setError('Failed to load reservations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const downloadPDF = async (mat, coteExo) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/generate-pdf/${mat}/${coteExo}`);
      if (!response.ok) throw new Error("Error generating receipt");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `recu_${coteExo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError('Failed to download receipt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (vue === 'actuelles') return r.Status === 'réservé' || r.Status === 'en attente';
    return r.Status === 'annulée' || r.Status === 'terminée';
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      'réservé': 'status-badge reserved',
      'en attente': 'status-badge pending',
      'annulée': 'status-badge cancelled',
      'terminée': 'status-badge completed'
    };

    return <span className={`status-badge ${statusStyles[status]}`}>{status}</span>;
  };

  return (
    <div className="mesreservations-wrapper">
      <div className="mesreservations-container">
        <h2>Mes Réservations</h2>

        <div className="mini-nav">
          <button
            className={`mr-btn ${vue === 'actuelles' ? 'active' : 'mr-btn-outline'}`}
            onClick={() => setVue('actuelles')}
          >
            Réservations en cours
          </button>
          <button
            className={`mr-btn ${vue === 'historique' ? 'active' : 'mr-btn-outline'}`}
            onClick={() => setVue('historique')}
          >
            Historique
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des réservations...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="mr-btn"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="mr-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Date Réservation</th>
                  <th>Statut</th>
                  <th>Date Retour</th>
                  <th>Jours Restants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length > 0 ? (
                  filteredReservations.map(res => {
                    const retourPrevue = dayjs(res.DateRetourPrevue);
                    const today = dayjs();
                    const joursRestants = retourPrevue.diff(today, 'day');

                    return (
                      <tr key={`${res.Mat}-${res.CoteExo}`}>
                        <td data-label="Référence" className="reference-cell">
                          <span className="reference-code">{res.CoteExo}</span>
                        </td>
                        <td data-label="Date Réservation">
                          {dayjs(res.DateReserv).format('DD/MM/YYYY')}
                        </td>
                        <td data-label="Statut">
                          {getStatusBadge(res.Status)}
                        </td>
                        <td data-label="Date Retour">
                          {res.DateRetourPrevue ? dayjs(res.DateRetourPrevue).format('DD/MM/YYYY') : '---'}
                        </td>
                        <td
                          data-label="Jours Restants"
                          className={joursRestants < 3 ? 'warning' : ''}
                        >
                          {res.DateRetourPrevue
                            ? (joursRestants >= 0 
                                ? `${joursRestants} jour(s)` 
                                : <span className="late">⚠️ En retard</span>)
                            : '--'}
                        </td>
                        <td data-label="Actions">
                          {res.Status === 'réservé' && (
                            <button
                              className="mr-download-btn"
                              onClick={() => downloadPDF(res.Mat, res.CoteExo)}
                              disabled={isLoading}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              Télécharger
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      <div className="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3f3cbb">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="12" y1="18" x2="12" y2="12"></line>
                          <line x1="9" y1="15" x2="15" y1="15"></line>
                        </svg>
                        <p>Aucune réservation {vue === 'actuelles' ? 'en cours' : 'dans l\'historique'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MesReservations;