import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContributePage from './pages/ContributePage';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';

// Services
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }

    // Connecter Socket.io
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <h1 className="logo">💰 Enchère</h1>
            <div className="nav-links">
              {user ? (
                <>
                  <span className="user-name">Bienvenue, {user.username}</span>
                  <button onClick={handleLogout} className="btn btn-logout">
                    Déconnexion
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
          <Route
            path="/contribute"
            element={user ? <ContributePage socket={socket} /> : <Navigate to="/login" />}
          />
          <Route
            path="/display"
            element={<DisplayPage socket={socket} />}
          />
          <Route
            path="/admin"
            element={<AdminPage socket={socket} />}
          />
          <Route path="/" element={user ? <Navigate to="/contribute" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
