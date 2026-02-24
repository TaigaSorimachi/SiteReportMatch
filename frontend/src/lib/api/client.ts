import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';
import { handleMockRequest } from '@/lib/demo-data/mock-handler';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Demo mode: intercept all requests and return mock data
if (isDemoMode) {
  apiClient.interceptors.request.use((config) => {
    const mockResponse = handleMockRequest(config);
    if (mockResponse) {
      config.adapter = () => Promise.resolve(mockResponse);
    }
    return config;
  });
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(original));
            },
            reject,
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
        queue.forEach((cb) => cb.resolve(data.accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        clearTokens();
        queue.forEach((cb) => cb.reject(error));
        queue = [];
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    // バックエンドのエラーメッセージを抽出してErrorオブジェクトに変換
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      const msg = Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage;
      return Promise.reject(new Error(msg));
    }
    return Promise.reject(error);
  },
);
