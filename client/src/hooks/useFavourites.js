import { useCallback, useEffect, useState } from 'react';
import { getFavourites, saveFavourite, removeFavourite } from '../api.js';

export default function useFavourites() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setFavourites(await getFavourites());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isSaved = (repoId) => favourites.some((f) => f.repoId === repoId);

  async function save(repo) {
    try {
      const saved = await saveFavourite(repo);
      setFavourites((prev) => [saved, ...prev]);
      setError('');
    } catch (err) {
      // 409 means it was already saved (maybe from another tab), so just resync.
      if (err.status === 409) return load();
      setError(err.message);
    }
  }

  async function remove(repoId) {
    try {
      await removeFavourite(repoId);
      setFavourites((prev) => prev.filter((f) => f.repoId !== repoId));
      setError('');
    } catch (err) {
      if (err.status === 404) return load();
      setError(err.message);
    }
  }

  const toggle = (repo) => (isSaved(repo.id) ? remove(repo.id) : save(repo));

  return { favourites, loading, error, isSaved, save, remove, toggle };
}
