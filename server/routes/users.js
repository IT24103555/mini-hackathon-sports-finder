import express from 'express';
import User from '../models/User.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
  const users = await User.find().select('username role createdAt').sort({ createdAt: -1 });
  res.json(users);
});

router.delete('/:id', async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;