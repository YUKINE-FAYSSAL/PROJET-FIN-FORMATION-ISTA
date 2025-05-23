import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Footer from '../Footer/Footer';
import './Catalogue.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiSearch, FiFilter, FiBook, FiInfo, FiChevronDown } from 'react-icons/fi';

function Catalogue() {
  const [books, setBooks] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [secteurs, setSecteurs] = useState([]);
  const [sousSecteurs, setSousSecteurs] = useState([]);
  const perPage = 9;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');
  const [filterSousSecteur, setFilterSousSecteur] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.Role === 'admin';

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    fetchBooks();
    fetchSecteurs();
    fetchUserReservations();
  }, [page]);

  useEffect(() => {
    if (filterSecteur) {
      fetchSousSecteurs(filterSecteur);
    } else {
      setSousSecteurs([]);
      setFilterSousSecteur('');
    }
  }, [filterSecteur]);

  const fetchBooks = () => {
    setLoading(true);
    api.get(`/books?page=${page}&per_page=${perPage}`)
      .then(res => {
        setBooks(res.data.books || res.data);
        setTotal(res.data.total || res.data.length || 0);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchSecteurs = () => {
    api.get('/secteurs')
      .then(res => setSecteurs(res.data))
      .catch(err => console.error('Error fetching secteurs:', err));
  };

  const fetchSousSecteurs = (codeSec) => {
    api.get(`/soussecteurs/${codeSec}`)
      .then(res => setSousSecteurs(res.data))
      .catch(err => console.error('Error fetching sous-secteurs:', err));
  };

  const fetchUserReservations = () => {
    api.get(`/mes-reservations?mat=${user["Numéro stagiaire"]}`)
      .then(res => {
        const reserved = res.data.map(r => r.CoteExo.split('-')[0]);
        setReservedBooks(reserved);
      })
      .catch(err => console.log(err));
  };

  const handleReserve = async (cote) => {
    setReserving(true);
    try {
      const resEx = await api.get(`/exemplaires-par-cote/${cote}`);
      const exemplaires = resEx.data;
      const exemplairesDispo = exemplaires.filter(e => e.Disponible !== false);

      if (!exemplairesDispo.length) {
        throw new Error("Toutes les copies de ce livre sont actuellement empruntées.");
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
        confirmButtonColor: '#4caf50',
        timer: 2000
      });

      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.Cote === cote
            ? { ...book, Quantite: Math.max(book.Quantite - 1, 0) }
            : book
        )
      );
      setReservedBooks(prev => [...prev, cote]);
    } catch (err) {
      Swal.fire({
        title: 'Erreur',
        text: err.response?.data?.error || err.message || 'Une erreur est survenue.',
        icon: 'error',
        confirmButtonColor: '#e53935'
      });
    } finally {
      setReserving(false);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  const filteredBooks = books.filter(book => {
    const matchSearch =
      (book.Titre_Ouvrage && book.Titre_Ouvrage.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.Auteur && book.Auteur.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.Cote && String(book.Cote).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchSecteur = filterSecteur === '' || (book.CodeSec && book.CodeSec === filterSecteur);
    const matchSousSecteur = filterSousSecteur === '' || (book.CodeSousSec && book.CodeSousSec === filterSousSecteur);

    const matchAvailability =
      filterAvailability === '' ||
      (filterAvailability === '1' && book.Quantite > 0) ||
      (filterAvailability === '0' && book.Quantite === 0);

    return matchSearch && matchSecteur && matchSousSecteur && matchAvailability;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterSecteur('');
    setFilterSousSecteur('');
    setFilterAvailability('');
  };

  return (
    <div className="catalogue-page">
      <div className="catalogue-header">
        <h1>Catalogue des Livres</h1>
        <p>Trouvez les livres qui vous intéressent parmi notre collection</p>
        
        <div className="search-filter-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou cote..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select 
              value={filterSecteur} 
              onChange={e => setFilterSecteur(e.target.value)}
            >
              <option value="">Tous les secteurs</option>
              {secteurs.map(secteur => (
                <option key={secteur.CodeSec} value={secteur.CodeSec}>
                  {secteur.LibelleSec}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-arrow" />
          </div>

          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select 
              value={filterSousSecteur} 
              onChange={e => setFilterSousSecteur(e.target.value)}
              disabled={!filterSecteur}
            >
              <option value="">Tous les sous-secteurs</option>
              {sousSecteurs.map(sousSecteur => (
                <option key={sousSecteur.CodeSousSec} value={sousSecteur.CodeSousSec}>
                  {sousSecteur.LibelleSousSec}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-arrow" />
          </div>

          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select 
              value={filterAvailability} 
              onChange={e => setFilterAvailability(e.target.value)}
            >
              <option value="">Toutes les disponibilités</option>
              <option value="1">Disponible</option>
              <option value="0">Indisponible</option>
            </select>
            <FiChevronDown className="select-arrow" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des livres...</p>
        </div>
      ) : (
        <motion.div
          className="catalogue-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <div key={book.Cote} className="book-card">
                <div className="book-image-container">
                  <img
                    src={`http://localhost:5000/static/images/${book.Support_Accom}`}
                    alt={book.Titre_Ouvrage}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x300?text=Couverture+non+disponible';
                    }}
                  />
                  {reserving === book.Cote && (
                    <div className="reservation-overlay">
                      <div className="reservation-spinner"></div>
                    </div>
                  )}
                </div>
                <div className="book-info">
                  <h3>{book.Titre_Ouvrage}</h3>
                  <p className="author">{book.Auteur}</p>
                  <p className="cote">Cote: {book.Cote}</p>
                  <div className={`availability ${book.Quantite > 0 ? 'available' : 'unavailable'}`}>
                    {book.Quantite > 0 ? 
                      `${book.Quantite} exemplaire${book.Quantite > 1 ? 's' : ''} disponible${book.Quantite > 1 ? 's' : ''}` : 
                      'Indisponible'}
                  </div>
                </div>
                <div className="buttons">
                  <button
                    className="reserve-btn"
                    onClick={() => handleReserve(book.Cote)}
                    disabled={book.Quantite === 0 || reservedBooks.includes(book.Cote)}
                  >
                    {book.Quantite === 0
                      ? 'Indisponible'
                      : reservedBooks.includes(book.Cote)
                      ? 'Déjà réservé'
                      : 'Réserver'}
                  </button>
                  <button 
                    className="details-btn"
                    onClick={() => navigate(`/book/${book.Cote}`)}
                  >
                    <FiInfo /> Détails
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-books-found">
              <FiBook size={64} />
              <p>Aucun livre trouvé</p>
              <p>Essayez de modifier vos critères de recherche</p>
              <button onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &laquo;
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={page === pageNum ? 'active' : ''}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Catalogue;