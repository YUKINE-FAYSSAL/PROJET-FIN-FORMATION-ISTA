import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Footer from '../Footer/Footer';
import './ConfirmReservation.css';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

function ConfirmReservation() {
  const { cote } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [book, setBook] = useState(location.state?.book || null);
  const [maxDays, setMaxDays] = useState(7);
  const [dateRetour, setDateRetour] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!book) {
      api.get(`/books/${cote}`)
        .then(res => setBook(res.data))
        .catch(err => {
          console.error(err);
          Swal.fire({
            title: 'Erreur',
            text: 'Livre introuvable',
            icon: 'error',
          });
          navigate('/catalogue');
        });
    }

    if (user?.Role) {
      const days = user.Role.toLowerCase() === 'formateur' ? 15 : 7;
      setMaxDays(days);
      const today = dayjs();
      const retour = today.add(days, 'day').format('YYYY-MM-DD');
      setDateRetour(retour);
    }
  }, [book, cote, navigate, user]);

  const confirmerReservation = () => {
    api.post('/reservation', {
      Mat: user.Mat || user["Numéro stagiaire"],
      CoteExo: cote,
      Role: user.Role
    })
      .then(res => {
        Swal.fire({
          title: '✅ Réservation réussie',
          text: res.data.message || 'Réservation confirmée avec succès!',
          icon: 'success',
          confirmButtonColor: '#4caf50'
        });
      })
      .catch(err => {
        console.error(err);
        const msg = err.response?.data?.error || "Une erreur est survenue lors de la réservation.";
        Swal.fire({
          title: '❌ Réservation refusée',
          text: msg,
          icon: 'error',
          confirmButtonColor: '#e53935'
        });
      });
  };

  if (!book) {
    return (
      <div className="book-details-page">
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="book-details-page">
      <div className="book-details-card">
        <div className="book-cover-container">
          <img
            src={book.Support_Accom ? `http://localhost:5000/static/images/${book.Support_Accom}` : 'https://via.placeholder.com/300x450?text=Couverture+Non+Disponible'}
            alt={book.Titre_Ouvrage}
            className="book-cover"
          />
        </div>

        <div className="book-info">
          <h1 className="book-title">{book.Titre_Ouvrage}</h1>
          <p className="book-author">par {book.Auteur}</p>

          <div className="book-meta">
            <div className="meta-item">
              <span className="meta-label">Durée d'emprunt autorisée</span>
              <span className="meta-value">{maxDays} jours</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date retour prévue</span>
              <span className="meta-value">{dateRetour}</span>
            </div>
          </div>

          <div className="book-description">
            <h3>Description</h3>
            <p>{book.Observations || 'Aucune description disponible.'}</p>
          </div>

          <div className="action-buttons">
            <button
              className="reserve-btn"
              onClick={confirmerReservation}
            >
              Confirmer la réservation
            </button>
            <button
              className="back-btn"
              onClick={() => navigate('/catalogue')}
            >
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ConfirmReservation;
