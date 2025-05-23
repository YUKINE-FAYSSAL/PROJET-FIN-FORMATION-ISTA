import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './PretsList.css';

function PretsList() {
  const [prets, setPrets] = useState([]);
  const [selectedPret, setSelectedPret] = useState(null);
  const [etatSelectionne, setEtatSelectionne] = useState('bon');
  const [showModal, setShowModal] = useState(false);

  const fetchPrets = () => {
    api.get('/prets')
      .then(res => setPrets(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPrets();
  }, []);

  const openModal = (mat, coteExo) => {
    setSelectedPret({ mat, coteExo });
    setEtatSelectionne('bon');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPret(null);
  };

  const confirmerEtat = async () => {
    const { mat, coteExo } = selectedPret;
    try {
      await api.put(`/prets/${mat}/${coteExo}`, { EtatLivre: etatSelectionne });
      if (etatSelectionne === 'abîmé') {
        await api.post('/send-alert', {
          mat,
          message: `❗ Le livre ${coteExo} a été retourné en mauvais état.`
        });
      }
      alert("📬 Retour enregistré avec succès.");
      fetchPrets();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l'enregistrement du retour.");
    }
  };

  const confirmerRetour = async (mat, coteExo) => {
    try {
      await api.put(`/prets/retour/${mat}/${coteExo}`);
      alert('📦 Livre marqué comme rendu.');
      fetchPrets();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la confirmation du retour.');
    }
  };

  return (
    <div className="prets-container">
      <h2 className="title">
        <i className="fas fa-book-open me-2"></i>Liste des Prêts Actifs
      </h2>

      <table className="table-prets">
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Cote Exemplaire</th>
            <th>Date Prêt</th>
            <th>Date Retour</th>
            <th>Statut</th>
            <th>État Livre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prets.length > 0 ? (
            prets.map(p => (
              <tr key={`${p.Mat}-${p.CoteExo}`}>
                <td data-label="Matricule">{p.Mat}</td>
                <td data-label="Cote">{p.CoteExo}</td>
                <td data-label="Date Prêt">{p.DatePret || '—'}</td>
                <td data-label="Date Retour">{p.DateRetour || '—'}</td>
                <td data-label="Statut">{p.Statut}</td>
                <td data-label="État">{p.EtatLivre || '—'}</td>
                <td data-label="Actions">
                  <button
                    className="btn-action warning"
                    onClick={() => openModal(p.Mat, p.CoteExo)}
                    disabled={p.EtatLivre}
                  >
                    <i className="fas fa-clipboard-check me-1"></i>État
                  </button>
                  <button
                    className="btn-action primary"
                    onClick={() => confirmerRetour(p.Mat, p.CoteExo)}
                    disabled={p.Statut === 'rendu'}
                  >
                    <i className="fas fa-undo-alt me-1"></i>Retour
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">Aucun prêt actif</td>
            </tr>
          )}
        </tbody>
      </table>

{showModal && (
  <div className="retour-modal-backdrop">
    <div className="retour-modal-content">
      <h4><i className="fas fa-clipboard-list me-2"></i>État du livre retourné</h4>

      <div className="retour-form-check">
        <input
          className="retour-form-radio"
          type="radio"
          value="bon"
          id="bon"
          checked={etatSelectionne === 'bon'}
          onChange={() => setEtatSelectionne('bon')}
        />
        <label className="retour-form-label" htmlFor="bon">Livre en bon état</label>
      </div>

      <div className="retour-form-check">
        <input
          className="retour-form-radio"
          type="radio"
          value="abîmé"
          id="abime"
          checked={etatSelectionne === 'abîmé'}
          onChange={() => setEtatSelectionne('abîmé')}
        />
        <label className="retour-form-label" htmlFor="abime">Livre abîmé</label>
      </div>

      <div className="retour-modal-actions">
        <button className="btn btn-success me-2" onClick={confirmerEtat}>
          <i className="fas fa-check-circle me-1"></i>Confirmer
        </button>
        <button className="btn btn-secondary" onClick={closeModal}>
          <i className="fas fa-times me-1"></i>Annuler
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default PretsList;
