const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type RecentOrder = {
  orderId: string;
  totalCents: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
};

export type Dashboard = {
  movieCount: number;
  activeMovieCount: number;
  lowStockCount: number;
  userCount: number;
  orderCount: number;
  revenueCents: number;
  recentOrders: RecentOrder[];
};

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

export function getDashboard(token: string) {
  return request<Dashboard>('/api/v1/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
}
