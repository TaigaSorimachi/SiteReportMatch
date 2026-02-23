interface Props {
  distanceMeters: number | null;
  isInside: boolean;
  projectName?: string | null;
}

export function GeofenceIndicator({ distanceMeters, isInside, projectName }: Props) {
  return (
    <div className={`rounded-lg p-3 text-sm ${isInside ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
      {projectName && <p className="font-medium text-gray-900 mb-1">📌 {projectName}</p>}
      <p className={isInside ? 'text-green-700' : 'text-orange-700'}>
        📍 現場から {distanceMeters != null ? `${Math.round(distanceMeters)}m` : '不明'}
        （{isInside ? '圏内 ✅' : '圏外 ⚠️'}）
      </p>
    </div>
  );
}
