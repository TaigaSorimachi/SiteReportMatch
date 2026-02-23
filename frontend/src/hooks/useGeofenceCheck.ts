import { useState, useEffect } from 'react';
import { geolocationApi } from '@/lib/api/geolocation';
import { getCurrentPosition } from '@/lib/geolocation';
import type { GeofenceCheckResponse } from '@/types/api';

export function useGeofenceCheck(projectId: string | null, intervalMs = 30000) {
  const [status, setStatus] = useState<GeofenceCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const check = async () => {
      try {
        const coords = await getCurrentPosition();
        const result = await geolocationApi.checkGeofence({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          projectId,
        });
        if (!cancelled) setStatus(result);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [projectId, intervalMs]);

  return { status, error };
}
