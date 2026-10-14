import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
  {
    // GitHub's own repo id. The unique index is what actually stops
    // duplicates, even if two requests arrive at the same moment.
    repoId: { type: Number, required: true, unique: true },
    fullName: { type: String, required: true },
    owner: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: { type: String, default: '' },
    htmlUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Favourite', favouriteSchema);
