import React, { useState } from 'react';
import {
  X,
  Package,
  ShoppingCart,
  Users,
  CheckCircle2,
  BarChart3,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Ban,
  Eye,
  Truck,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Database,
} from 'lucide-react';
import { Product, Order, Customer, ProductCategory, OrderStatus } from '../types';
import { formatRupiah, formatDateIndo, ORDER_STATUS_CONFIG, CATEGORY_NAMES } from '../utils/formatters';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  approvePaymentProof,
  rejectPaymentProof,
} from '../services/db';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  initialTab?: 'products' | 'orders' | 'approvals' | 'customers' | 'reports';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  customers,
  initialTab = 'products',
}) => {
  const [activeTab, setActiveTab] = useState<
    'products' | 'orders' | 'approvals' | 'customers' | 'reports'
  >(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Products Tab State
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | 'all'>('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New/Edit Product Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('mesin_performa');
  const [formPrice, setFormPrice] = useState<number>(500000);
  const [formStock, setFormStock] = useState<number>(10);
  const [formSku, setFormSku] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCompatibility, setFormCompatibility] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Orders Tab State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Approval Tab State
  const [inspectProofOrder, setInspectProofOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Customer Tab State
  const [customerSearch, setCustomerSearch] = useState('');

  if (!isOpen) return null;

  // Pending payment approval count
  const pendingApprovals = orders.filter((o) => o.status === 'menunggu_approval');

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setFormName('');
    setFormCategory('mesin_performa');
    setFormPrice(250000);
    setFormStock(15);
    setFormSku(`SKU-${Date.now().toString().slice(-4)}`);
    setFormBrand('BRT Racing');
    setFormCompatibility('Universal Motor');
    setFormImageUrl('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80');
    setFormDescription('Deskripsi sparepart motor berkualitas tinggi.');
    setEditingProduct(null);
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormStock(prod.stock);
    setFormSku(prod.sku);
    setFormBrand(prod.brand);
    setFormCompatibility(prod.compatibility);
    setFormImageUrl(prod.imageUrl);
    setFormDescription(prod.description);
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    const payload = {
      name: formName.trim(),
      category: formCategory,
      categoryLabel: CATEGORY_NAMES[formCategory],
      price: Number(formPrice),
      stock: Number(formStock),
      sku: formSku.trim(),
      brand: formBrand.trim(),
      compatibility: formCompatibility.trim(),
      imageUrl: formImageUrl.trim(),
      description: formDescription.trim(),
      rating: editingProduct?.rating || 5.0,
      soldCount: editingProduct?.soldCount || 0,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      setIsAddProductOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini dari database?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleQuickStockChange = async (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    try {
      await updateProduct(prod.id, { stock: newStock });
    } catch (err) {
      console.error('Stock adjust error:', err);
    }
  };

  // Handlers for Orders
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleOpenShipModal = (order: Order) => {
    setShippingModalOrder(order);
    setTrackingNumberInput(`EXP-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingModalOrder || !trackingNumberInput.trim()) return;
    try {
      await updateOrderStatus(shippingModalOrder.id, 'dikirim', trackingNumberInput.trim());
      setShippingModalOrder(null);
    } catch (err) {
      console.error('Shipment error:', err);
    }
  };

  // Handlers for Approval
  const handleApproveProof = async (orderId: string) => {
    try {
      await approvePaymentProof(orderId);
      setInspectProofOrder(null);
      setShowRejectBox(false);
      setRejectReason('');
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleRejectProof = async (orderId: string) => {
    if (!rejectReason.trim()) {
      alert('Mohon tulis alasan penolakan bukti pembayaran.');
      return;
    }
    try {
      await rejectPaymentProof(orderId, rejectReason.trim());
      setInspectProofOrder(null);
      setShowRejectBox(false);
      setRejectReason('');
    } catch (err) {
      console.error('Rejection error:', err);
    }
  };

  // Calculations for Sales Reports
  const validOrders = orders.filter((o) => o.status !== 'dibatalkan');
  const completedOrders = orders.filter((o) => o.status === 'selesai' || o.status === 'diproses' || o.status === 'dikirim');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = completedOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);
  const aov = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Revenue by Category
  const categoryRevenue: Record<ProductCategory, number> = {
    mesin_performa: 0,
    pengereman_kaki: 0,
    kelistrikan_aksesoris: 0,
  };

  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && categoryRevenue[prod.category] !== undefined) {
        categoryRevenue[prod.category] += item.subtotal;
      } else {
        // default distribution fallback
        categoryRevenue.mesin_performa += item.subtotal / 3;
        categoryRevenue.pengereman_kaki += item.subtotal / 3;
        categoryRevenue.kelistrikan_aksesoris += item.subtotal / 3;
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/85 backdrop-blur-md flex flex-col">
      {/* Top Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-3.5 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg">Panel Administrator Toko</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <Database className="w-3 h-3" /> Real Firestore DB
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Kelola Produk, Stok, Pesanan, Pelanggan, Approval Bukti Bayar & Laporan Penjualan
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Tutup Panel Admin"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs py-2 shrink-0">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Data Produk & Stok</span>
          <span className="px-1.5 py-0.2 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px]">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>2. Data Order & Riwayat</span>
          <span className="px-1.5 py-0.2 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px]">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>3. Approval Bukti Pembayaran</span>
          {pendingApprovals.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[11px] animate-pulse">
              {pendingApprovals.length} Menunggu
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Data Pelanggan</span>
          <span className="px-1.5 py-0.2 rounded-md bg-zinc-900 text-zinc-300 font-mono text-[10px]">
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>5. Laporan Sales</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 text-zinc-100">
        {/* ========================================================= */}
        {/* TAB 1: DATA PRODUK DAN STOK */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari sparepart / SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={selectedProductCategory}
                  onChange={(e) => setSelectedProductCategory(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="all">Semua Kategori (3)</option>
                  <option value="mesin_performa">Mesin & Performa</option>
                  <option value="pengereman_kaki">Pengereman & Kaki-kaki</option>
                  <option value="kelistrikan_aksesoris">Kelistrikan & Aksesoris</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Produk Baru
              </button>
            </div>

            {/* Products Table */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Produk</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Harga</th>
                      <th className="p-3.5">Stok Unit</th>
                      <th className="p-3.5">Terjual</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                    {products
                      .filter((p) => {
                        const matchCat =
                          selectedProductCategory === 'all' || p.category === selectedProductCategory;
                        const matchQuery =
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase());
                        return matchCat && matchQuery;
                      })
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-zinc-100 max-w-xs">{prod.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                  <span className="font-mono text-zinc-500">{prod.sku}</span>
                                  <span>•</span>
                                  <span>{prod.brand}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                              {CATEGORY_NAMES[prod.category]}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold font-mono text-white">
                            {formatRupiah(prod.price)}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold px-2 py-0.5 rounded ${
                                  prod.stock <= 5
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : 'bg-zinc-800 text-zinc-200'
                                }`}
                              >
                                {prod.stock} unit
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleQuickStockChange(prod, -1)}
                                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-zinc-300"
                                  title="Kurangi 1"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleQuickStockChange(prod, 1)}
                                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-zinc-300"
                                  title="Tambah 1"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-zinc-400">{prod.soldCount} pcs</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                                title="Edit Produk & Harga"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DATA ORDER DAN RIWAYAT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari No. Order / Nama Pembeli..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                  <option value="menunggu_approval">Menunggu Approval</option>
                  <option value="diproses">Diproses</option>
                  <option value="dikirim">Dikirim</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">No. Order & Tanggal</th>
                      <th className="p-3.5">Pelanggan</th>
                      <th className="p-3.5">Item Sparepart</th>
                      <th className="p-3.5">Total Bayar</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Kelola Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                    {orders
                      .filter((o) => {
                        const matchStatus =
                          orderStatusFilter === 'all' || o.status === orderStatusFilter;
                        const matchQuery =
                          o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
                        return matchStatus && matchQuery;
                      })
                      .map((ord) => {
                        const statusCfg = ORDER_STATUS_CONFIG[ord.status];
                        return (
                          <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-white block">
                                {ord.orderNumber}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {formatDateIndo(ord.createdAt)}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-zinc-100">{ord.customerName}</div>
                              <div className="text-[11px] text-zinc-400">{ord.customerPhone}</div>
                              <div className="text-[10px] text-zinc-500 truncate max-w-xs">
                                {ord.shippingAddress}, {ord.shippingCity}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-zinc-300">
                                {ord.items.length} macam ({ord.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                              </span>
                              <div className="text-[10px] text-zinc-500 truncate max-w-[180px]">
                                {ord.items.map((i) => i.name).join(', ')}
                              </div>
                            </td>
                            <td className="p-3.5 font-bold font-mono text-red-400">
                              {formatRupiah(ord.totalAmount)}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                              >
                                {statusCfg.label}
                              </span>
                              {ord.trackingNumber && (
                                <span className="block text-[10px] text-zinc-400 font-mono mt-1">
                                  Resi: {ord.trackingNumber}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {ord.status === 'menunggu_approval' && (
                                  <button
                                    onClick={() => {
                                      setInspectProofOrder(ord);
                                      setActiveTab('approvals');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approval
                                  </button>
                                )}

                                {ord.status === 'diproses' && (
                                  <button
                                    onClick={() => handleOpenShipModal(ord)}
                                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                  >
                                    <Truck className="w-3.5 h-3.5" /> Kirim Barang
                                  </button>
                                )}

                                {ord.status === 'dikirim' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, 'selesai')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Selesaikan
                                  </button>
                                )}

                                <select
                                  value={ord.status}
                                  onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-zinc-300"
                                >
                                  <option value="menunggu_pembayaran">Menunggu Bayar</option>
                                  <option value="menunggu_approval">Menunggu Approval</option>
                                  <option value="diproses">Diproses</option>
                                  <option value="dikirim">Dikirim</option>
                                  <option value="selesai">Selesai</option>
                                  <option value="dibatalkan">Dibatalkan</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: APPROVAL BUKTI PEMBAYARAN DARI PELANGGAN */}
        {/* ========================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/80 text-blue-200 text-xs flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Verifikasi Struk & Bukti Transfer Pembayaran
                </h3>
                <p className="text-zinc-300 mt-0.5">
                  Periksa keaslian bukti transfer dan cocokkan nominal pesanan sebelum menyetujui
                  pengiriman pesanan.
                </p>
              </div>
              <span className="text-sm font-extrabold px-3 py-1 rounded-lg bg-blue-600 text-white">
                {pendingApprovals.length} Perlu Verifikasi
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base text-zinc-200">
                  Semua Bukti Pembayaran Telah Di-approve!
                </h4>
                <p className="text-xs text-zinc-400">
                  Tidak ada bukti pembayaran baru yang menunggu approval saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApprovals.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between space-y-3 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                        <span className="font-mono font-bold text-xs text-white">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                          Menunggu Approval
                        </span>
                      </div>

                      <div className="my-2.5 space-y-1 text-xs">
                        <p className="font-bold text-zinc-100">{ord.customerName}</p>
                        <p className="text-zinc-400 text-[11px]">{ord.customerPhone}</p>
                        <p className="text-zinc-400 text-[11px]">Metode: {ord.paymentMethod}</p>
                        <p className="text-base font-black text-red-400 pt-1">
                          Nominal: {formatRupiah(ord.totalAmount)}
                        </p>
                      </div>

                      {/* Struk Image Thumbnail */}
                      <div
                        onClick={() => setInspectProofOrder(ord)}
                        className="relative cursor-pointer aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 group"
                      >
                        {ord.paymentProofUrl ? (
                          <img
                            src={ord.paymentProofUrl}
                            alt="Bukti Transfer"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                            Tidak ada foto
                          </div>
                        )}
                        <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          <Eye className="w-4 h-4 mr-1" /> Perbesar Struk
                        </div>
                      </div>
                    </div>

                    {/* Approve & Reject Actions */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                      <button
                        onClick={() => handleApproveProof(ord.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                      >
                        <Check className="w-4 h-4" /> Setujui (Approve)
                      </button>

                      <button
                        onClick={() => {
                          setInspectProofOrder(ord);
                          setShowRejectBox(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 border border-rose-800 transition-all"
                      >
                        <Ban className="w-4 h-4" /> Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DATA PELANGGAN */}
        {/* ========================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama / email / HP pelanggan..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Nama & Kontak Pelanggan</th>
                      <th className="p-3.5">Alamat Pengiriman</th>
                      <th className="p-3.5">Total Pesanan</th>
                      <th className="p-3.5">Total Belanja (CLV)</th>
                      <th className="p-3.5">Terdaftar Sejak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                    {customers
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.phone.toLowerCase().includes(customerSearch.toLowerCase())
                      )
                      .map((cust) => (
                        <tr key={cust.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-zinc-100">{cust.name}</div>
                            <div className="text-[11px] text-zinc-400">{cust.email}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{cust.phone}</div>
                          </td>
                          <td className="p-3.5 text-zinc-300 max-w-xs">{cust.address}</td>
                          <td className="p-3.5 font-bold font-mono text-zinc-100">
                            {cust.totalOrders} kali
                          </td>
                          <td className="p-3.5 font-bold font-mono text-emerald-400">
                            {formatRupiah(cust.totalSpent)}
                          </td>
                          <td className="p-3.5 text-zinc-400">
                            {formatDateIndo(cust.createdAt)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: LAPORAN SALES */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Total Omset (Revenue)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {formatRupiah(totalRevenue)}
                </p>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> Dari pesanan valid
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Pesanan Sukses</span>
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {completedOrders.length} Pesanan
                </p>
                <p className="text-[11px] text-zinc-400">Total {orders.length} pesanan masuk</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Sparepart Terjual</span>
                  <Package className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {totalItemsSold} Pcs
                </p>
                <p className="text-[11px] text-zinc-400">Total unit keluar gudang</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Rata-rata Keranjang (AOV)</span>
                  <ArrowUpRight className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {formatRupiah(aov)}
                </p>
                <p className="text-[11px] text-purple-400">Per transaksi pelanggan</p>
              </div>
            </div>

            {/* Category Sales Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-500" /> Omset Berdasarkan Kategori Sparepart
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-zinc-200">🔥 Mesin & Performa</span>
                      <span className="font-bold text-white">
                        {formatRupiah(categoryRevenue.mesin_performa)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            totalRevenue > 0
                              ? Math.min(100, (categoryRevenue.mesin_performa / totalRevenue) * 100)
                              : 40
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-zinc-200">🛑 Pengereman & Kaki-kaki</span>
                      <span className="font-bold text-white">
                        {formatRupiah(categoryRevenue.pengereman_kaki)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-orange-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            totalRevenue > 0
                              ? Math.min(100, (categoryRevenue.pengereman_kaki / totalRevenue) * 100)
                              : 35
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-zinc-200">⚡ Kelistrikan & Aksesoris</span>
                      <span className="font-bold text-white">
                        {formatRupiah(categoryRevenue.kelistrikan_aksesoris)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2.5 rounded-full"
                        style={{
                          width: `${
                            totalRevenue > 0
                              ? Math.min(
                                  100,
                                  (categoryRevenue.kelistrikan_aksesoris / totalRevenue) * 100
                                )
                              : 25
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-400" /> Distribusi Status Pesanan
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400">Menunggu Pembayaran</p>
                    <p className="text-lg font-bold text-amber-400">
                      {orders.filter((o) => o.status === 'menunggu_pembayaran').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400">Menunggu Approval</p>
                    <p className="text-lg font-bold text-blue-400">
                      {orders.filter((o) => o.status === 'menunggu_approval').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400">Sedang Diproses</p>
                    <p className="text-lg font-bold text-indigo-400">
                      {orders.filter((o) => o.status === 'diproses').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="text-zinc-400">Sedang Dikirim</p>
                    <p className="text-lg font-bold text-purple-400">
                      {orders.filter((o) => o.status === 'dikirim').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 col-span-2">
                    <p className="text-zinc-400">Selesai Diterima</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {orders.filter((o) => o.status === 'selesai').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: TAMBAH / EDIT PRODUK */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-60 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 text-zinc-100 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? 'Edit Data Produk & Stok' : 'Tambah Produk Sparepart Baru'}
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Produk Sparepart</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Paket Bore Up 63mm BRT"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
                  >
                    <option value="mesin_performa">Mesin & Performa</option>
                    <option value="pengereman_kaki">Pengereman & Kaki-kaki</option>
                    <option value="kelistrikan_aksesoris">Kelistrikan & Aksesoris</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">SKU / Kode Part</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Stok Gudang (Unit)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Merk / Brand</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Contoh: Brembo, YSS, RCB"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kompatibilitas Motor</label>
                  <input
                    type="text"
                    required
                    value={formCompatibility}
                    onChange={(e) => setFormCompatibility(e.target.value)}
                    placeholder="NMAX, Aerox, Beat FI, dll"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Foto Produk</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Simpan ke Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DETAIL & APPROVAL STRUK BUKTI PEMBAYARAN */}
      {/* ========================================================= */}
      {inspectProofOrder && (
        <div className="fixed inset-0 z-60 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-zinc-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-white">
                  Verifikasi Struk Pembayaran ({inspectProofOrder.orderNumber})
                </h3>
                <p className="text-xs text-zinc-400">
                  Pelanggan: <strong className="text-zinc-200">{inspectProofOrder.customerName}</strong> • {inspectProofOrder.customerPhone}
                </p>
              </div>
              <button
                onClick={() => {
                  setInspectProofOrder(null);
                  setShowRejectBox(false);
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Receipt Preview */}
              <div className="bg-zinc-950 rounded-xl p-2 border border-zinc-800 flex items-center justify-center">
                {inspectProofOrder.paymentProofUrl ? (
                  <img
                    src={inspectProofOrder.paymentProofUrl}
                    alt="Struk Transfer"
                    className="max-h-80 object-contain rounded-lg"
                  />
                ) : (
                  <p className="text-xs text-zinc-500 p-8">Belum ada foto</p>
                )}
              </div>

              {/* Order Matching Info */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Nominal Tagihan:</span>
                    <span className="font-black text-sm text-red-400">
                      {formatRupiah(inspectProofOrder.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Metode Bayar:</span>
                    <span className="text-zinc-200">{inspectProofOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Waktu Order:</span>
                    <span className="text-zinc-200">{formatDateIndo(inspectProofOrder.createdAt)}</span>
                  </div>
                </div>

                {showRejectBox ? (
                  <div className="space-y-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800">
                    <label className="block font-bold text-rose-300">
                      Alasan Penolakan Bukti:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Nominal transfer tidak sesuai, foto buram..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full bg-zinc-950 border border-rose-700 rounded-lg p-2 text-zinc-100"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowRejectBox(false)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleRejectProof(inspectProofOrder.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Kirim Penolakan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleApproveProof(inspectProofOrder.id)}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <Check className="w-4 h-4" /> Setujui Pembayaran (Lanjut Proses)
                    </button>

                    <button
                      onClick={() => setShowRejectBox(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Ban className="w-4 h-4" /> Tolak Bukti Transfer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: INPUT RESI PENGIRIMAN */}
      {/* ========================================================= */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-60 bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-zinc-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" /> Input Resi Pengiriman
              </h3>
              <button
                onClick={() => setShippingModalOrder(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShipment} className="space-y-3 text-xs">
              <p className="text-zinc-300">
                Pesanan <strong className="text-white font-mono">{shippingModalOrder.orderNumber}</strong> ({shippingModalOrder.customerName}) siap dikirimkan.
              </p>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  Nomor Resi Ekspedisi ({shippingModalOrder.shippingMethod})
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JNE98218731902"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 font-mono text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Ubah Status ke Dikirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
