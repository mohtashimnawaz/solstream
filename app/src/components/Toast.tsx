import { useEffect } from 'react';

export function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let color = 'bg-zinc-800 border-zinc-700 text-white';
  if (type === 'success') color = 'bg-emerald-600 border-emerald-400 text-white';
  if (type === 'error') color = 'bg-red-600 border-red-400 text-white';

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg border shadow-lg transition-all animate-fade-in-up ${color}`}
      role="alert"
      aria-live="polite"
    >
      {message}
      <button
        onClick={onClose}
        className="ml-4 text-xs underline text-white/80 hover:text-white focus:outline-none"
        aria-label="Close notification"
      >
        Close
      </button>
    </div>
  );
}
