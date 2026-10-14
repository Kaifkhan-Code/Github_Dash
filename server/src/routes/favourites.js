import { Router } from 'express';
import Favourite from '../models/Favourite.js';
import ApiError from '../utils/ApiError.js';

const router = Router();

// GET /api/favourites
router.get('/', async (req, res, next) => {
  try {
    const favourites = await Favourite.find().sort({ createdAt: -1 });
    res.json(favourites);
  } catch (err) {
    next(err);
  }
});

// POST /api/favourites
router.post('/', async (req, res, next) => {
  try {
    const { repoId, fullName, owner, name, description, stars, forks, language, htmlUrl } = req.body;

    if (!Number.isInteger(repoId) || !fullName || !owner || !name) {
      throw new ApiError(400, 'repoId, fullName, owner and name are required.');
    }

    const favourite = await Favourite.create({
      repoId, fullName, owner, name, description, stars, forks, language, htmlUrl,
    });
    res.status(201).json(favourite);
  } catch (err) {
    // 11000 = unique index violation, so this repo is already saved.
    if (err.code === 11000) {
      return next(new ApiError(409, 'This repository is already in your favourites.'));
    }
    next(err);
  }
});

// DELETE /api/favourites/:repoId
router.delete('/:repoId', async (req, res, next) => {
  try {
    const repoId = Number(req.params.repoId);
    if (!Number.isInteger(repoId)) throw new ApiError(400, 'Invalid repository id.');

    const removed = await Favourite.findOneAndDelete({ repoId });
    if (!removed) throw new ApiError(404, 'That repository is not in your favourites.');

    res.json({ message: 'Removed from favourites.' });
  } catch (err) {
    next(err);
  }
});

export default router;
