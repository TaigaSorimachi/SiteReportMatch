interface Props {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function StepperInput({ label, value, onChange, min = 1, max = 999, step = 1 }: Props) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-12 h-12 rounded-lg bg-gray-200 text-xl font-bold text-gray-700 active:bg-gray-300"
          onClick={() => onChange(Math.max(min, value - step))}
        >
          -
        </button>
        <span className="text-2xl font-bold min-w-[3ch] text-center">{value}</span>
        <button
          type="button"
          className="w-12 h-12 rounded-lg bg-gray-200 text-xl font-bold text-gray-700 active:bg-gray-300"
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
        <span className="text-sm text-gray-500">人</span>
      </div>
    </div>
  );
}
