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

export function updateProfile(name: string, token: string) {
  return request<User>('/api/v1/auth/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

async function postNoContent(path: string, body: unknown, fallback: string, token?: string) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const parsed = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(parsed.error?.details?.[0]?.msg ?? parsed.error?.message ?? fallback);
  }
}

export function changePassword(currentPassword: string, newPassword: string, token: string) {
  return postNoContent('/api/v1/auth/change-password', { currentPassword, newPassword }, 'Unable to change your password.', token);
}

export function forgotPassword(email: string) {
  return postNoContent('/api/v1/auth/forgot-password', { email }, 'Unable to send the code.');
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return postNoContent('/api/v1/auth/reset-password', { email, code, newPassword }, 'Unable to reset the password.');
}
