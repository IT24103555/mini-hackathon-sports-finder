import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['Cricket', 'Football', 'Volleyball']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model('Game', gameSchema);
