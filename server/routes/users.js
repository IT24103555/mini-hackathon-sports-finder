import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { roleSchema, validateRequest } from '../validation.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
  const users = await User.find().select('username role createdAt').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/:id/role', async (req, res) => {
  const values = validateRequest(roleSchema, req, res);
  if (!values) return;
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'User id must be valid.' });
  const { role } = values;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.username === 'admin123') return res.status(403).json({ message: 'The root administrator cannot be modified.' });

  user.role = role;
  await user.save();
  res.json({ id: user._id, username: user.username, role: user.role, createdAt: user.createdAt });
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'User id must be valid.' });
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.username === 'admin123') return res.status(403).json({ message: 'The root administrator cannot be deleted.' });
  await user.deleteOne();
  res.status(204).end();
});

export default router;