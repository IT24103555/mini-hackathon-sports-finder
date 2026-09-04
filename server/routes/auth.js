import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign({ id: user._id.toString(), username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

function publicUser(user) {
  return { id: user._id, username: user.username, role: user.role };
}

async function login(req, res, expectedRole) {
  const { username, password } = req.body;
  if (!username?.trim() || !password) return res.status(400).json({ message: 'Username and password are required.' });

  const user = await User.findOne({ username: username.trim() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  if (expectedRole && user.role !== expectedRole) return res.status(403).json({ message: 'This account is not authorized for administrator access.' });

  res.json({ token: createToken(user), user: publicUser(user) });
}

router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    if (!username?.trim() || !password || !confirmPassword) return res.status(400).json({ message: 'Username, password, and confirmation are required.' });
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) return res.status(400).json({ message: 'Username must be 3-30 characters using letters, numbers, or underscores.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
    if (await User.exists({ username: username.trim() })) return res.status(409).json({ message: 'That username is already taken.' });

    const user = await User.create({ username: username.trim(), passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to register right now.' });
  }
});

router.post('/login', (req, res) => login(req, res));
router.post('/admin/login', (req, res) => login(req, res, 'admin'));

export default router;