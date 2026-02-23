import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface Props {
  status: string;
  className?: string;
}

export function Badge({ status, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
}
