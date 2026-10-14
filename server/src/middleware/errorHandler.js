import ApiError from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} does not exist.`));
}


export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, ...err.extra });
  }

  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }

  
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}
