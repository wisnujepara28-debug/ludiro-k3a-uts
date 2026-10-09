import React from 'react';
import {
  Wrench,
  ShoppingCart,
  ShieldCheck,
  UserCheck,
  Package,
  Search,
  LogIn,
  LogOut,
  Zap,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCategory } from '../types';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  onOpenAdminPanel: () => void;
  onOpenAdminLogin: () => void;
  onOpenMyOrders: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenAdminPanel,
  onOpenAdminLogin,
  onOpenMyOrders,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, isAdminModeActive, logout, setAdminModeActive } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 shadow-xl">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
        <span>Toko Resmi Sparepart Racing & Standar Original. Terhubung ke Firestore Live Database!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCategory('all')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
              <Wrench className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Moto<span className="text-red-500">Parts</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
                  ID
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Marketplace & Webstore Sparepart Motor</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari sparepart (NMAX, bore up, Brembo, kampas, dll)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* My Orders Button */}
            <button
              onClick={onOpenMyOrders}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 transition-all shadow-sm"
              title="Cek Riwayat Pesanan Saya"
            >
              <Package className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Pesanan Saya</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 bg-white text-red-600 font-bold text-xs rounded-full flex items-center justify-center -mr-1 animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Switcher / Login */}
            {isAdmin ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenAdminPanel}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    isAdminModeActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10 shadow-lg'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
                <button
                  onClick={() => setAdminModeActive(!isAdminModeActive)}
                  title={isAdminModeActive ? 'Tutup mode admin' : 'Aktifkan mode admin'}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <UserCheck className="w-4 h-4 text-green-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-all"
              >
                <LogIn className="w-4 h-4 text-zinc-400" />
                <span className="hidden sm:inline">Login Admin</span>
              </button>
            )}

            {/* User Profile / Logout if logged in */}
            {user && (
              <button
                onClick={logout}
                title={`Keluar (${user.email || user.displayName})`}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/60 border border-zinc-700 text-zinc-400 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari sparepart (NMAX, Beat, YSS, Brembo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Category Filter Pills (3 Categories as required) */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-xs">
          <span className="text-zinc-400 font-medium whitespace-nowrap mr-1">Kategori:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            Semua Produk (12)
          </button>
          <button
            onClick={() => setSelectedCategory('mesin_performa')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'mesin_performa'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            🔥 Mesin & Performa
          </button>
          <button
            onClick={() => setSelectedCategory('pengereman_kaki')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'pengereman_kaki'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            🛑 Pengereman & Kaki-kaki
          </button>
          <button
            onClick={() => setSelectedCategory('kelistrikan_aksesoris')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'kelistrikan_aksesoris'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            ⚡ Kelistrikan & Aksesoris
          </button>
        </div>
      </div>
    </header>
  );
};
