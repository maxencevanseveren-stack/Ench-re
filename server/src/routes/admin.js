const express = require('express');
const router = express.Router();

// Middleware d'authentification admin (en production, implémenter correctement)
function adminMiddleware(req, res, next) {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD || !process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Accès admin non autorisé' });
  }
  next();
}

// Réinitialiser la cagnotte
router.post('/reset', adminMiddleware, (req, res) => {
  const appState = req.app.locals.appState;
  
  appState.totalAmount = 0;
  appState.lastContributor = null;
  appState.lastContributionTime = null;
  appState.startTime = Date.now();
  appState.isActive = true;

  req.app.locals.updateAndBroadcast();

  res.json({
    success: true,
    message: 'Cagnotte réinitialisée',
    state: appState
  });
});

// Modifier le délai
router.post('/set-time-limit', adminMiddleware, (req, res) => {
  const { seconds } = req.body;
  
  if (!seconds || seconds < 0) {
    return res.status(400).json({ error: 'Délai invalide' });
  }

  const appState = req.app.locals.appState;
  appState.timeLimit = seconds;
  appState.startTime = Date.now();

  req.app.locals.updateAndBroadcast();

  res.json({
    success: true,
    timeLimit: appState.timeLimit
  });
});

// Obtenir l'état admin
router.get('/state', adminMiddleware, (req, res) => {
  const appState = req.app.locals.appState;
  const timeElapsed = (Date.now() - appState.startTime) / 1000;
  const timeRemaining = Math.max(0, appState.timeLimit - timeElapsed);

  res.json(appState);
});

module.exports = router;
