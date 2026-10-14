import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
  {

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
