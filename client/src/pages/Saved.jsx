import { Link } from 'react-router-dom';
import useFavourites from '../hooks/useFavourites.js';
import RepoCard from '../components/RepoCard.jsx';
import { Spinner, ErrorBox } from '../components/Status.jsx';

export default function Saved() {
  const { favourites, loading, error, remove } = useFavourites();


  const handleToggle = (repo) => remove(repo.repoId);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Saved repositories</h1>

      {loading && <Spinner />}
      {error && <ErrorBox message={error} />}

      {!loading && !error && favourites.length === 0 && (
        <p className="text-slate-500 py-8 text-center">
          Nothing saved yet.{' '}
          <Link to="/" className="text-blue-600 underline">
            Search for a repository
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {favourites.map((fav) => (
          <RepoCard key={fav.repoId} repo={fav} saved onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}
