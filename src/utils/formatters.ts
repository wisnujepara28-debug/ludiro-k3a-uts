import { OrderStatus, ProductCategory } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const CATEGORY_NAMES: Record<ProductCategory, string> = {
  mesin_performa: 'Mesin & Performa',
  pengereman_kaki: 'Pengereman & Kaki-kaki',
  kelistrikan_aksesoris: 'Kelistrikan & Aksesoris',
};

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  menunggu_pembayaran: {
    label: 'Menunggu Pembayaran',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Silakan transfer dan unggah bukti pembayaran.',
  },
  menunggu_approval: {
    label: 'Menunggu Approval Admin',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Bukti pembayaran telah diunggah dan sedang diperiksa oleh admin.',
  },
  diproses: {
    label: 'Sedang Diproses',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    desc: 'Pembayaran disetujui! Sparepart sedang disiapkan di gudang.',
  },
  dikirim: {
    label: 'Sedang Dikirim',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Paket dalam perjalanan bersama kurir ekspedisi.',
  },
  selesai: {
    label: 'Selesai',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Pesanan telah diterima oleh pembeli. Transaksi selesai.',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    desc: 'Pesanan telah dibatalkan.',
  },
};
