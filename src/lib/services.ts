// Real service layer backed by REST API
import { productApi, vendorDashApi, orderApi, adminApi } from "./api";

export const productService = {
  async list(opts: { category?: string; search?: string; sort?: string; minPrice?: number; maxPrice?: number; rating?: number; inStock?: boolean; page?: number } = {}) {
    const data: any = await productApi.list(opts);
    return data.products || [];
  },
  async listWithMeta(opts: any = {}) {
    return productApi.list(opts);
  },
  async get(slug: string) {
    return productApi.get(slug);
  },
  async related(productId: string) {
    return productApi.related(productId);
  },
};

export const vendorService = {
  async list() { const d: any = await adminApi.vendors(); return d.vendors || []; },
  async approved() {
    const d: any = await adminApi.vendors();
    return (d.vendors || []).filter((v: any) => v.approvalStatus === 'approved');
  },
  async pending() {
    const d: any = await adminApi.pendingVendors();
    return d.vendors || [];
  },
};

export const orderService = {
  async list() { const d: any = await orderApi.myOrders(); return d.orders || []; },
  async get(id: string) { return orderApi.get(id); },
};
