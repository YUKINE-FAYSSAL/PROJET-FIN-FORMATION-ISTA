import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './GestionSecteurs.css';

function GestionSecteurs() {
  const [secteurs, setSecteurs] = useState([]);
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [newSecteur, setNewSecteur] = useState({ CodeSec: '', LibelleSec: '' });
  const [newSousSecteur, setNewSousSecteur] = useState({ CodeSousSec: '', LibelleSousSec: '', CodeSec: '' });
  const [sousSecteurs, setSousSecteurs] = useState([]);

  useEffect(() => {
    fetchSecteurs();
  }, []);

  const fetchSecteurs = () => {
    api.get('/secteurs')
      .then(res => setSecteurs(res.data))
      .catch(err => console.error("Erreur chargement secteurs:", err));
  };

  const handleAddSecteur = () => {
    if (!newSecteur.CodeSec || !newSecteur.LibelleSec) {
      alert("Tous les champs du secteur sont requis !");
      return;
    }

    api.post('/secteurs', newSecteur)
      .then(() => {
        const newS = { ...newSecteur };
        setSecteurs(prev => [...prev, newS]);
        setSelectedSecteur(newS.CodeSec);
        setSousSecteurs([]);
        setNewSousSecteur({ CodeSousSec: '', LibelleSousSec: '', CodeSec: newS.CodeSec });
        setNewSecteur({ CodeSec: '', LibelleSec: '' });
      })
      .catch(err => alert("Erreur:", err.message));
  };

  const handleAddSousSecteur = () => {
    if (!newSousSecteur.CodeSousSec || !newSousSecteur.LibelleSousSec || !newSousSecteur.CodeSec) {
      alert("Tous les champs du sous-secteur sont requis !");
      return;
    }

    api.post('/soussecteurs', newSousSecteur)
      .then(() => {
        const newSS = { ...newSousSecteur };
        setSousSecteurs(prev => [...prev, newSS]);
        setNewSousSecteur({ CodeSousSec: '', LibelleSousSec: '', CodeSec: newSousSecteur.CodeSec });
      })
      .catch(err => alert("Erreur:", err.message));
  };

  const handleDeleteSecteur = (codeSec) => {
    if (!window.confirm(`Supprimer le secteur "${codeSec}" ?`)) return;

    api.delete(`/secteurs/${codeSec}`)
      .then(() => {
        setSecteurs(prev => prev.filter(sec => sec.CodeSec !== codeSec));
        if (selectedSecteur === codeSec) {
          setSelectedSecteur('');
          setSousSecteurs([]);
        }
      })
      .catch(err => alert("Erreur suppression secteur"));
  };

  const handleDeleteSousSecteur = (codeSousSec) => {
    if (!window.confirm(`Supprimer le sous-secteur "${codeSousSec}" ?`)) return;

    api.delete(`/soussecteurs/${codeSousSec}`)
      .then(() => {
        setSousSecteurs(prev => prev.filter(ss => ss.CodeSousSec !== codeSousSec));
      })
      .catch(err => alert("Erreur suppression sous-secteur"));
  };

  return (
    <div className="gestion-secteurs-container">
      <h2>🗂️ Gestion des Secteurs</h2>

      <div className="section">
        <h4>➕ Ajouter un Secteur</h4>
        <div className="form-inline">
          <input type="text" placeholder="CodeSec" value={newSecteur.CodeSec} onChange={e => setNewSecteur({ ...newSecteur, CodeSec: e.target.value })} />
          <input type="text" placeholder="Libellé Secteur" value={newSecteur.LibelleSec} onChange={e => setNewSecteur({ ...newSecteur, LibelleSec: e.target.value })} />
          <button className="btn btn-success" onClick={handleAddSecteur}>Ajouter</button>
        </div>
      </div>

      <div className="section">
        <h4>📋 Liste des Secteurs</h4>
        <ul className="secteur-list">
          {secteurs.map(sec => (
            <li key={sec.CodeSec}>
              <span onClick={() => {
                setSelectedSecteur(sec.CodeSec);
                setNewSousSecteur(prev => ({ ...prev, CodeSec: sec.CodeSec }));
                api.get(`/soussecteurs/${sec.CodeSec}`).then(res => setSousSecteurs(res.data));
              }}>
                {sec.CodeSec} - {sec.LibelleSec}
              </span>
              <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDeleteSecteur(sec.CodeSec)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedSecteur && (
        <div className="section">
          <h4>➕ Ajouter Sous-secteur pour: {selectedSecteur}</h4>
          <div className="form-inline">
            <input type="text" placeholder="CodeSousSec" value={newSousSecteur.CodeSousSec} onChange={e => setNewSousSecteur({ ...newSousSecteur, CodeSousSec: e.target.value })} />
            <input type="text" placeholder="Libellé Sous-secteur" value={newSousSecteur.LibelleSousSec} onChange={e => setNewSousSecteur({ ...newSousSecteur, LibelleSousSec: e.target.value })} />
            <button className="btn btn-primary" onClick={handleAddSousSecteur}>Ajouter</button>
          </div>

          <h5 className="mt-3">📑 Sous-secteurs</h5>
          <ul className="soussecteur-list">
            {sousSecteurs.map(ss => (
              <li key={ss.CodeSousSec}>
                {ss.CodeSousSec} - {ss.LibelleSousSec}
                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDeleteSousSecteur(ss.CodeSousSec)}>🗑️</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GestionSecteurs;
