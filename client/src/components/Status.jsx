export function Spinner({ label = 'Loading...' }) {
  return <p className="text-slate-500 py-8 text-center">{label}</p>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 my-4">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 underline text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
