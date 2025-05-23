import React, { useState } from 'react';
import api from '../../../services/api';
import './UpdateAvatar.css';

const UpdateAvatar = () => {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMsg("Veuillez sélectionner une image.");

    const formData = new FormData();
    formData.append('mat', user.Mat);
    formData.append('photo', file);

    try {
      const res = await api.post('/update-avatar', formData);
      setMsg(res.data.message);

      // 🔄 mise à jour locale
      user.Photo = res.data.photo;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.reload();
    } catch (err) {
      setMsg('❌ Erreur lors du téléchargement');
    }
  };

  return (
    <div className="update-avatar-container">
      <h3>🖼️ Changer ma photo de profil</h3>
      <form onSubmit={handleUpload} className="update-avatar-form">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="form-control"
          required
        />
        <button type="submit" className="btn btn-primary mt-2">Mettre à jour</button>
        {msg && <div className="alert alert-info mt-2">{msg}</div>}
      </form>
    </div>
  );
};

export default UpdateAvatar;
