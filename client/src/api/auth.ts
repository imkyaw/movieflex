const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type User = {
  userId: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type AuthResponse = { token: string; user: User };
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

export function login(email: string, password: string) {
  return request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export function getMe(token: string) {
  return request<User>('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}
