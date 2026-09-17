import type { Movie } from './movies';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
type ApiError = { error?: { message?: string; details?: Array<{ msg?: string }> } };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error?.details?.[0]?.msg ?? body.error?.message ?? 'Request failed.');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function listWatchlist(token: string) {
  return request<Movie[]>('/api/v1/watchlist', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addToWatchlist(movieId: string, token: string) {
  return request<void>(`/api/v1/movies/${movieId}/watchlist`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function removeFromWatchlist(movieId: string, token: string) {
  return request<void>(`/api/v1/movies/${movieId}/watchlist`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
