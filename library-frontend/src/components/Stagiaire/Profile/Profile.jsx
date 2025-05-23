import React from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const field = (label, value) => (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || <span className="empty-value">—</span>}</span>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Mon Profil
            </h2>
            <div className="profile-avatar">
              <img
                src={
                  user?.Photo
                    ? `http://localhost:5000/static/profil-icons/${user.Photo}`
                    : user?.Genre?.toUpperCase() === 'F'
                      ? require('../../../asset/icons/woman.png')
                      : require('../../../asset/icons/man.png')
                }
                alt="avatar"
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = require('../../../asset/icons/user-default.png');
                }}
              />
            </div>
          </div>

          {user ? (
            <div className="profile-details">
              {field('Nom', user.Nom)}
              {field('Prénom', user.Prenom)}
              {field('Matricule', user.Mat)}
              {field('Genre', user.Genre === 'H' ? 'Homme' : user.Genre === 'F' ? 'Femme' : null)}
              {field('Date de naissance', formatDate(user.DateNaissance))}
              {field('Téléphone', user.Tel)}
              {field('Email', user.Email)}
              {field('Adresse', user.Adresse)}
              {field('Filière', user.CodeFil)}
              {field('Niveau', user.Niveau)}
              {field('Groupe', user.Groupe)}
            </div>
          ) : (
            <div className="no-user">
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4f46e5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p>Aucune information utilisateur trouvée</p>
                <button 
                  className="mr-btn"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
