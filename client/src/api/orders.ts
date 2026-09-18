const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type OrderDetail = { id: string; movieId: string; title: string; quantity: number; unitPriceCents: number; posterUrl: string | null };
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

export function checkout(items: { movieId: string; quantity: number }[], token: string) {
  return request<Order>('/api/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
  });
}

export function listOrders(token: string) {
  return request<Order[]>('/api/v1/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
