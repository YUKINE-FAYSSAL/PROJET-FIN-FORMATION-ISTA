import React, { useState } from 'react';
import { FiLock, FiUser, FiCheck, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('password');
  const [formData, setFormData] = useState({ oldPass: '', newPass: '' });
  const [passMessage, setPassMessage] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [isLoading, setIsLoading] = useState({ password: false, avatar: false });

  const user = JSON.parse(localStorage.getItem('user'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPassMessage('');
    setIsLoading(prev => ({ ...prev, password: true }));

    try {
      const res = await axios.put('http://localhost:5000/update-password', {
        mat: user.Mat,
        old_password: formData.oldPass,
        new_password: formData.newPass
      });
      setPassMessage(res.data.message || '✅ Mot de passe mis à jour');
      setFormData({ oldPass: '', newPass: '' });
    } catch (err) {
      setPassMessage('❌ Erreur lors de la mise à jour');
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!file || !user?.Mat) {
      setAvatarMessage("Veuillez sélectionner une image");
      return;
    }

    setIsLoading(prev => ({ ...prev, avatar: true }));
    const formData = new FormData();
    formData.append('mat', user.Mat);
    formData.append('photo', file);

    try {
      const res = await axios.post('http://localhost:5000/update-avatar', formData);
      user.Photo = res.data.photo;
      localStorage.setItem('user', JSON.stringify(user));
      setAvatarMessage('✅ Photo mise à jour avec succès');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setAvatarMessage('❌ Erreur lors du téléchargement');
    } finally {
      setIsLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!selected.type.match('image.*') || selected.size > 2 * 1024 * 1024) {
      setAvatarMessage('Image invalide ou trop grande');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setAvatarMessage('');
  };

  return (
    <div className="settings-dashboard">
      <aside className="settings-sidebar">
        <div className={`sidebar-item ${activeSection === 'password' ? 'active' : ''}`} onClick={() => setActiveSection('password')}>
          <FiLock />
          <span>Mot de passe</span>
        </div>
        <div className={`sidebar-item ${activeSection === 'avatar' ? 'active' : ''}`} onClick={() => setActiveSection('avatar')}>
          <FiUser />
          <span>Photo</span>
        </div>
      </aside>

      <div className="settings-content">
        {activeSection === 'password' && (
          <div className="settings-section">
            <h2><FiLock /> Modifier le mot de passe</h2>
            <form onSubmit={handleSubmit}>
              <label>Mot de passe actuel</label>
              <input type="password" name="oldPass" value={formData.oldPass} onChange={handleChange} required />

              <label>Nouveau mot de passe</label>
              <input type="password" name="newPass" value={formData.newPass} onChange={handleChange} required />

              <button className="btn btn-primary" disabled={isLoading.password}>
                <FiCheck /> Enregistrer
              </button>

              {passMessage && <div className="alert alert-info">{passMessage}</div>}
            </form>
          </div>
        )}

        {activeSection === 'avatar' && (
          <div className="settings-section">
            <h2><FiUser /> Modifier la photo</h2>
            <form onSubmit={handleAvatarUpload}>
              <div className="preview-container">
                {preview ? <img src={preview} className="preview" alt="preview" /> : <div className="preview-placeholder"><FiUser /></div>}
              </div>

              <input type="file" accept="image/*" onChange={handleFileChange} />

              <button className="btn btn-success" disabled={!preview || isLoading.avatar}>
                <FiUpload /> Enregistrer
              </button>

              {avatarMessage && <div className="alert alert-info">{avatarMessage}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
