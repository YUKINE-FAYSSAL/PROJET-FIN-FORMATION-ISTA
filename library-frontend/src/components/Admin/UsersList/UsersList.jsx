import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import Footer from '../../Footer/Footer';
import './UsersList.css';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [filtreFiliere, setFiltreFiliere] = useState('');
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    Mat: '',
    Nom: '',
    Prenom: '',
    CodeFil: '',
    Groupe: '',
    Niveau: '',
    Role: 'stagiaire',
    Tel: '',
    Motdepasse: '',
    DateNaissance: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/emprunteurs')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  const filieres = [...new Set(users.map(u => (u.CodeFil || '').toUpperCase()).filter(Boolean))];

  const usersFiltres = filtreFiliere
    ? filtreFiliere === '__none__'
      ? users.filter(u => !u.CodeFil)
      : users.filter(u => (u.CodeFil || '').toLowerCase() === filtreFiliere.toLowerCase())
    : users;

  const filteredBySearch = usersFiltres.filter(u =>
    u.Nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.Prenom?.toLowerCase().includes(search.toLowerCase()) ||
    u.Mat?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = (type) => {
    if (!file) {
      alert("Veuillez sélectionner un fichier à importer.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const url = type === 'excel' ? '/import-excel-users' : '/import-json-users';

    api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        alert(res.data.message);
        fetchUsers();
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de l'import.");
      });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    api.post('/add-user', form)
      .then(res => {
        alert(res.data.message);
        setForm({
          Mat: '',
          Nom: '',
          Prenom: '',
          CodeFil: '',
          Groupe: '',
          Niveau: '',
          Role: 'stagiaire',
          Tel: '',
          Motdepasse: '',
          DateNaissance: ''
        });
        fetchUsers();
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de l'ajout de l'utilisateur");
      });
  };

  return (
    <div className="userslist-container">
      <h2 className="mb-4 text-center">Gestion des Utilisateurs</h2>

      <div className="filters-import d-flex justify-content-between mb-4">
        <div>
          <label>🎯 Filtrer par Filière :</label>
          <select
            className="form-select mt-1"
            value={filtreFiliere}
            onChange={(e) => setFiltreFiliere(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            <option value="__none__">Sans filière</option>
            {filieres.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="d-flex gap-2 align-items-end">
          <input
            type="file"
            className="form-control"
            accept=".xlsx,.json"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button className="btn btn-primary" onClick={() => handleImport('excel')}>📥 Import Excel</button>
          <button className="btn btn-secondary" onClick={() => handleImport('json')}>📥 Import JSON</button>
        </div>
      </div>

      <form onSubmit={handleAddUser} className="user-form mb-4">
        <h5 className="mb-3">➕ Ajouter un utilisateur</h5>
        <div className="row g-3">
          {[
            { label: "Matricule", name: "Mat" },
            { label: "Nom", name: "Nom" },
            { label: "Prénom", name: "Prenom" },
            { label: "Filière", name: "CodeFil" },
            { label: "Groupe", name: "Groupe" },
            { label: "Niveau", name: "Niveau" },
            { label: "Téléphone", name: "Tel" },
            { label: "Mot de passe (Date naissance)", name: "Motdepasse" },
            { label: "Date de naissance", name: "DateNaissance", type: 'date' }
          ].map(({ label, name, type }) => (
            <div className="col-md-3" key={name}>
              <label>{label}</label>
              <input
                type={type || "text"}
                className="form-control"
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                required
              />
            </div>
          ))}

          <div className="col-md-3">
            <label>Rôle</label>
            <select
              className="form-select"
              value={form.Role}
              onChange={(e) => setForm({ ...form, Role: e.target.value })}
            >
              <option value="stagiaire">Stagiaire</option>
              <option value="formateur">Formateur</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button className="btn btn-success mt-3" type="submit">✅ Ajouter</button>
      </form>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Rechercher par nom, prénom ou matricule"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Filière</th>
              <th>Groupe</th>
              <th>Niveau</th>
              <th>Rôle</th>
              <th>Téléphone</th>
              <th>Date naissance</th>
            </tr>
          </thead>
          <tbody>
            {filteredBySearch.length > 0 ? (
              filteredBySearch.map(u => (
                <tr key={u.Mat}>
                  <td>{u.Mat}</td>
                  <td>{u.Nom}</td>
                  <td>{u.Prenom}</td>
                  <td>{u.CodeFil || '—'}</td>
                  <td>{u.Groupe || '—'}</td>
                  <td>{u.Niveau || '—'}</td>
                  <td>{u.TypeEmploye || u.Role || '—'}</td>
                  <td>{u.Tel || '—'}</td>
                  <td>{u.Motdepasse || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">Aucun utilisateur trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}

export default UsersList;
