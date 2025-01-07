import mongoose from 'mongoose';

const PetMetricsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  deathCount: {
    type: Number,
    default: 0,
  },
  interactions: {
    feed: { type: Number, default: 0 },
    play: { type: Number, default: 0 },
    heal: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  // Easy to add more metrics here later
  additionalMetrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Ensure model is only created once
export const PetMetrics = mongoose.models.PetMetrics || 
  mongoose.model('PetMetrics', PetMetricsSchema); 