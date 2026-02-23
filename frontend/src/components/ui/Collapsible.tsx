import { useState, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 pt-3">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 py-2"
        onClick={() => setOpen(!open)}
      >
        <span>{open ? '▼' : '▶'} {title}</span>
      </button>
      {open && <div className="mt-2 space-y-3">{children}</div>}
    </div>
  );
}
