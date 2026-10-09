import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentProofModal } from './components/PaymentProofModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Product, Order, Customer, ProductCategory } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import {
  seedProductsIfEmpty,
  subscribeProducts,
  subscribeOrders,
  subscribeCustomers,
} from './services/db';
import { CATEGORY_NAMES } from './utils/formatters';
import {
  Wrench,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Database,
  CheckCircle2,
} from 'lucide-react';

function Storefront() {
  const { isAdminModeActive, setAdminModeActive } = useAuth();

  // State with initial 12 products across 3 categories
  const [products, setProducts] = useState<Product[]>(() =>
    INITIAL_PRODUCTS.map((p, idx) => ({
      id: `prod-${idx + 1}`,
      ...p,
    }))
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  // Cart state
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeProofOrder, setActiveProofOrder] = useState<Order | null>(null);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminTargetTab, setAdminTargetTab] = useState<
    'products' | 'orders' | 'approvals' | 'customers' | 'reports'
  >('products');

  // Initialize and listen to Firestore
  useEffect(() => {
    let unsubscribeProducts: () => void;
    let unsubscribeOrders: () => void;
    let unsubscribeCustomers: () => void;

    async function initFirestore() {
      try {
        await seedProductsIfEmpty();
      } catch (err) {
        console.warn('Initial seeding check:', err);
      } finally {
        setIsLoading(false);
      }

      unsubscribeProducts = subscribeProducts((prods) => {
        setProducts(prods);
      });

      unsubscribeOrders = subscribeOrders((ords) => {
        setOrders(ords);
      });

      unsubscribeCustomers = subscribeCustomers((custs) => {
        setCustomers(custs);
      });
    }

    initFirestore();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeCustomers) unsubscribeCustomers();
    };
  }, []);

  // Filtered products
  const filteredProducts = products.filter((prod) => {
    const matchCat = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.compatibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group products by 3 categories if "all" is selected
  const categoriesList: ProductCategory[] = [
    'mesin_performa',
    'pengereman_kaki',
    'kelistrikan_aksesoris',
  ];

  const handleOrderCreated = (newOrder: Order) => {
    setActiveProofOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
      />

      {/* Admin Quick Mode Bar if Admin mode active */}
      {isAdminModeActive && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>Mode Admin Aktif:</strong> Anda dapat mengakses kelola produk, stok, data
              pelanggan, verifikasi struk transfer & laporan penjualan.
            </span>
          </div>
          <button
            onClick={() => setIsAdminPanelOpen(true)}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold transition-colors"
          >
            Buka Panel Admin
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <HeroBanner
        onExplore={() => {
          document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content / Product Catalog */}
      <main id="katalog-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
              <Sparkles className="w-4 h-4" /> Katalog Sparepart Terpercaya
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {selectedCategory === 'all'
                ? 'Semua Sparepart Motor Pilihan (12 Produk)'
                : CATEGORY_NAMES[selectedCategory]}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">
              Menampilkan {filteredProducts.length} dari {products.length} produk
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Stok Sinkron Firestore
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty search state */
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto">
              <Wrench className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="font-bold text-lg text-zinc-200">Produk tidak ditemukan</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Tidak ada produk sparepart yang sesuai dengan kata kunci "{searchQuery}". Silakan coba
              kata kunci lain atau reset filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : selectedCategory === 'all' && !searchQuery ? (
          /* Grouped by 3 Categories (4 products each) */
          <div className="space-y-12 py-8">
            {categoriesList.map((catKey) => {
              const catProducts = products.filter((p) => p.category === catKey);
              return (
                <section key={catKey} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {catKey === 'mesin_performa'
                          ? '🔥'
                          : catKey === 'pengereman_kaki'
                          ? '🛑'
                          : '⚡'}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {CATEGORY_NAMES[catKey]}
                      </h3>
                      <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900">
                        {catProducts.length} Produk
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedCategory(catKey)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Lihat Kategori Ini →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {catProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Flat grid when filtering */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 py-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 text-xs py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                  <Wrench className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  Moto<span className="text-red-500">Parts</span> ID
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Platform webstore sparepart motor resmi di Indonesia. Menyediakan 12 produk unggulan
                pada kategori Mesin, Pengereman, dan Kelistrikan dengan real database Firestore.
              </p>
              <div className="pt-1 flex items-center gap-2 text-zinc-500 text-[11px]">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Single Source of Truth: Firestore DB</span>
              </div>
            </div>

            {/* Col 2: Categories */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
                3 Kategori Produk
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setSelectedCategory('mesin_performa')}
                    className="hover:text-white transition-colors"
                  >
                    🔥 Mesin & Performa (Bore Up, Camshaft, PWK, ECU)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedCategory('pengereman_kaki')}
                    className="hover:text-white transition-colors"
                  >
                    🛑 Pengereman & Kaki-kaki (Brembo, RCB, YSS, TDR)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedCategory('kelistrikan_aksesoris')}
                    className="hover:text-white transition-colors"
                  >
                    ⚡ Kelistrikan & Aksesoris (Biled, Koil, Yoshimura)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Layanan */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
                Layanan & Fitur
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setIsMyOrdersOpen(true)} className="hover:text-white">
                    Cek Riwayat Pesanan
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (orders.length > 0) setActiveProofOrder(orders[0]);
                      else setIsMyOrdersOpen(true);
                    }}
                    className="hover:text-white"
                  >
                    Upload Bukti Transfer Pembayaran
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (isAdminModeActive) setIsAdminPanelOpen(true);
                      else setIsAdminLoginOpen(true);
                    }}
                    className="hover:text-white text-amber-400 font-semibold"
                  >
                    Panel Admin (Produk, Order, Approval, Laporan)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact & Location */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">
                Kontak & Alamat
              </h4>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span>WhatsApp: 0812-9876-5432</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Email: support@motoparts.id</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Gudang: Jepara & Jakarta Barat, Indonesia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Senin - Sabtu: 08.00 - 21.00 WIB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <p>© 2026 MotoParts ID. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-4">
              <span>Keamanan Transaksi Terjamin</span>
              <span>•</span>
              <span>Approval Struk Real-time</span>
              <span>•</span>
              <span>Firestore Connected</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <CartDrawer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <PaymentProofModal
        order={activeProofOrder}
        onClose={() => setActiveProofOrder(null)}
        onSuccess={() => {
          setIsMyOrdersOpen(true);
        }}
      />

      <CustomerOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={orders}
        onUploadProof={(order) => {
          setIsMyOrdersOpen(false);
          setActiveProofOrder(order);
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(targetCategory) => {
          if (targetCategory) {
            setAdminTargetTab(targetCategory);
          }
          setIsAdminPanelOpen(true);
        }}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        products={products}
        orders={orders}
        customers={customers}
        initialTab={adminTargetTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
