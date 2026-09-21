import type { Order } from './orders';

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

export type AdminUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  orderCount: number;
  totalSpentCents: number;
};

export type AdminUserDetail = AdminUser & { orders: Order[] };

export type AdminOrder = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  createdAt: string;
  itemCount: number;
};

export type AdminOrderDetail = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  createdAt: string;
  details: Order['details'];
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

export function getUsers(token: string) {
  return request<AdminUser[]>('/api/v1/admin/users', { headers: { Authorization: `Bearer ${token}` } });
}

export function getUserDetail(userId: string, token: string) {
  return request<AdminUserDetail>(`/api/v1/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
}

export function updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE', token: string) {
  return request<{ userId: string; status: string }>(`/api/v1/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

export function getOrders(token: string) {
  return request<AdminOrder[]>('/api/v1/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
}

export function getOrderDetail(orderId: string, token: string) {
  return request<AdminOrderDetail>(`/api/v1/admin/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
}
