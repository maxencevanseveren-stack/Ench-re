import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminPage.css';

function AdminPage({ socket }) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeLimit, setTimeLimit] = useState(3600);
  const [message, setMessage] = useState('');
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    // En production, implémenter une authentification plus robuste
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      setMessage('✅ Authentification réussie');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ Mot de passe incorrect');
    }
  };

  const handleReset = async () => {
    try {
      await api.post('/admin/reset', {}, {
        headers: { 'x-admin-password': adminPassword }
      });
      setMessage('✅ Cagnotte réinitialisée !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur: ' + (error.response?.data?.error || 'Erreur inconnue'));
    }
  };

  const handleSetTimeLimit = async () => {
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    
    try {
      await api.post('/admin/set-time-limit', 
        { seconds: totalSeconds },
        { headers: { 'x-admin-password': adminPassword } }
      );
      setTimeLimit(totalSeconds);
      setMessage(`✅ Délai défini à ${hours}h ${minutes}m ${seconds}s`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur: ' + (error.response?.data?.error || 'Erreur inconnue'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container admin-page">
        <div className="admin-login">
          <h2>🔐 Authentification Admin</h2>
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Mot de passe admin</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Se connecter
            </button>
          </form>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <div className="admin-panel">
        <h2>⚙️ Panneau d'Administration</h2>

        {message && <div className="message">{message}</div>}

        <div className="admin-sections">
          <div className="admin-section">
            <h3>🔄 Réinitialiser la Cagnotte</h3>
            <p>Réinitialisez la cagnotte à 0€ et effacez les contributions</p>
            <button onClick={handleReset} className="btn btn-danger">
              Réinitialiser
            </button>
          </div>

          <div className="admin-section">
            <h3>⏱️ Modifier le Délai de Contribution</h3>
            <p>Définissez le temps pendant lequel les utilisateurs peuvent contribuer</p>
            
            <div className="time-inputs">
              <div className="time-group">
                <label>Heures</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div className="time-group">
                <label>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </div>
              <div className="time-group">
                <label>Secondes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                />
              </div>
            </div>

            <button onClick={handleSetTimeLimit} className="btn btn-primary">
              Appliquer
            </button>
          </div>
        </div>

        <div className="admin-links">
          <Link to="/contribute" className="btn-link">← Retour</Link>
          <Link to="/display" className="btn-link">Affichage</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
