import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageContainer({ children, className = '', noPadding = false }: Props) {
  return (
    <div className={`max-w-lg mx-auto pb-20 ${noPadding ? '' : 'px-4 py-4'} ${className}`}>
      {children}
    </div>
  );
}
