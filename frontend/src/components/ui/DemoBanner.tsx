import { isDemoMode } from '@/lib/demo';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div className="bg-amber-500 text-white text-center text-xs py-1 px-2 font-medium sticky top-0 z-50">
      デモモード - データはモックです。変更は保存されません。
    </div>
  );
}
