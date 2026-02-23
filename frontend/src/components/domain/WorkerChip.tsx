interface Props {
  name: string;
  rating?: number;
  workType?: string;
  avatarUrl?: string | null;
  onClick?: () => void;
}

export function WorkerChip({ name, rating, workType, avatarUrl, onClick }: Props) {
  return (
    <button
      className="flex flex-col items-center gap-1 min-w-[72px] p-2 rounded-xl border border-gray-200 active:bg-gray-50"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
      <span className="text-xs font-medium text-gray-900 truncate w-full text-center">{name}</span>
      {rating != null && <span className="text-xs text-amber-500">★{rating.toFixed(1)}</span>}
      {workType && <span className="text-xs text-gray-500 truncate w-full text-center">{workType}</span>}
    </button>
  );
}
