import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Footer from '../Footer/Footer';
import './BookDetails.css';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

function BookDetails() {
  const { cote } = useParams();
  const [book, setBook] = useState(null);
  const [isAlreadyReserved, setIsAlreadyReserved] = useState(false);
  const [maxDays, setMaxDays] = useState(7);
  const [dateRetour, setDateRetour] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get(`/books/${cote}`)
      .then(res => setBook(res.data))
      .catch(err => {
        console.error(err);
        alert('Livre introuvable');
        navigate('/catalogue');
      });

    api.get(`/mes-reservations?mat=${user["Numéro stagiaire"]}`)
      .then(res => {
        const deja = res.data.some(r => r.CoteExo.startsWith(cote));
        setIsAlreadyReserved(deja);
      })
      .catch(err => console.log(err));

    if (user?.Role) {
      const days = user.Role.toLowerCase() === 'formateur' ? 15 : 7;
      setMaxDays(days);
      const today = dayjs();
      const retour = today.add(days, 'day').format('YYYY-MM-DD');
      setDateRetour(retour);
    }
  }, [cote, navigate, user]);

  const handleReservation = async () => {
    try {
      const resEx = await api.get(`/exemplaires-par-cote/${book.Cote}`);
      const exemplairesDispo = resEx.data.filter(e => e.Disponible !== false);

      if (!exemplairesDispo.length) {
        Swal.fire({
          title: '❌ Indisponible',
          text: "Toutes les copies sont déjà réservées.",
          icon: 'error'
        });
        return;
      }

      const coteExo = exemplairesDispo[0].CoteExo;
      const res = await api.post('/reservation', {
        Mat: user.Mat || user["Numéro stagiaire"],
        CoteExo: coteExo,
        Role: user.Role
      });

      Swal.fire({
        title: '✅ Réservation réussie',
        text: res.data.message || `Copie ${coteExo} réservée avec succès.`,
        icon: 'success',
        timer: 2500
      });

      setIsAlreadyReserved(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Erreur',
        text: err.response?.data?.error || err.message,
        icon: 'error'
      });
    }
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
              <span className="meta-label">Date d'édition</span>
              <span className="meta-value">{book.Edition_Date}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Disponibilité</span>
              <span className="meta-value">{book.Quantite > 0 ? 'Disponible' : 'Indisponible'}</span>
            </div>
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
              onClick={handleReservation}
              disabled={book.Quantite <= 0 || isAlreadyReserved}
            >
              {book.Quantite <= 0
                ? 'Indisponible'
                : isAlreadyReserved
                ? 'Déjà réservé'
                : 'Réserver ce livre'}
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

export default BookDetails;
