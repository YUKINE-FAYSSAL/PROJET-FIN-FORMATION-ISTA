import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './AddBook.css';

function AddBook({ setActivePage }) {
  const [form, setForm] = useState({
    Cote: '',
    Titre_Ouvrage: '',
    Auteur: '',
    Editeur: '',
    Langue: '',
    Categorie: '',
    Edition_Date: '',
    Quantite: '',
    Observations: '',
    CodeSec: '',
    CodeSousSec: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [besoins, setBesoins] = useState([]);
  const [selectedBesoinId, setSelectedBesoinId] = useState('');
  const [secteurs, setSecteurs] = useState([]);
  const [sousSecteurs, setSousSecteurs] = useState([]);

  useEffect(() => {
    api.get('/all-besoins')
      .then(res => {
        const enAttente = res.data.filter(b => !b.Ajoute || b.Ajoute === false || b.Ajoute === 0);
        setBesoins(enAttente);
      })
      .catch(err => console.error("Erreur chargement besoins:", err));

    api.get('/secteurs')
      .then(res => setSecteurs(res.data))
      .catch(err => console.error("Erreur chargement secteurs:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSecteurChange = async (e) => {
    const selectedSec = e.target.value;
    setForm({ ...form, CodeSec: selectedSec, CodeSousSec: '' });

    if (selectedSec) {
      try {
        const res = await api.get(`/soussecteurs/${selectedSec}`);
        setSousSecteurs(res.data);
      } catch (err) {
        console.error("Erreur chargement sous-secteurs:", err);
      }
    } else {
      setSousSecteurs([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (imageFile) {
      formData.append('image', imageFile);
      formData.append('Support_Accom', imageFile.name);
    }

    if (selectedBesoinId) {
      formData.append('besoin_id', selectedBesoinId);
    }

    try {
      await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (selectedBesoinId) {
        setBesoins(prev => prev.filter(b => b.ID.toString() !== selectedBesoinId));
        setSelectedBesoinId('');
      }

      alert('📘 Livre ajouté avec succès ✅');
      setActivePage('books');

    } catch (err) {
      const message = err.response?.data?.error || err.message || "❌ Erreur inconnue";
      alert(`❌ Erreur: ${message}`);
    }
  };

  return (
    <div className="addbook-container">
      <h2>Ajouter un Livre</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cote (code unique)</label>
          <input className="form-control" name="Cote" value={form.Cote} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Titre du livre</label>
          <input className="form-control" name="Titre_Ouvrage" value={form.Titre_Ouvrage} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Auteur</label>
          <input className="form-control" name="Auteur" value={form.Auteur} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Editeur</label>
          <input className="form-control" name="Editeur" value={form.Editeur} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Langue</label>
          <input className="form-control" name="Langue" value={form.Langue} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Catégorie</label>
          <input className="form-control" name="Categorie" value={form.Categorie} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Date d'édition</label>
          <input type="date" className="form-control" name="Edition_Date" value={form.Edition_Date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Quantité</label>
          <input type="number" className="form-control" name="Quantite" value={form.Quantite} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Secteur</label>
          <select className="form-control" value={form.CodeSec || ''} onChange={handleSecteurChange} required>
            <option value="">-- Choisir secteur --</option>
            {secteurs.map(sec => (
              <option key={sec.CodeSec} value={sec.CodeSec}>{sec.LibelleSec}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Sous-secteur</label>
          <select className="form-control" value={form.CodeSousSec || ''} onChange={e => setForm({ ...form, CodeSousSec: e.target.value })} required>
            <option value="">-- Choisir sous-secteur --</option>
            {sousSecteurs.map(ss => (
              <option key={ss.CodeSousSec} value={ss.CodeSousSec}>{ss.LibelleSousSec}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Image de couverture (jpg/png)</label>
          <input type="file" className="form-control" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label>Observations</label>
          <textarea className="form-control" name="Observations" value={form.Observations} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Lier à un besoin existant (optionnel)</label>
          <select className="form-control" value={selectedBesoinId} onChange={(e) => setSelectedBesoinId(e.target.value)}>
            <option value="">-- Aucun --</option>
            {besoins.map((b, i) => (
              <option key={i} value={b.ID}>
                {b.Titre_Ouvrage} - {b.Auteur} ({b.Mat})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-success mt-3">Ajouter</button>
      </form>
    </div>
  );
}

export default AddBook;
