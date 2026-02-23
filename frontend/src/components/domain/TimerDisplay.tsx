import { formatTimer } from '@/lib/utils';

interface Props {
  seconds: number;
  label?: string;
}

export function TimerDisplay({ seconds, label = '作業中' }: Props) {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-500 mb-2">⏱ {label}</p>
      <div className="bg-gray-50 rounded-2xl py-6 px-8 inline-block">
        <span className="text-4xl font-mono font-bold text-gray-900 tracking-wider">
          {formatTimer(seconds)}
        </span>
      </div>
    </div>
  );
}
