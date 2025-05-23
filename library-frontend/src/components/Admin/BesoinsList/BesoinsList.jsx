import React, { useEffect, useState } from 'react';
import Footer from '../../Footer/Footer';
import './BesoinsList.css';

const BesoinsList = () => {
  const [besoins, setBesoins] = useState([]);
  const [activeTab, setActiveTab] = useState('attente'); // default

  useEffect(() => {
    fetch('http://127.0.0.1:5000/all-besoins')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBesoins(data);
        } else {
          console.error('Erreur:', data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // ✅ Utiliser Ajoute pour séparer les besoins
  const ajoutes = besoins.filter(b => String(b.Ajoute) === "true");
  const attente = besoins.filter(b => String(b.Ajoute) !== "true");

  const renderTable = (list, type) => (
    <table className="table table-bordered besoins-table">
      <thead className={type === 'ajoutes' ? 'table-success' : 'table-warning'}>
        <tr>
          <th>Numéro Stagiaire</th>
          <th>Titre</th>
          <th>Auteur</th>
          <th>Date</th>
          {type === 'ajoutes' && <th>Cote</th>}
        </tr>
      </thead>
      <tbody>
        {list.map((b, i) => (
          <tr key={i}>
            <td>{b.Mat}</td>
            <td>{b.Titre_Ouvrage}</td>
            <td>{b.Auteur}</td>
            <td>{b.DateDemande}</td>
            {type === 'ajoutes' && <td>{b.Cote}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mt-4 besoins-container">
      <h2 className="mb-4 text-center">📌 Gestion des Besoins</h2>

      <div className="besoins-tabs">
        <button
          className={`tab-button ${activeTab === 'attente' ? 'active' : ''}`}
          onClick={() => setActiveTab('attente')}
        >
          ⏳ En Attente
        </button>
        <button
          className={`tab-button ${activeTab === 'ajoutes' ? 'active' : ''}`}
          onClick={() => setActiveTab('ajoutes')}
        >
          ✅ Ajoutés
        </button>
      </div>

      {activeTab === 'attente'
        ? attente.length > 0
          ? renderTable(attente, 'attente')
          : <p className="besoins-empty">Aucun besoin en attente.</p>
        : ajoutes.length > 0
          ? renderTable(ajoutes, 'ajoutes')
          : <p className="besoins-empty">Aucun besoin ajouté.</p>
      }

    </div>
  );
};

export default BesoinsList;
