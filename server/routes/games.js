import express from 'express';
import Game from '../models/Game.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { gameSchema, validateRequest } from '../validation.js';

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
    const values = validateRequest(gameSchema, req, res);
    if (!values) return;
    const { title, sport, location, startTime, deadlineTime, maxPlayers } = values;
    if (deadlineTime <= new Date()) {
      return res.status(400).json({ message: 'Please choose a registration deadline in the future.', errors: { deadlineTime: 'Deadline cannot be in the past.' } });
    }
    if (startTime <= new Date()) {
      return res.status(400).json({ message: 'Please choose a start time in the future.', errors: { startTime: 'Start time cannot be in the past.' } });
    }
    if (deadlineTime >= startTime) {
      return res.status(400).json({ message: 'Registration deadline must be earlier than the start time.', errors: { deadlineTime: 'Deadline must be earlier than the start time.' } });
    }
    const game = await Game.create({ title, sport, location, startTime, deadlineTime, maxPlayers, createdBy: req.user.id, status: 'pending' });
    res.status(201).json(game);
  } catch (error) {
    const message = error.name === 'ValidationError'
      ? Object.values(error.errors).map(({ message: fieldMessage }) => fieldMessage).join(' ')
      : 'Unable to create this game right now.';
    res.status(400).json({ message });
  }
});

router.post('/:id/register', requireAuth, async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'approved',
        deadlineTime: { $gt: new Date() },
        $expr: { $lt: [{ $size: { $ifNull: ['$registeredPlayers', []] } }, '$maxPlayers'] },
        registeredPlayers: { $ne: req.user.id }
      },
      { $addToSet: { registeredPlayers: req.user.id } },
      { new: true }
    );

    if (game) {
      return res.status(201).json({
        message: 'You are registered for this game.',
        registrationCount: game.registeredPlayers.length
      });
    }

    const existingGame = await Game.findById(req.params.id).select('status deadlineTime maxPlayers registeredPlayers startTime');
    if (!existingGame) return res.status(404).json({ message: 'Game not found.' });
    if (existingGame.registeredPlayers?.some((player) => player.toString() === req.user.id)) {
      return res.status(409).json({ message: 'You are already registered for this game.' });
    }
    if (existingGame.status !== 'approved') return res.status(400).json({ message: 'This game is not open for registration.' });
    if (new Date() > existingGame.deadlineTime) return res.status(400).json({ message: 'Registration for this game has closed.' });
    if ((existingGame.registeredPlayers?.length || 0) >= existingGame.maxPlayers) {
      return res.status(400).json({ message: 'This game has reached its maximum capacity.' });
    }
    return res.status(400).json({ message: 'This game is not open for registration.' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ message: 'Game not found.' });
    res.status(500).json({ message: 'Unable to register for this game right now.' });
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
