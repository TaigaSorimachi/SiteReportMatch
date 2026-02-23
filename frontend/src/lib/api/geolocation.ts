import { apiClient } from './client';
import type { GeofenceCheckResponse, PaginatedResponse, LocationLog, GeofenceEvent } from '@/types/api';

export const geolocationApi = {
  record: (dto: any) => apiClient.post('/geolocation/record', dto).then((r) => r.data),
  checkGeofence: (dto: any) =>
    apiClient.post<GeofenceCheckResponse>('/geolocation/geofence/check', dto).then((r) => r.data),
  getLogs: (params?: any) =>
    apiClient.get<PaginatedResponse<LocationLog>>('/geolocation/logs', { params }).then((r) => r.data),
  getEvents: (params?: any) =>
    apiClient.get<PaginatedResponse<GeofenceEvent>>('/geolocation/geofence/events', { params }).then((r) => r.data),
};
