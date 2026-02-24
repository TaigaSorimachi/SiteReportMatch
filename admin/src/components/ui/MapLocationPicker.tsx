import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet デフォルトアイコン修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LatLng {
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  value?: LatLng | null;
  onChange: (latlng: LatLng) => void;
  onAddressResolved?: (address: string) => void;
}

function MapClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapUpdater({ center }: { center: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 16);
    }
  }, [center, map]);
  return null;
}

export default function MapLocationPicker({ value, onChange, onAddressResolved }: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const defaultCenter: LatLng = value ?? { lat: 35.6812, lng: 139.7671 }; // 東京駅

  const handleMapClick = useCallback((latlng: LatLng) => {
    onChange(latlng);
  }, [onChange]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=jp&limit=1`,
        { headers: { 'Accept-Language': 'ja' } },
      );
      const data = await res.json();

      if (data.length === 0) {
        setSearchError('場所が見つかりませんでした');
        return;
      }

      const result = data[0];
      const latlng: LatLng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
      setMapCenter(latlng);
      onChange(latlng);
      if (onAddressResolved && result.display_name) {
        onAddressResolved(result.display_name);
      }
    } catch {
      setSearchError('検索に失敗しました');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, onChange, onAddressResolved]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">現場位置（地図）</label>

      {/* 住所検索バー */}
      <div className="flex gap-2">
        <input
          ref={searchInputRef}
          type="text"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="住所・場所を検索（例: 渋谷駅、東京タワー）"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {searching ? '検索中...' : '検索'}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-600">{searchError}</p>
      )}

      {/* 地図 */}
      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: 350 }}>
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={value ? 16 : 12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          <MapUpdater center={mapCenter} />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>

      {/* 座標表示 */}
      {value && (
        <p className="text-xs text-gray-500">
          緯度: {value.lat.toFixed(6)} / 経度: {value.lng.toFixed(6)}
        </p>
      )}

      <p className="text-xs text-gray-400">地図をクリックしてピンを設置できます</p>
    </div>
  );
}
