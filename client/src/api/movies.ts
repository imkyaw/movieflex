const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type Movie = {
  movieId: string;
  title: string;
  description: string;
  genre: string;
  director: string;
  releaseDate: string;
  classification: string;
  runtimeMinutes: number;
  priceCents: number;
  stock: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  posterUrl: string | null;
};

export type MovieInput = Omit<Movie, 'movieId' | 'posterUrl'>;
type MovieList = { data: Movie[]; meta: { page: number; limit: number; total: number; totalPages: number } };
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
  return response.json() as Promise<T>;
}

export function listMovies(params: { search?: string; genre?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.genre) query.set('genre', params.genre);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 8));
  return request<MovieList>(`/api/v1/movies?${query}`);
}

function adminOptions(token: string, method: string, body?: MovieInput): RequestInit {
  return {
    method,
    headers: { Authorization: `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

export function createMovie(input: MovieInput, token: string) {
  return request<Movie>('/api/v1/movies', adminOptions(token, 'POST', input));
}

export function updateMovie(movieId: string, input: MovieInput, token: string) {
  return request<Movie>(`/api/v1/movies/${movieId}`, adminOptions(token, 'PUT', input));
}

export function discontinueMovie(movieId: string, token: string) {
  return request<Movie>(`/api/v1/movies/${movieId}`, adminOptions(token, 'DELETE'));
}
