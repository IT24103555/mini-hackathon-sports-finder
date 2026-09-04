import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 80
  },
  sport: {
    type: String,
    required: true,
    enum: ['Cricket', 'Football', 'Volleyball']
  },
  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 120
  },
  time: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value > new Date(),
      message: 'Game time must be in the future.'
    }
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 50,
    validate: {
      validator: Number.isInteger,
      message: 'Maximum players must be a whole number.'
    }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model('Game', gameSchema);
