const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware d'authentification
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// Obtenir l'état actuel
router.get('/state', (req, res) => {
  const appState = req.app.locals.appState;
  const timeElapsed = (Date.now() - appState.startTime) / 1000;
  const timeRemaining = Math.max(0, appState.timeLimit - timeElapsed);

  res.json({
    totalAmount: appState.totalAmount,
    lastContributor: appState.lastContributor,
    lastContributionTime: appState.lastContributionTime,
    timeLimit: appState.timeLimit,
    timeRemaining,
    isActive: appState.isActive && timeRemaining > 0
  });
});

// Ajouter 5€
router.post('/contribute', authMiddleware, (req, res) => {
  const appState = req.app.locals.appState;
  const timeElapsed = (Date.now() - appState.startTime) / 1000;
  const timeRemaining = appState.timeLimit - timeElapsed;

  // Vérifier si on peut contribuer
  if (!appState.isActive || timeRemaining <= 0) {
    return res.status(400).json({ 
      error: 'Le délai pour contribuer est dépassé',
      timeRemaining: Math.max(0, timeRemaining)
    });
  }

  // Ajouter à la cagnotte
  appState.totalAmount += 5;
  appState.lastContributor = req.email;
  appState.lastContributionTime = new Date();

  // Diffuser la mise à jour
  req.app.locals.updateAndBroadcast();

  res.json({
    success: true,
    totalAmount: appState.totalAmount,
    lastContributor: appState.lastContributor
  });
});

// Vérifier si l'utilisateur peut contribuer
router.get('/can-contribute', authMiddleware, (req, res) => {
  const appState = req.app.locals.appState;
  const timeElapsed = (Date.now() - appState.startTime) / 1000;
  const timeRemaining = appState.timeLimit - timeElapsed;
  const canContribute = appState.isActive && timeRemaining > 0;

  res.json({
    canContribute,
    timeRemaining: Math.max(0, timeRemaining),
    totalAmount: appState.totalAmount,
    lastContributor: appState.lastContributor
  });
});

module.exports = router;
