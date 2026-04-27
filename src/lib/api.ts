// Centralized API client for the MERN backend
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).message || `Request failed (${res.status})`);
  return data as T;
}

// ─── Auth ───
export const authApi = {
  registerCustomer: (body: { name: string; email: string; password: string }) =>
    request('/auth/register/customer', { method: 'POST', body: JSON.stringify(body) }),
  registerVendor: (body: { name: string; email: string; password: string; storeName: string }) =>
    request('/auth/register/vendor', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateProfile: (body: { name?: string; phone?: string; avatarUrl?: string }) =>
    request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request('/auth/password', { method: 'PATCH', body: JSON.stringify(body) }),
  getAddresses: () => request('/auth/addresses'),
  addAddress: (body: any) => request('/auth/addresses', { method: 'POST', body: JSON.stringify(body) }),
  deleteAddress: (idx: number) => request(`/auth/addresses/${idx}`, { method: 'DELETE' }),
};

// ─── Categories ───
export const categoryApi = {
  list: () => request('/categories'),
  create: (body: { name: string; icon?: string; image?: string }) =>
    request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) =>
    request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Products ───
export interface ProductQuery {
  category?: string; search?: string; sort?: string; minPrice?: number;
  maxPrice?: number; rating?: number; inStock?: boolean; vendor?: string;
  featured?: boolean; colors?: string; sizes?: string; page?: number; limit?: number;
}
export const productApi = {
  list: (q: ProductQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== false) params.set(k, String(v)); });
    return request(`/products?${params}`);
  },
  get: (slug: string) => request(`/products/${slug}`),
  related: (productId: string) => request(`/products/${productId}/related`),
  vendorProducts: (q: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    return request(`/products/vendor?${params}`);
  },
  create: (body: any) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: any) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Cart ───
export const cartApi = {
  get: () => request('/cart'),
  add: (productId: string, qty = 1, size = '', color = '') =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, qty, size, color }) }),
  update: (productId: string, qty: number) =>
    request(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
  remove: (productId: string) => request(`/cart/items/${productId}`, { method: 'DELETE' }),
  clear: () => request('/cart', { method: 'DELETE' }),
};

// ─── Wishlist ───
export const wishlistApi = {
  get: () => request('/wishlist'),
  toggle: (productId: string) => request(`/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId: string) => request(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// ─── Orders ───
export const orderApi = {
  create: (body: any) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  myOrders: () => request('/orders/my'),
  get: (id: string) => request(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ─── Reviews ───
export const reviewApi = {
  create: (body: { productId: string; rating: number; title?: string; comment?: string }) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  forProduct: (productId: string) => request(`/reviews/product/${productId}`),
  myReviews: () => request('/reviews/my'),
};

// ─── Coupons ───
export const couponApi = {
  validate: (code: string, cartTotal: number) =>
    request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cartTotal }) }),
};

// ─── Admin ───
export const adminApi = {
  overview: () => request('/admin/overview'),
  vendors: () => request('/admin/vendors'),
  pendingVendors: () => request('/admin/vendors/pending'),
  approveVendor: (id: string) => request(`/admin/vendors/${id}/approve`, { method: 'PATCH' }),
  rejectVendor: (id: string) => request(`/admin/vendors/${id}/reject`, { method: 'PATCH' }),
  disputes: () => request('/admin/disputes'),
  updateDispute: (id: string, body: { status?: string; resolution?: string }) =>
    request(`/admin/disputes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

// ─── Vendor Dashboard ───
export const vendorDashApi = {
  overview: () => request('/vendor/overview'),
  revenue: () => request('/vendor/revenue'),
  orders: (status?: string) => request(`/vendor/orders${status && status !== 'All' ? `?status=${status}` : ''}`),
  payouts: () => request('/vendor/payouts'),
  requestPayout: (method = 'Bank transfer') =>
    request('/vendor/payouts/request', { method: 'POST', body: JSON.stringify({ method }) }),
  store: () => request('/vendor/store'),
  updateStore: (body: any) => request('/vendor/store', { method: 'PATCH', body: JSON.stringify(body) }),
};
