interface Props {
  label: string;
  required: number;
  confirmed: number;
}

export function StaffingBar({ label, required, confirmed }: Props) {
  const pct = required > 0 ? Math.min(100, Math.round((confirmed / required) * 100)) : 100;
  const shortage = Math.max(0, required - confirmed);
  const statusIcon = shortage === 0 ? '✅' : shortage <= 2 ? '⚠️' : '🔴';

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-gray-600 w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-700 w-12 text-right">{confirmed}/{required}</span>
      <span className="w-5">{statusIcon}</span>
    </div>
  );
}
