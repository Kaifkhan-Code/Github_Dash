import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRepos } from '../api.js';
import useFavourites from '../hooks/useFavourites.js';
import RepoCard from '../components/RepoCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { Spinner, ErrorBox } from '../components/Status.jsx';

export default function Search() {
  // The search state lives in the URL, so refreshing or sharing the
  // link keeps the same results.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'stars';
  const page = Number(params.get('page')) || 1;

  const [input, setInput] = useState(q);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryAt, setRetryAt] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const favs = useFavourites();

  useEffect(() => {
    if (!q) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');
    setRetryAt('');

    searchRepos({ q, sort, page }, controller.signal)
      .then(setData)
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setData(null);
        setError(err.message);
        setRetryAt(err.retryAt || '');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // If the params change before the request finishes, cancel it.
    return () => controller.abort();
  }, [q, sort, page, retryCount]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) setParams({ q: trimmed, sort, page: 1 });
  }

  function handleSortChange(e) {
    setParams({ q, sort: e.target.value, page: 1 });
  }

  function handlePageChange(newPage) {
    setParams({ q, sort, page: newPage });
    window.scrollTo({ top: 0 });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search public repositories..."
          className="flex-1 min-w-[200px] border rounded px-3 py-2"
        />
        <select value={sort} onChange={handleSortChange} className="border rounded px-2 py-2 bg-white">
          <option value="stars">Most stars</option>
          <option value="updated">Recently updated</option>
        </select>
        <button className="bg-slate-800 text-white rounded px-4 py-2">Search</button>
      </form>

      {favs.error && <ErrorBox message={favs.error} />}
      {error && (
        <ErrorBox
          message={error}
          retryAt={retryAt}
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      )}
      {loading && <Spinner label="Searching GitHub..." />}

      {!loading && !q && (
        <p className="text-slate-500 text-center py-8">Type a keyword to find repositories.</p>
      )}

      {!loading && data && data.items.length === 0 && (
        <p className="text-slate-500 text-center py-8">
          No repositories found for &ldquo;{q}&rdquo;. Try a different keyword.
        </p>
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-3">
            {data.totalCount.toLocaleString()} repositories found
          </p>
          <div className="space-y-3">
            {data.items.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                saved={favs.isSaved(repo.id)}
                onToggle={favs.toggle}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
