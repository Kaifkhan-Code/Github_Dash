import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import repoRoutes from './routes/repos.js';
import favouriteRoutes from './routes/favourites.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/repos', repoRoutes);
app.use('/api/favourites', favouriteRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;