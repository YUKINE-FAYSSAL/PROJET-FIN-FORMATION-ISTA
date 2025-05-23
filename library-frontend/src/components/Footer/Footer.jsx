import React from 'react';
import './Footer.css';
import logo from '../../asset/logo/logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <img src={logo} alt="OFPPT Taza Logo" className="footer-logo" />
          <h3>BIBLIO OFPPT TAZA</h3>
          <p>Bibliothèque numérique du centre OFPPT Taza</p>
          <p>Gestion centralisée des ressources pédagogiques</p>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>
            <i className="fas fa-envelope"></i> Email: contact@ofppt-taza.ma
          </p>
          <p>
            <i className="fas fa-phone-alt"></i> Téléphone: +212 5 35 00 00 00
          </p>
          <p>
            <i className="fas fa-map-marker-alt"></i> Adresse: Avenue Mohammed VI, Taza
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Accès rapide</h3>
          <a href="/catalogue">
            <i className="fas fa-book"></i> Catalogue des livres
          </a>
          <a href="/login">
            <i className="fas fa-sign-in-alt"></i> Espace personnel
          </a>
          <a href="/dashboard">
            <i className="fas fa-tachometer-alt"></i> Tableau de bord
          </a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bibliothèque OFPPT Taza - Tous droits réservés</p>
      </div>
    </footer>
  );
};

export default Footer;