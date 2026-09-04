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
    const { title, sport, location, time, maxPlayers } = req.body;
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
