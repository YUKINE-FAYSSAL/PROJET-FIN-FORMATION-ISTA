import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MesBesoins.css';

const MesBesoins = () => {
  const [besoins, setBesoins] = useState([]);
  const [activeTab, setActiveTab] = useState('attente');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return;
    fetch(`http://127.0.0.1:5000/mes-besoins?mat=${user.Mat || user["Numéro stagiaire"]}`)
      .then(res => res.json())
      .then(data => setBesoins(data))
      .catch(err => console.error(err));
  }, [user]);

  const ajoutés = besoins.filter(b => b.Ajoute && b.Cote);
  const attente = besoins.filter(b => !b.Ajoute);

  const renderTable = (list, type) => (
    <table className="table table-bordered besoins-table">
      <thead className={type === 'ajoutes' ? 'table-success' : 'table-warning'}>
        <tr>
          <th>Titre</th>
          <th>Auteur</th>
          <th>Date Demande</th>
          <th>État</th>
        </tr>
      </thead>
      <tbody>
        {list.map((b, i) => (
          <tr key={i}>
            <td>
              {type === 'ajoutes' ? (
                <Link to={`/book/${b.Cote}`} className="text-success fw-bold">
                  ✅ {b.Titre_Ouvrage}
                </Link>
              ) : (
                <>⏳ {b.Titre_Ouvrage}</>
              )}
            </td>
            <td>{b.Auteur}</td>
            <td>{b.DateDemande}</td>
            <td>
              {type === 'ajoutes'
                ? <span className="text-success">Ajouté</span>
                : <span className="text-warning">En attente</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mt-4 besoins-container">
      <h2 className="mb-4 text-center">📌 Mes Besoins</h2>

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
        : ajoutés.length > 0
  ? renderTable(ajoutés, 'ajoutes')
  : <p className="besoins-empty">Aucun besoin ajouté.</p>

      }
    </div>
  );
};

export default MesBesoins;
