import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Accueil.css';
import Footer from '../Footer/Footer';
import api from '../../services/api';

import heroImg from '../../asset/images/modern-library-interior.jpg';
import reservationImg from '../../asset/images/book-reservation.jpg';
import programImg from '../../asset/images/program-books.jpg';
import digitalImg from '../../asset/images/digital-reading-area.jpg';
import featured1 from '../../asset/images/featured-book-1.jpg';
import featured2 from '../../asset/images/featured-book-2.jpg';
import ofpptImg from '../../asset/images/ofppt-taza-building.jpg';

// Icons
import { FaBook, FaSearch, FaCalendarAlt, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { GiBookshelf } from 'react-icons/gi';
import { MdComputer } from 'react-icons/md';

const Accueil = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalReservations: 0
  });
  const [displayStats, setDisplayStats] = useState({
    books: 0,
    users: 0,
    reservations: 0
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard-stats');
        const data = response.data.counters || {};
        
        setStats({
          totalBooks: data.livres || 0,
          totalUsers: (data.stagiaires || 0) + (data.formateurs || 0),
          totalReservations: data.reservations || 0
        });

        animateCounters(data.livres || 0, 
                      (data.stagiaires || 0) + (data.formateurs || 0), 
                      data.reservations || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    const animateCounters = (books, users, reservations) => {
      const duration = 2000; // 2 seconds animation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setDisplayStats({
          books: Math.floor(progress * books),
          users: Math.floor(progress * users),
          reservations: Math.floor(progress * reservations)
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="modern-library">

      {/* HERO SECTION */}
      <section className="hero">
        <img src={heroImg} alt="Modern Library Interior" loading="lazy" />
        <div className="hero-overlay">
          <h1>Bibliothèque Digitale OFPPT Taza</h1>
          <p>Découvrez, réservez et gérez vos livres en ligne facilement</p>
          <div className="hero-buttons">
            <Link to="/catalogue" className="btn btn-primary pulse">
              <FaSearch /> <span>Explorer le Catalogue</span>
            </Link>
            {!isLoggedIn && (
              <Link to="/login" className="btn btn-secondary glow-on-hover">
                <FaBook /> <span>Se Connecter</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services">
        <h2>Nos Services Principaux</h2>
        <div className="cards">
          <div className="card">
            <img src={reservationImg} alt="Reservation" loading="lazy" />
            <div className="content">
              <h3><FaCalendarAlt /> Réservation en Ligne</h3>
              <p>Réservez vos livres facilement depuis notre plateforme et retirez-les à la bibliothèque.</p>
            </div>
          </div>
          <div className="card">
            <img src={programImg} alt="Program" loading="lazy" />
            <div className="content">
              <h3><GiBookshelf /> Gestion des Exemplaires</h3>
              <p>Suivez la disponibilité des livres et leur emplacement dans notre bibliothèque.</p>
            </div>
          </div>
          <div className="card">
            <img src={digitalImg} alt="Digital" loading="lazy" />
            <div className="content">
              <h3><MdComputer /> Espace Personnel</h3>
              <p>Gérez vos réservations, besoins et historique depuis votre compte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="featured-books">
        <h2>Fonctionnalités Clés</h2>
        <div className="book-cards">
          <div className="feature-card">
            <div className="icon-container">
              <FaUserGraduate className="feature-icon" />
            </div>
            <h4>Espace Stagiaire</h4>
            <p>Réservation de livres, demande de besoins et suivi de vos emprunts.</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaUserTie className="feature-icon" />
            </div>
            <h4>Espace Formateur</h4>
            <p>Accès privilégié avec des quotas de réservation étendus.</p>
          </div>
          <div className="feature-card">
            <div className="icon-container">
              <FaBook className="feature-icon" />
            </div>
            <h4>Gestion Simplifiée</h4>
            <p>Interface admin pour gérer les livres, exemplaires et réservations.</p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat">
            <h3 className="counting-number" data-target={stats.totalBooks}>{displayStats.books}</h3>
            <p>Livres Disponibles</p>
          </div>
          <div className="stat">
            <h3>24/7</h3>
            <p>Accès au Catalogue</p>
          </div>
          <div className="stat">
            <h3 className="counting-number" data-target={stats.totalReservations}>{displayStats.reservations}</h3>
            <p>Réservations</p>
          </div>
          <div className="stat">
            <h3 className="counting-number" data-target={stats.totalUsers}>{displayStats.users}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
      </section>

      {/* OFPPT INFO */}
      <section className="ofppt-info">
        <div className="ofppt-container">
          <div className="ofppt-text">
            <h2>Bibliothèque OFPPT Taza</h2>
            <p>
              Notre plateforme digitale offre un accès simplifié aux ressources de la bibliothèque, 
              avec des fonctionnalités adaptées aux stagiaires et formateurs de l'OFPPT.
            </p>
            <div className="cta-buttons">
              <Link to="/catalogue" className="btn btn-primary">
                Voir le Catalogue Complet
              </Link>
            </div>
          </div>
          <div className="ofppt-image">
            <img src={ofpptImg} alt="OFPPT Taza" loading="lazy" />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <h2>Prêt à commencer ?</h2>
        <p>Connectez-vous pour accéder à toutes les fonctionnalités de notre bibliothèque digitale.</p>
        <div className="cta-buttons">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-primary slide">
                <span>Se Connecter</span>
              </Link>
              <Link to="/catalogue" className="btn btn-tertiary float">
                <span>Explorer Sans Compte</span>
              </Link>
            </>
          ) : (
            <Link to="/catalogue" className="btn btn-primary pulse">
              <span>Accéder au Catalogue</span>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Accueil;