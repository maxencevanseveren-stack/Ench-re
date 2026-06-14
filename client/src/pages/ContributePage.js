import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ContributePage.css';

function ContributePage({ socket }) {
  const [state, setState] = useState({
    totalAmount: 0,
    lastContributor: null,
    timeRemaining: 0,
    canContribute: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Charger l'état initial
    loadState();

    // S'abonner aux mises à jour WebSocket
    if (socket) {
      socket.on('state-update', (newState) => {
        setState((prev) => ({
          ...prev,
          totalAmount: newState.totalAmount,
          lastContributor: newState.lastContributor,
          timeRemaining: Math.max(0, newState.timeLimit - ((Date.now() - newState.startTime) / 1000))
        }));
      });
    }

    // Mettre à jour le temps restant chaque seconde
    const interval = setInterval(loadState, 1000);
    return () => clearInterval(interval);
  }, [socket]);

  const loadState = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cagnotte/can-contribute', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setState(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleContribute = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/cagnotte/contribute', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('✅ Contribution de 5€ ajoutée !');
      setState((prev) => ({
        ...prev,
        totalAmount: response.data.totalAmount,
        lastContributor: response.data.lastContributor
      }));

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Erreur'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container contribute-page">
      <div className="page-header">
        <h1>💰 Contribuer à la Cagnotte</h1>
        <p>Aidez-nous à atteindre notre objectif !</p>
      </div>

      <div className="contribute-content">
        <div className="contribute-card">
          <div className="total-amount">
            <span className="label">Cagnotte Actuelle</span>
            <span className="amount">{state.totalAmount}€</span>
          </div>

          {state.lastContributor && (
            <div className="last-contributor">
              <p>Dernier contributeur: <strong>{state.lastContributor}</strong></p>
            </div>
          )}

          <div className="time-info">
            <p>Temps restant: <strong>{formatTime(state.timeRemaining)}</strong></p>
          </div>

          {message && <div className="message">{message}</div>}

          <button
            onClick={handleContribute}
            disabled={loading || !state.canContribute}
            className="btn btn-contribute"
          >
            {loading ? 'Traitement...' : '+5€'}
          </button>

          {!state.canContribute && state.timeRemaining <= 0 && (
            <p className="deadline-expired">La période de contribution est terminée</p>
          )}
        </div>

        <div className="links">
          <Link to="/display" className="link-btn">📊 Voir le tableau de bord</Link>
          <Link to="/admin" className="link-btn">⚙️ Administration</Link>
        </div>
      </div>
    </div>
  );
}

export default ContributePage;
