import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import playerRoutes from './routes/player.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    game: 'HUKUM 2: The Sniper Protocol',
    database: 'Render PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Mount Game API Routes
app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// In production, serve the built static Vite frontend
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (_req, res, next) => {
  // If request starts with /api, pass to 404 handler
  if (_req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🔥 HUKUM 2: The Sniper Protocol - Server Active 🔥`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`💾 Database: Render PostgreSQL`);
  console.log(`🕶️  "Alapara Kelapparom!"`);
  console.log(`=======================================================`);
});
