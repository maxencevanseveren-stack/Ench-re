import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './DisplayPage.css';

function DisplayPage({ socket }) {
  const [state, setState] = useState({
    totalAmount: 0,
    lastContributor: null,
    lastContributionTime: null,
    timeRemaining: 0,
    isActive: false
  });

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
          lastContributionTime: newState.lastContributionTime,
          isActive: newState.isActive,
          timeRemaining: Math.max(0, newState.timeLimit - ((Date.now() - newState.startTime) / 1000))
        }));
      });
    }

    // Mettre à jour chaque seconde
    const interval = setInterval(loadState, 1000);
    return () => clearInterval(interval);
  }, [socket]);

  const loadState = async () => {
    try {
      const response = await api.get('/cagnotte/state');
      setState(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR');
  };

  return (
    <div className="display-page">
      <div className="display-container">
        <div className="display-content">
          <h1 className="display-title">💰 CAGNOTTE</h1>
          
          <div className="amount-display">
            <div className="amount-box">
              <div className="amount-value">{state.totalAmount}</div>
              <div className="amount-currency">€</div>
            </div>
          </div>

          <div className="last-info">
            {state.lastContributor ? (
              <>
                <p className="last-label">Dernier contributeur</p>
                <p className="last-name">{state.lastContributor}</p>
                <p className="last-time">
                  {formatDate(state.lastContributionTime)}
                </p>
              </>
            ) : (
              <p className="no-contribution">En attente du premier contributeur...</p>
            )}
          </div>

          {!state.isActive && (
            <div className="inactive-message">
              ⏰ Délai de contribution dépassé
            </div>
          )}
        </div>

        <div className="bottom-links">
          <Link to="/contribute" className="btn-link">Contribuer</Link>
          <Link to="/admin" className="btn-link">Admin</Link>
        </div>
      </div>
    </div>
  );
}

export default DisplayPage;
