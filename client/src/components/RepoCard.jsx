import { Link } from 'react-router-dom';
import { formatCount } from '../utils/format.js';


export default function RepoCard({ repo, saved, onToggle }) {
  return (
    <div className="bg-white border rounded-lg p-4 flex justify-between gap-4">
      <div className="min-w-0">
        <Link
          to={`/repo/${repo.owner}/${repo.name}`}
          className="font-semibold text-blue-600 hover:underline break-all"
        >
          {repo.fullName}
        </Link>
        <p className="text-sm text-slate-600 mt-1">
          {repo.description || 'No description provided.'}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3">
          <span>★ {formatCount(repo.stars)}</span>
          <span>⑂ {formatCount(repo.forks)}</span>
          {repo.language && <span>{repo.language}</span>}
        </div>
      </div>

      <button
        onClick={() => onToggle(repo)}
        className={`self-start shrink-0 text-sm px-3 py-1 rounded border ${
          saved ? 'bg-yellow-100 border-yellow-300' : 'hover:bg-slate-100'
        }`}
      >
        {saved ? 'Saved ✓' : 'Save'}
      </button>
    </div>
  );
}
