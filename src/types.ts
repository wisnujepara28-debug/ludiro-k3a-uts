export type ProductCategory = 'mesin_performa' | 'pengereman_kaki' | 'kelistrikan_aksesoris';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  brand: string;
  compatibility: string;
  imageUrl: string;
  rating: number;
  soldCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'menunggu_approval'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingMethod: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  paymentApprovedAt?: string;
  adminNotes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}
