// ✅ fichier : components/Admin/DashboardStats/DashboardStats.jsx

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from '../../../services/api';
import './DashboardStats.css';

function DashboardStats({ setActivePage }) {
  const [dataRes, setDataRes] = useState([]);
  const [dataRetour, setDataRetour] = useState([]);
  const [counters, setCounters] = useState({
    livres: 0,
    stagiaires: 0,
    formateurs: 0,
    reservations: 0,
    besoins: 0
  });

  useEffect(() => {
    api.get('/dashboard-stats')
      .then(res => {
        const stats = res.data;

        setDataRes([
          { name: 'En Attente', value: stats.reservations.en_attente },
          { name: 'Réservé', value: stats.reservations.reserve },
          { name: 'Annulée', value: stats.reservations.annulée }
        ]);

        setDataRetour([
          { name: 'Bon État', value: stats.rendu.bon },
          { name: 'Abîmé', value: stats.rendu.abime }
        ]);

        setCounters(stats.counters || {});
      })
      .catch(err => console.error(err));
  }, []);

  const COLORS = ['#28a745', '#dc3545'];

  return (
    <div className="dashboard-stats">
      <h2 className="mb-4">📊 Statistiques des Réservations (28 derniers jours)</h2>

      <div className="counters-table">
        <h4>📌 Données Générales</h4>
        <table className="clickable-table">
          <thead>
            <tr>
              <th onClick={() => setActivePage('books')}>Livres</th>
              <th onClick={() => setActivePage('utilisateurs')}>Stagiaires</th>
              <th onClick={() => setActivePage('utilisateurs')}>Formateurs</th>
              <th onClick={() => setActivePage('reservations')}>Réservations</th>
              <th onClick={() => setActivePage('besoins')}>Besoins</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{counters.livres}</td>
              <td>{counters.stagiaires}</td>
              <td>{counters.formateurs}</td>
              <td>{counters.reservations}</td>
              <td>{counters.besoins}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h4>Réservations</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataRes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>Livres Rendus</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataRetour}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dataRetour.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
