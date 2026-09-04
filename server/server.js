import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Game from './models/Game.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import authRouter from './routes/auth.js';
import gamesRouter from './routes/games.js';
import usersRouter from './routes/users.js';

const app = express();
const port = process.env.PORT || 5000;
const adminUsername = process.env.ADMIN_USERNAME || 'admin123';
const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

const sampleGames = [
  { title: 'Sunday Evening Cricket', sport: 'Cricket', location: 'Colombo 7', time: '5:00 PM', maxPlayers: 11 },
  { title: 'Morning Football', sport: 'Football', location: 'Negombo Beach', time: '7:00 AM', maxPlayers: 10 },
  { title: 'Volleyball at Galle Face', sport: 'Volleyball', location: 'Galle Face', time: '4:00 PM', maxPlayers: 6 },
  { title: 'Night Cricket', sport: 'Cricket', location: 'Kandy Stadium', time: '8:00 PM', maxPlayers: 11 },
  { title: 'Weekend Football', sport: 'Football', location: 'Jaffna Ground', time: '3:00 PM', maxPlayers: 12 }
];

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/games', gamesRouter);

async function seedGames() {
  const gameCount = await Game.countDocuments();
  if (gameCount === 0) {
    await Game.insertMany(sampleGames);
    console.log('Added sample Sri Lankan games.');
  }
}

async function seedAdmin() {
  const existingAdmin = await User.findOne({ username: adminUsername });
  if (!existingAdmin) {
    await User.create({
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'admin'
    });
    console.log('Created the configured administrator account.');
  } else if (existingAdmin.role !== 'admin') {
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log('Promoted the configured administrator account.');
  }
}

async function startServer() {
  if (!process.env.JWT_SECRET) {
    console.error('Server startup failed: JWT_SECRET is required.');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('Server startup failed: MONGO_URI is required.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    await seedGames();
    await seedAdmin();
  } catch (error) {
    console.error('MongoDB startup failed:', error.message);
    process.exit(1);
  }

  const server = app.listen(port, () => console.log(`🚀 Server on port ${port}`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Server startup failed: port ${port} is already in use.`);
    } else {
      console.error('Server startup failed:', error.message);
    }
    process.exit(1);
  });
}

startServer();
