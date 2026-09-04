import express from 'express';
import Game from '../models/Game.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load games right now.' });
  }
});

router.get('/moderation', requireAuth, requireAdmin, async (req, res) => {
  try {
    const games = await Game.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load games for moderation.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, sport, location, time, maxPlayers } = req.body;
    if (!title?.trim() || !sport || !location?.trim() || !time || maxPlayers === undefined || maxPlayers === null || maxPlayers === '') {
      return res.status(400).json({ message: 'Title, sport, location, time, and maxPlayers are required.' });
    }
    if (Number(maxPlayers) < 2) {
      return res.status(400).json({ message: 'maxPlayers must be at least 2.' });
    }
    const game = await Game.create({ title, sport, location, time, maxPlayers, createdBy: req.user.id, status: 'pending' });
    res.status(201).json(game);
  } catch (error) {
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors).map(({ message: fieldMessage }) => fieldMessage).join(' ')
      : 'Unable to create this game right now.';
    res.status(400).json({ message });
  }
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved, rejected, or pending.' });
    }
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { status, moderatedAt: new Date(), moderatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.json(game);
  } catch (error) {
    res.status(400).json({ message: 'Unable to update this game status.' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: 'Unable to delete this game.' });
  }
});

export default router;
