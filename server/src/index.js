const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const cagnotteRoutes = require('./routes/cagnotte');
const adminRoutes = require('./routes/admin');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cagnotte', cagnotteRoutes);
app.use('/api/admin', adminRoutes);

// État global de l'application
let appState = {
  totalAmount: 0,
  lastContributor: null,
  lastContributionTime: null,
  timeLimit: 3600, // 1 heure en secondes
  startTime: Date.now(),
  isActive: true
};

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Nouvel utilisateur connecté:', socket.id);
  
  // Envoyer l'état actuel au client
  socket.emit('state-update', appState);
  
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Fonction pour mettre à jour et diffuser l'état
function updateAndBroadcast() {
  io.emit('state-update', appState);
}

// Exporter pour utilisation dans les routes
app.locals.appState = appState;
app.locals.updateAndBroadcast = updateAndBroadcast;
app.locals.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, io, appState };
