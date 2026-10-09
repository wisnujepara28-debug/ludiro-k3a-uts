import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  LogIn,
  AlertCircle,
  Sparkles,
  Package,
  ShoppingCart,
  Users,
  CheckCircle2,
  BarChart3,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AdminCategoryRole =
  | 'super_admin'
  | 'products'
  | 'orders'
  | 'approvals'
  | 'customers'
  | 'reports';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetCategory?: 'products' | 'orders' | 'approvals' | 'customers' | 'reports') => void;
}

const CATEGORY_ROLES: {
  id: AdminCategoryRole;
  targetTab: 'products' | 'orders' | 'approvals' | 'customers' | 'reports';
  label: string;
  categoryName: string;
  icon: any;
  color: string;
  badgeBg: string;
  desc: string;
  privilege: string;
}[] = [
  {
    id: 'products',
    targetTab: 'products',
    label: '1. Kelola Data Produk dan Stok',
    categoryName: 'Divisi Pergudangan & Stok',
    icon: Package,
    color: 'text-red-400',
    badgeBg: 'bg-red-950/60 border-red-800 text-red-300',
    desc: 'Pengaturan 12 produk sparepart, penyesuaian stok unit, edit harga & tambah SKU baru.',
    privilege: 'Akses: Tambah/Edit Produk, Atur Stok, Hapus Item',
  },
  {
    id: 'orders',
    targetTab: 'orders',
    label: '2. Kelola Data Order dan Riwayat',
    categoryName: 'Divisi Pemrosesan & Ekspedisi',
    icon: ShoppingCart,
    color: 'text-orange-400',
    badgeBg: 'bg-orange-950/60 border-orange-800 text-orange-300',
    desc: 'Pantau order masuk, ubah status pesanan, dan input nomor resi pengiriman kurir.',
    privilege: 'Akses: Update Status Order, Input Resi JNE/J&T, Filter Riwayat',
  },
  {
    id: 'approvals',
    targetTab: 'approvals',
    label: '3. Approval Bukti Pembayaran dari Pelanggan',
    categoryName: 'Divisi Finansial & Verifikasi Struk',
    icon: CheckCircle2,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/60 border-blue-800 text-blue-300',
    desc: 'Inspeksi foto bukti transfer bank/QRIS dan setujui (approve) atau tolak pesanan.',
    privilege: 'Akses: Verifikasi Struk, Approve Pembayaran, Tolak Bukti Bayar',
  },
  {
    id: 'customers',
    targetTab: 'customers',
    label: '4. Kelola Data Pelanggan',
    categoryName: 'Divisi CRM & Konsumen',
    icon: Users,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
    desc: 'Rekap database pembeli, nomor WhatsApp, alamat, dan total belanja pelanggan.',
    privilege: 'Akses: Database Kontak Pembeli, Riwayat Alamat, CLV Belanja',
  },
  {
    id: 'reports',
    targetTab: 'reports',
    label: '5. Laporan Sales & Keuangan',
    categoryName: 'Divisi Manajemen & Owner',
    icon: BarChart3,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/60 border-purple-800 text-purple-300',
    desc: 'Dashboard eksekutif omset total (Rp), unit terjual, AOV, dan tren kategori.',
    privilege: 'Akses: Analisis Omset Bisnis, Statistik Penjualan, Tren Kategori',
  },
  {
    id: 'super_admin',
    targetTab: 'products',
    label: '👑 Super Admin (Akses Penuh 5 Kategori)',
    categoryName: 'Administrator Utama',
    icon: ShieldCheck,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/60 border-amber-800 text-amber-300',
    desc: 'Akses komprehensif tanpa batas ke seluruh modul dan menu toko online.',
    privilege: 'Akses Penuh: Produk, Order, Approval, Pelanggan & Laporan',
  },
];

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, toggleAdminMode, adminEmail } = useAuth();

  const [selectedRole, setSelectedRole] = useState<AdminCategoryRole>('products');
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentRoleConfig = CATEGORY_ROLES.find((r) => r.id === selectedRole)!;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      onSuccess(currentRoleConfig.targetTab);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        'Popup Google login terkendala pada sandbox browser. Silakan gunakan Login Cepat PIN di bawah.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    // Accepts admin123 or admin, or category-specific passcodes
    const valid =
      passcode === 'admin123' ||
      passcode === 'admin' ||
      passcode.toLowerCase() === selectedRole.toLowerCase();

    if (valid) {
      toggleAdminMode('admin123');
      onSuccess(currentRoleConfig.targetTab);
      onClose();
    } else {
      setErrorMsg('PIN Admin tidak cocok. Gunakan PIN: admin123');
    }
  };

  const handleDirectCategoryAccess = (role: (typeof CATEGORY_ROLES)[0]) => {
    toggleAdminMode('admin123');
    onSuccess(role.targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                Form Login Administrator MotoParts
              </h2>
              <p className="text-xs text-zinc-400">
                Pilih modul pengelolaan yang ingin Anda kelola sesuai kategori di bawah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Choose Category Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2.5">
              1. Pilih Kategori Pengelolaan Yang Ingin Dikelola:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORY_ROLES.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-950 border-red-500 shadow-md ring-1 ring-red-500/50'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 ${role.color}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-zinc-100">{role.categoryName}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{role.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Active Category Card Details */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${currentRoleConfig.badgeBg}`}>
                  {currentRoleConfig.categoryName}
                </span>
                <span className="text-xs font-semibold text-zinc-200">
                  {currentRoleConfig.label}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                Terhubung: Real Firestore DB
              </span>
            </div>
            <p className="text-xs text-zinc-400">{currentRoleConfig.desc}</p>
            <p className="text-[11px] text-zinc-500 font-medium pt-1 border-t border-zinc-900">
              🔑 {currentRoleConfig.privilege}
            </p>
          </div>

          {/* Section 3: Authentication Input */}
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Masukkan PIN / Password Admin
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="PIN default: admin123"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk & Buka Modul Ini</span>
              </button>
            </div>
          </form>

          {/* Direct One-Click Instant Access button */}
          <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleDirectCategoryAccess(currentRoleConfig)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Akses Cepat 1-Klik ke {currentRoleConfig.categoryName}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Login via Akun Google ({adminEmail})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
