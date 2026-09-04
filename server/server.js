import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Game from './models/Game.js';
import gamesRouter from './routes/games.js';

const app = express();
const port = process.env.PORT || 5000;

const sampleGames = [
  { title: 'Sunday Evening Cricket', sport: 'Cricket', location: 'Colombo 7', time: '5:00 PM', maxPlayers: 11 },
  { title: 'Morning Football', sport: 'Football', location: 'Negombo Beach', time: '7:00 AM', maxPlayers: 10 },
  { title: 'Volleyball at Galle Face', sport: 'Volleyball', location: 'Galle Face', time: '4:00 PM', maxPlayers: 6 },
  { title: 'Night Cricket', sport: 'Cricket', location: 'Kandy Stadium', time: '8:00 PM', maxPlayers: 11 },
  { title: 'Weekend Football', sport: 'Football', location: 'Jaffna Ground', time: '3:00 PM', maxPlayers: 12 }
];

app.use(cors());
app.use(express.json());
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
    console.log('✅ MongoDB connected');
    await seedGames();
    app.listen(port, () => console.log(`🚀 Server on port ${port}`));
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
