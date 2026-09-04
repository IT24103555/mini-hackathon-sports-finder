import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Game from './models/Game.js';
import gamesRouter from './routes/games.js';

const app = express();
const port = process.env.PORT || 5000;

const sampleGames = [
  { title: 'Saturday Turf Cricket', sport: 'Cricket', location: 'Colombo Racecourse', time: '2026-09-05T07:00:00.000Z', maxPlayers: 12 },
  { title: 'Galle Face 5-a-side', sport: 'Football', location: 'Galle Face Green, Colombo', time: '2026-09-05T16:30:00.000Z', maxPlayers: 10 },
  { title: 'Kandy Evening Volleyball', sport: 'Volleyball', location: 'Bogambara Grounds, Kandy', time: '2026-09-06T10:00:00.000Z', maxPlayers: 12 },
  { title: 'Negombo Beach Cricket', sport: 'Cricket', location: 'Negombo Beach Park', time: '2026-09-06T03:30:00.000Z', maxPlayers: 14 },
  { title: 'Rugby Grounds Football', sport: 'Football', location: 'Nawaloka Grounds, Colombo', time: '2026-09-07T11:00:00.000Z', maxPlayers: 14 },
  { title: 'Matara Weekend Volley', sport: 'Volleyball', location: 'Matara Public Grounds', time: '2026-09-08T09:30:00.000Z', maxPlayers: 10 }
];

const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({ origin: allowedOrigin || true }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/games', gamesRouter);

async function seedGames() {
  const gameCount = await Game.countDocuments();
  if (gameCount === 0) {
    await Game.insertMany(sampleGames);
    console.log('Added sample Sri Lankan games.');
  }
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await seedGames();
    app.listen(port, () => console.log(`Sports Finder API running on port ${port}`));
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
