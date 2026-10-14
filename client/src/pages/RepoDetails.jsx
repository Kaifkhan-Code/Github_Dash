import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRepo } from '../api.js';
import useFavourites from '../hooks/useFavourites.js';
import { Spinner, ErrorBox } from '../components/Status.jsx';
import { formatCount, formatDate } from '../utils/format.js';

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded p-3 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export default function RepoDetails() {
  const { owner, name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryAt, setRetryAt] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const favs = useFavourites();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setRetryAt('');
    setData(null);

    getRepo(owner, name, controller.signal)
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setRetryAt(err.retryAt || '');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [owner, name, retryCount]);

  if (loading) return <Spinner label="Loading repository..." />;

  if (error) {
    return (
      <div>
        <ErrorBox
          message={error}
          retryAt={retryAt}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
        <Link to="/" className="text-blue-600 underline">
          Back to search
        </Link>
      </div>
    );
  }

  const { repo, commits, contributors } = data;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
        &larr; Back
      </button>

      <section className="bg-white border rounded-lg p-5">
        <div className="flex justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold break-all">{repo.fullName}</h1>
            <p className="text-slate-600 mt-1">{repo.description || 'No description provided.'}</p>
          </div>
          <button
            onClick={() => favs.toggle(repo)}
            className={`self-start shrink-0 text-sm px-3 py-1 rounded border ${
              favs.isSaved(repo.id) ? 'bg-yellow-100 border-yellow-300' : 'hover:bg-slate-100'
            }`}
          >
            {favs.isSaved(repo.id) ? 'Saved ✓' : 'Save'}
          </button>
        </div>

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {repo.topics.map((topic) => (
              <span key={topic} className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1">
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat label="Stars" value={formatCount(repo.stars)} />
          <Stat label="Forks" value={formatCount(repo.forks)} />
          <Stat label="Open issues" value={formatCount(repo.openIssues)} />
          <Stat label="Language" value={repo.language || 'n/a'} />
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Created {formatDate(repo.createdAt)} · Last updated {formatDate(repo.updatedAt)}
          {repo.license && ` · ${repo.license}`}
          {' · '}
          <a href={repo.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            View on GitHub
          </a>
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="font-semibold mb-2">Latest commits</h2>
          {commits.length === 0 ? (
            <p className="text-sm text-slate-500">No commits to show.</p>
          ) : (
            <ul className="space-y-2">
              {commits.map((c) => (
                <li key={c.sha} className="bg-white border rounded p-3 text-sm">
                  <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {c.message}
                  </a>
                  <div className="text-xs text-slate-500 mt-1">
                    {c.author} · {formatDate(c.date)} · {c.sha.slice(0, 7)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-semibold mb-2">Top contributors</h2>
          {contributors.length === 0 ? (
            <p className="text-sm text-slate-500">No contributors to show.</p>
          ) : (
            <ul className="space-y-2">
              {contributors.map((c) => (
                <li key={c.login} className="bg-white border rounded p-3 flex items-center gap-3 text-sm">
                  <img src={c.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline flex-1">
                    {c.login}
                  </a>
                  <span className="text-slate-500">{formatCount(c.contributions)} commits</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
