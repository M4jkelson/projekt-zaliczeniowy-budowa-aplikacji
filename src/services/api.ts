import { FitRoute, RoutePayload } from '../types/route';

const API_URL = 'http://localhost:3000/routes';

type EmptyResponse = Record<string, never>;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Błąd API: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function fetchRoutes(): Promise<FitRoute[]> {
  return request<FitRoute[]>(API_URL);
}

export async function createRoute(payload: RoutePayload): Promise<FitRoute> {
  return request<FitRoute>(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      createdAt: new Date().toISOString()
    })
  });
}

export async function updateRoute(id: string, payload: RoutePayload): Promise<FitRoute> {
  return request<FitRoute>(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteRoute(id: string): Promise<void> {
  await request<EmptyResponse>(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
}
