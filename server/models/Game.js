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
    type: String
  },
  startTime: {
    type: Date,
    required: true
  },
  deadlineTime: {
    type: Date,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2
  },
  registeredPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatedAt: Date,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

gameSchema.pre('validate', function validateEventTimes(next) {
  if (this.startTime && this.deadlineTime && this.deadlineTime >= this.startTime) {
    this.invalidate('deadlineTime', 'Registration deadline must be earlier than the start time.');
  }
  next();
});

export default mongoose.model('Game', gameSchema);
