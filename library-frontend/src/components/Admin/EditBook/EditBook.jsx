import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './EditBook.css';

function EditBook() {
  const { cote } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    Titre_Ouvrage: '',
    Auteur: '',
    Editeur: '',
    Langue: '',
    Categorie: '',
    Edition_Date: '',
    Quantite: '',
    Support_Accom: '',
    Observations: '',
    CodeSec: '',
    CodeSousSec: ''
  });

  const [secteurs, setSecteurs] = useState([]);
  const [sousSecteurs, setSousSecteurs] = useState([]);

  useEffect(() => {
    if (!cote) return;

    api.get('/secteurs').then(res => setSecteurs(res.data));

    api.get(`/books/${cote}`)
      .then(res => {
        const book = res.data;
        setForm({
          Titre_Ouvrage: book.Titre_Ouvrage || '',
          Auteur: book.Auteur || '',
          Editeur: book.Editeur || '',
          Langue: book.Langue || '',
          Categorie: book.Categorie || '',
          Edition_Date: book.Edition_Date?.slice(0, 10) || '',
          Quantite: book.Quantite || '',
          Support_Accom: book.Support_Accom || '',
          Observations: book.Observations || '',
          CodeSec: book.CodeSec || '',
          CodeSousSec: book.CodeSousSec || ''
        });

        if (book.CodeSec) {
          api.get(`/soussecteurs/${book.CodeSec}`).then(r => setSousSecteurs(r.data));
        }

        setLoading(false);
      })
      .catch(err => {
        alert('Erreur chargement livre');
        setLoading(false);
      });
  }, [cote]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSecteurChange = async (e) => {
    const selectedSec = e.target.value;
    setForm({ ...form, CodeSec: selectedSec, CodeSousSec: '' });
    if (selectedSec) {
      const res = await api.get(`/soussecteurs/${selectedSec}`);
      setSousSecteurs(res.data);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.put(`/books/${cote}`, form)
      .then(() => {
        alert("✅ Livre modifié");
        navigate('/admin/dashboard');

      })
      .catch(err => alert("❌ Erreur lors de la modification"));
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;

  return (
    <div className="editbook-container">
      <h2>📝 Modifier Livre</h2>
      <form onSubmit={handleSubmit}>
        <label>Titre</label>
        <input className="form-control mb-2" name="Titre_Ouvrage" value={form.Titre_Ouvrage} onChange={handleChange} required />

        <label>Auteur</label>
        <input className="form-control mb-2" name="Auteur" value={form.Auteur} onChange={handleChange} required />

        <label>Editeur</label>
        <input className="form-control mb-2" name="Editeur" value={form.Editeur} onChange={handleChange} />

        <label>Langue</label>
        <input className="form-control mb-2" name="Langue" value={form.Langue} onChange={handleChange} />

        <label>Catégorie</label>
        <input className="form-control mb-2" name="Categorie" value={form.Categorie} onChange={handleChange} />

        <label>Date d'Édition</label>
        <input className="form-control mb-2" name="Edition_Date" type="date" value={form.Edition_Date} onChange={handleChange} />

        <label>Quantité</label>
        <input className="form-control mb-2" name="Quantite" type="number" value={form.Quantite} onChange={handleChange} />

        <label>Secteur</label>
        <select className="form-control mb-2" value={form.CodeSec} onChange={handleSecteurChange}>
          <option value="">-- Choisir Secteur --</option>
          {secteurs.map(sec => (
            <option key={sec.CodeSec} value={sec.CodeSec}>{sec.LibelleSec}</option>
          ))}
        </select>

        <label>Sous-secteur</label>
        <select className="form-control mb-2" value={form.CodeSousSec} onChange={(e) => setForm({ ...form, CodeSousSec: e.target.value })}>
          <option value="">-- Choisir Sous-secteur --</option>
          {sousSecteurs.map(ss => (
            <option key={ss.CodeSousSec} value={ss.CodeSousSec}>{ss.LibelleSousSec}</option>
          ))}
        </select>

        <label>Support Accompagné</label>
        <input className="form-control mb-2" name="Support_Accom" value={form.Support_Accom} onChange={handleChange} />

        <label>Observations</label>
        <textarea className="form-control mb-2" name="Observations" value={form.Observations} onChange={handleChange}></textarea>

        <button className="btn btn-primary mt-3" type="submit">Enregistrer ✅</button>
      </form>
    </div>
  );
}

export default EditBook;
