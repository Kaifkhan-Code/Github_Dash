export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const buttonClass = 'px-3 py-1 border rounded bg-white disabled:opacity-40';

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        className={buttonClass}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
