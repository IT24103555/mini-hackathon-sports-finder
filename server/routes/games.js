import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ time: 1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load games right now.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, sport, location, time, maxPlayers } = req.body || {};
    const validSports = ['Cricket', 'Football', 'Volleyball'];
    const parsedTime = new Date(time);
    const parsedPlayers = Number(maxPlayers);

    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 80) {
      return res.status(400).json({ message: 'Title must be between 3 and 80 characters.' });
    }
    if (!validSports.includes(sport)) {
      return res.status(400).json({ message: 'Choose Cricket, Football, or Volleyball.' });
    }
    if (typeof location !== 'string' || location.trim().length < 3 || location.trim().length > 120) {
      return res.status(400).json({ message: 'Location must be between 3 and 120 characters.' });
    }
    if (!time || Number.isNaN(parsedTime.getTime()) || parsedTime <= new Date()) {
      return res.status(400).json({ message: 'Choose a valid future date and time.' });
    }
    if (!Number.isInteger(parsedPlayers) || parsedPlayers < 2 || parsedPlayers > 50) {
      return res.status(400).json({ message: 'Maximum players must be a whole number from 2 to 50.' });
    }

    const game = await Game.create({ title, sport, location, time, maxPlayers });
    res.status(201).json(game);
  } catch (error) {
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors).map(({ message: fieldMessage }) => fieldMessage).join(' ')
      : 'Unable to create this game right now.';
    res.status(400).json({ message });
  }
});

export default router;
