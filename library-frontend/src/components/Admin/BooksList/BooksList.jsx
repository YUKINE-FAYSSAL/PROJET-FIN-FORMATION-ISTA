import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Footer from '../../Footer/Footer';
import './BooksList.css';

function BooksList() {
  const [books, setBooks] = useState([]);
  const [selectedCotes, setSelectedCotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    api.get('/books')
      .then(res => {
        setBooks(res.data.books || res.data);
      })
      .catch(err => console.log(err));
  }, []);

  const handleDelete = (cote) => {
    if (window.confirm('Voulez-vous supprimer ce livre ?')) {
      api.delete(`/books/${cote}`)
        .then(res => {
          alert(res.data.message);
          setBooks(books.filter(b => b.Cote !== cote));
        })
        .catch(err => console.log(err));
    }
  };

  const toggleSelect = (cote) => {
    setSelectedCotes(prev =>
      prev.includes(cote) ? prev.filter(c => c !== cote) : [...prev, cote]
    );
  };

  const handleDeleteSelected = () => {
    const livresASupprimer = books.filter(b => !selectedCotes.includes(b.Cote));

    if (livresASupprimer.length === 0) {
      alert("❗ Aucun livre à supprimer.");
      return;
    }

    if (window.confirm(`Voulez-vous supprimer ${livresASupprimer.length} livres ?`)) {
      livresASupprimer.forEach(livre => {
        api.delete(`/books/${livre.Cote}`)
          .then(() => {
            setBooks(prev => prev.filter(b => b.Cote !== livre.Cote));
          })
          .catch(err => console.error(err));
      });

      alert("✅ Suppression terminée");
    }
  };

  return (
    <div style={{ backgroundColor: '#eef3f8', minHeight: '100vh', paddingTop: '30px' }}>
      <div className="bl-container">
        <h2 className="bl-title">📚 Gestion des Livres</h2>

        <div className="bl-actions">
          <button className="bl-btn bl-btn-success" onClick={() => navigate('/admin/addbook')}>
            <i className="fas fa-plus-circle me-2"></i>Ajouter Livre
          </button>
          <button className="bl-btn bl-btn-secondary" onClick={() => navigate('/admin/secteurs')}>
            <i className="fas fa-layer-group me-2"></i>Ajouter Secteur
          </button>
          <button className="bl-btn bl-btn-danger" onClick={handleDeleteSelected}>
            <i className="fas fa-trash me-2"></i>Supprimer tout sauf sélectionnés
          </button>
        </div>

        <table className="bl-table">
          <thead className="bl-table-head">
            <tr>
              <th></th>
              <th>Cote</th>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Édition</th>
              <th>Quantité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map(book => (
                <tr key={book.Cote}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedCotes.includes(book.Cote)}
                      onChange={() => toggleSelect(book.Cote)}
                    />
                  </td>
                  <td>{book.Cote}</td>
                  <td>{book.Titre_Ouvrage}</td>
                  <td>{book.Auteur}</td>
                  <td>{book.Edition_Date?.slice(0, 10)}</td>
                  <td>{book.Quantite}</td>
                  <td className="text-center">
                    <button className="bl-btn bl-btn-small bl-btn-primary me-2" onClick={() => navigate(`/editbook/${book.Cote}`)}>
                      <i className="fas fa-pen"></i>
                    </button>
                    <button className="bl-btn bl-btn-small bl-btn-danger" onClick={() => handleDelete(book.Cote)}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center">Aucun livre</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}

export default BooksList;
