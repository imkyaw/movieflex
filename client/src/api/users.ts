const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type AdminUser = {
  userId: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
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

export function listUsers(token: string) {
  return request<AdminUser[]>('/api/v1/users', { headers: { Authorization: `Bearer ${token}` } });
}
