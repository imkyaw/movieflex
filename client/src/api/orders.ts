const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type OrderDetail = {
  id: string;
  movieId: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  posterUrl: string | null;
  genre: string;
  classification: string;
  releaseDate: string;
  stock: number;
};
export type Order = { orderId: string; userId: string; totalCents: number; status: string; createdAt: string; details: OrderDetail[] };
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

function authOptions(token: string, method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { Authorization: `Bearer ${token}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}

export function getCart(token: string) {
  return request<Order>('/api/v1/orders/cart', authOptions(token, 'GET'));
}

export function addCartItem(movieId: string, quantity: number, token: string) {
  return request<Order>('/api/v1/orders/cart/items', authOptions(token, 'POST', { movieId, quantity }));
}

export function updateCartItem(movieId: string, quantity: number, token: string) {
  return request<Order>(`/api/v1/orders/cart/items/${movieId}`, authOptions(token, 'PATCH', { quantity }));
}

export function removeCartItem(movieId: string, token: string) {
  return request<Order>(`/api/v1/orders/cart/items/${movieId}`, authOptions(token, 'DELETE'));
}

export function checkout(token: string) {
  return request<Order>('/api/v1/orders/checkout', authOptions(token, 'POST'));
}

export function listOrders(token: string) {
  return request<Order[]>('/api/v1/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
