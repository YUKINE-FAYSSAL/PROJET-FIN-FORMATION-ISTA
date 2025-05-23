import React, { useState } from 'react';
import api from '../../../services/api';
import './DemandeBesoin.css';

function DemandeBesoin() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({
    Titre_Ouvrage: '',
    Auteur: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    try {
      await api.post('/demander-besoin', {
        ...form,
        Mat: user?.Mat || user?.["Numéro stagiaire"]
      });

      setMessage("📬 Votre demande a été envoyée avec succès !");
      setSuccess(true);
      setForm({ Titre_Ouvrage: '', Auteur: '' });

    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="container demande-besoin mt-5">
      <h2 className="text-center mb-4">📚 Proposer un Nouveau Livre</h2>
      {message && (
        <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <div className="mb-3">
          <label className="form-label">Titre du Livre</label>
          <input
            type="text"
            name="Titre_Ouvrage"
            className="form-control"
            value={form.Titre_Ouvrage}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Auteur</label>
          <input
            type="text"
            name="Auteur"
            className="form-control"
            value={form.Auteur}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">Envoyer la Demande</button>
      </form>
    </div>
  );
}

export default DemandeBesoin;
