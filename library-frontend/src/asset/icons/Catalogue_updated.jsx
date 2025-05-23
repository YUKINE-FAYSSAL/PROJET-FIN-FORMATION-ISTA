
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import UnifiedNavbar from '../Navbar/UnifiedNavbar';
import Footer from '../Footer/Footer';
import './Catalogue.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

function Catalogue() {
  const [books, setBooks] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const perPage = 9;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterLangue, setFilterLangue] = useState('');
  const [filterAuteur, setFilterAuteur] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.Role === 'admin';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location.href = '/login';
      return;
    }

    fetchBooks();

    api.get(`/mes-reservations?mat=${user["Numéro stagiaire"]}`)
      .then(res => {
        const reserved = res.data.map(r => r.CoteExo);
        setReservedBooks(reserved);
      })
      .catch(err => console.log(err));
  }, [page]);

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

  const handleReserve = async (cote) => {
    const user = JSON.parse(localStorage.getItem('user'));
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
        confirmButtonColor: '#9333ea'
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

    const matchSecteur = filterSecteur === '' || (book.CodeSecteur && book.CodeSecteur === filterSecteur);
    const matchAvailability =
      filterAvailability === '' ||
      (filterAvailability === '1' && book.Quantite > 0) ||
      (filterAvailability === '0' && book.Quantite === 0);
    const matchCategorie = filterCategorie === '' || (book.Categorie && book.Categorie.toLowerCase().includes(filterCategorie.toLowerCase()));
    const matchLangue = filterLangue === '' || (book.Langue && book.Langue.toLowerCase().includes(filterLangue.toLowerCase()));
    const matchAuteur = filterAuteur === '' || (book.Auteur && book.Auteur.toLowerCase().includes(filterAuteur.toLowerCase()));

    return matchSearch && matchSecteur && matchAvailability && matchCategorie && matchLangue && matchAuteur;
  });

  return (
    <div className="catalogue-page">
      <UnifiedNavbar />
      <div className="catalogue-header">
        <h1>Catalogue des Livres</h1>
        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou cote..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <i className="fas fa-filter"></i>
            <select value={filterSecteur} onChange={e => setFilterSecteur(e.target.value)}>
              <option value="">Tous les secteurs</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="I">I</option>
              <option value="D">D</option>
            </select>
          </div>
          <div className="filter-box">
            <i className="fas fa-toggle-on"></i>
            <select value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)}>
              <option value="">Toutes les disponibilités</option>
              <option value="1">Disponible</option>
              <option value="0">Indisponible</option>
            </select>
          </div>
          <div className="filter-box">
            <i className="fas fa-tags"></i>
            <input
              type="text"
              placeholder="Catégorie"
              value={filterCategorie}
              onChange={e => setFilterCategorie(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <i className="fas fa-language"></i>
            <input
              type="text"
              placeholder="Langue"
              value={filterLangue}
              onChange={e => setFilterLangue(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <i className="fas fa-user-pen"></i>
            <input
              type="text"
              placeholder="Auteur"
              value={filterAuteur}
              onChange={e => setFilterAuteur(e.target.value)}
            />
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
                  {reserving && (
                    <div className="reservation-overlay">
                      <div className="reservation-spinner"></div>
                    </div>
                  )}
                </div>
                <div className="book-info">
                  <h3>{book.Titre_Ouvrage}</h3>
                  <p className="author">{book.Auteur}</p>
                  <p className="cote">Cote: {book.Cote}</p>
                  <p className="availability">
                    Disponibilité: {book.Quantite > 0 ? '✅ Disponible' : '❌ Indisponible'}
                  </p>
                </div>
                <div className="buttons">
                  <button
                    onClick={() => handleReserve(book.Cote)}
                    disabled={book.Quantite === 0 || reservedBooks.includes(book.Cote)}
                  >
                    {book.Quantite === 0
                      ? 'Indisponible'
                      : reservedBooks.includes(book.Cote)
                      ? 'Déjà réservé'
                      : 'Réserver'}
                  </button>
                  <button onClick={() => navigate(`/book/${book.Cote}`)}>
                    Détails
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-books-found">
              <i className="fas fa-book-open"></i>
              <p>Aucun livre trouvé</p>
              <button onClick={() => {
                setSearchTerm('');
                setFilterSecteur('');
                setFilterAvailability('');
                setFilterCategorie('');
                setFilterLangue('');
                setFilterAuteur('');
              }}>
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
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
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            &raquo;
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Catalogue;
