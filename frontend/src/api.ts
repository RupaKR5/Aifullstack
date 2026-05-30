import { API_URL } from './config';
import {
  User,
  DashboardStats,
  Inventory,
  Category,
  Item,
  ItemCreate,
  ItemUpdate,
  TokenResponse,
} from './types';

const TOKEN_KEY = 'inventrack_token';

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (response.status === 401) {
    clearStoredToken();
    window.location.assign('/login');
    throw new Error((data && (data.detail || data.message)) || 'Unauthorized');
  }

  if (!response.ok) {
    throw new Error((data && (data.detail || data.message)) || response.statusText || 'Request failed');
  }

  return data as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export async function register(email: string, password: string, name?: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const tokenResponse = await handleResponse<TokenResponse>(response);
  setStoredToken(tokenResponse.access_token);
  return tokenResponse;
}

export async function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/dashboard/stats');
}

export async function getInventories(): Promise<Inventory[]> {
  return request<Inventory[]>('/inventories');
}

export async function createInventory(name: string, description?: string): Promise<Inventory> {
  return request<Inventory>('/inventories', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateInventory(id: string, name: string, description?: string): Promise<Inventory> {
  return request<Inventory>(`/inventories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteInventory(id: string): Promise<void> {
  await request<void>(`/inventories/${id}`, {
    method: 'DELETE',
  });
}

export async function getInventory(id: string): Promise<Inventory> {
  return request<Inventory>(`/inventories/${id}`);
}

export async function getCategories(invId: string): Promise<Category[]> {
  return request<Category[]>(`/inventories/${invId}/categories`);
}

export async function createCategory(invId: string, name: string, description?: string): Promise<Category> {
  return request<Category>(`/inventories/${invId}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateCategory(invId: string, catId: string, name: string, description?: string): Promise<Category> {
  return request<Category>(`/inventories/${invId}/categories/${catId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteCategory(invId: string, catId: string): Promise<void> {
  await request<void>(`/inventories/${invId}/categories/${catId}`, {
    method: 'DELETE',
  });
}

export async function getItems(params?: { cat_id?: string; inv_id?: string }): Promise<Item[]> {
  const query = new URLSearchParams();
  if (params?.cat_id) query.append('cat_id', params.cat_id);
  if (params?.inv_id) query.append('inv_id', params.inv_id);
  const path = `/items${query.toString() ? `?${query.toString()}` : ''}`;
  return request<Item[]>(path);
}

export async function createItem(data: ItemCreate): Promise<Item> {
  return request<Item>('/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateItem(id: string, data: ItemUpdate): Promise<Item> {
  return request<Item>(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteItem(id: string): Promise<void> {
  await request<void>(`/items/${id}`, {
    method: 'DELETE',
  });
}
