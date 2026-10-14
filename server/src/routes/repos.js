import { Router } from 'express';
import ApiError from '../utils/ApiError.js';
import { getCached, setCached } from '../utils/cache.js';
import { searchRepositories, getRepositoryDetails } from '../services/github.js';

const router = Router();

const PER_PAGE = 10;
const GITHUB_SEARCH_LIMIT = 1000; 
const NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;


router.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) throw new ApiError(400, 'Please enter a search keyword.');
    if (q.length > 256) throw new ApiError(400, 'Search keyword is too long.');

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const sort = ['stars', 'updated'].includes(req.query.sort) ? req.query.sort : undefined;

    const cacheKey = `search:${q.toLowerCase()}:${sort}:${page}`;
    let result = getCached(cacheKey);
    const fromCache = Boolean(result);

    if (!result) {
      const data = await searchRepositories({ q, sort, page, perPage: PER_PAGE });
      result = {
        items: data.items,
        totalCount: data.totalCount,
        totalPages: Math.min(
          Math.ceil(data.totalCount / PER_PAGE),
          GITHUB_SEARCH_LIMIT / PER_PAGE
        ),
      };
      setCached(cacheKey, result);
    }

    res.json({ ...result, page, cached: fromCache });
  } catch (err) {
    next(err);
  }
});

// GET /api/repos/facebook/react
router.get('/:owner/:name', async (req, res, next) => {
  try {
    const { owner, name } = req.params;
    if (!NAME_PATTERN.test(owner) || !NAME_PATTERN.test(name)) {
      throw new ApiError(400, 'Invalid repository name.');
    }

    res.json(await getRepositoryDetails(owner, name));
  } catch (err) {
    next(err);
  }
});

export default router;
