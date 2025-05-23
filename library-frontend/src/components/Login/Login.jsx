import React, { useState, useEffect } from 'react';
import './Login.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ofpptLogo from '../../asset/logo/login/ofppt.png';

// استورد الدوال من utils
import { CreateCaptcha, ValidateCaptcha } from '../../utils/captcha';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    CreateCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Vérification captcha
    if (!ValidateCaptcha()) {
      setError('❌ Captcha invalide. Veuillez réessayer.');
      return;
    }

    // Appel API backend
    try {
      const res = await api.post('/login', { email, password });
      const user = res.data;
      localStorage.setItem('user', JSON.stringify(user));

      if (user.Role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/catalogue');
      }
    } catch (err) {
      setError('❌ Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-full-screen">
      <div className="login-left d-none d-lg-flex">
        <div className="login-left-content">
          <h1>Bienvenue à la bibliothèque de l'ISTA</h1>
          <p>Connectez-vous pour explorer et réserver vos livres préférés.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="text-center mb-4">
            <img src={ofpptLogo} alt="OFPPT Logo" className="ofppt-logo mb-3" />
            <h2>Connexion</h2>
          </div>

          <form onSubmit={handleLogin}>
            <label className="form-label">Adresse Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Ex: 20021119001@ofppt-edu.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* CAPTCHA */}
            <fieldset className="captcha-section">
              <input
                type="text"
                id="UserCaptchaCode"
                className="CaptchaTxtField"
                placeholder="Recopiez le Captcha"
              />
              <span id="WrongCaptchaError" className="error"></span>

              <div className="CaptchaWrap">
                <div id="CaptchaImageCode" className="CaptchaTxtField" />
                <button
                  className="ReloadBtn"
                  type="button"
                  onClick={CreateCaptcha}
                  title="Rafraîchir Captcha"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </fieldset>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <button type="submit" className="login-btn full-btn mt-4">
              <i className="fas fa-sign-in-alt"></i>
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
