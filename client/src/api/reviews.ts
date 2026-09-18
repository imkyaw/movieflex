const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type Review = {
  reviewId: string;
  movieId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewList = { data: Review[]; meta: { count: number; average: number } };
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

export function listReviews(movieId: string) {
  return request<ReviewList>(`/api/v1/movies/${movieId}/reviews`);
}

export function submitReview(movieId: string, input: { rating: number; comment: string }, token: string) {
  return request<Review>(`/api/v1/movies/${movieId}/reviews`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}
