import React, { useState } from 'react';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Upload,
  Truck,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah, formatDateIndo, ORDER_STATUS_CONFIG } from '../utils/formatters';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUploadProof: (order: Order) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUploadProof,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const filtered = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Riwayat Pesanan & Status Pembayaran
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pantau status pesanan, no. resi ekspedisi, dan bukti transfer pembayaran.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Filter Bar */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs bg-zinc-950/40">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('menunggu_pembayaran')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === 'menunggu_pembayaran'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            Menunggu Pembayaran
          </button>
          <button
            onClick={() => setFilterStatus('menunggu_approval')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === 'menunggu_approval'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            Menunggu Approval
          </button>
          <button
            onClick={() => setFilterStatus('diproses')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === 'diproses'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            Diproses
          </button>
          <button
            onClick={() => setFilterStatus('dikirim')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === 'dikirim'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            Dikirim
          </button>
          <button
            onClick={() => setFilterStatus('selesai')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              filterStatus === 'selesai'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <Package className="w-12 h-12 stroke-1 text-zinc-600 mx-auto" />
              <p className="font-semibold text-sm text-zinc-300">Belum ada pesanan dengan status ini.</p>
              <p className="text-xs text-zinc-500">
                Pilih sparepart motor favorit Anda dan lakukan pemesanan di webstore!
              </p>
            </div>
          ) : (
            filtered.map((ord) => {
              const statusCfg = ORDER_STATUS_CONFIG[ord.status];
              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 space-y-3 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-zinc-100">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-zinc-500">•</span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateIndo(ord.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-zinc-500 font-semibold uppercase text-[10px]">
                        Sparepart Dipesan:
                      </span>
                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-zinc-300">
                            <span className="truncate max-w-[220px]">
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-mono text-zinc-400">
                              {formatRupiah(it.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 sm:border-l sm:border-zinc-900 sm:pl-3">
                      <div className="flex justify-between text-zinc-400">
                        <span>Penerima:</span>
                        <span className="text-zinc-200 font-medium">{ord.customerName}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Ekspedisi:</span>
                        <span className="text-zinc-200 font-medium">{ord.shippingMethod}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Metode Bayar:</span>
                        <span className="text-zinc-200 font-medium">{ord.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white pt-1">
                        <span>Total Tagihan:</span>
                        <span className="text-red-400">{formatRupiah(ord.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking number if shipped */}
                  {ord.trackingNumber && (
                    <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Truck className="w-4 h-4" />
                        <span>No. Resi Pengiriman: <strong className="font-mono">{ord.trackingNumber}</strong></span>
                      </div>
                      <span className="text-[11px] text-purple-400">Sedang Diantar Kurir</span>
                    </div>
                  )}

                  {/* Admin notes if any */}
                  {ord.adminNotes && (
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                      <strong className="text-zinc-400">Catatan Admin:</strong> {ord.adminNotes}
                    </div>
                  )}

                  {/* Action Buttons based on status */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900">
                    <p className="text-[11px] text-zinc-500 italic">{statusCfg.desc}</p>

                    <div className="flex items-center gap-2">
                      {ord.paymentProofUrl && (
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Lihat Struk Terkirim</span>
                        </button>
                      )}

                      {ord.status === 'menunggu_pembayaran' && (
                        <button
                          onClick={() => onUploadProof(ord)}
                          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-red-600/30"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Bukti Transfer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Preview Struk Bukti */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 bg-zinc-950/90 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white">
                  Bukti Transfer ({selectedOrder.orderNumber})
                </h4>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={selectedOrder.paymentProofUrl}
                alt="Bukti Transfer"
                className="max-h-80 w-full object-contain rounded-xl border border-zinc-800 bg-zinc-950"
              />
              <p className="text-xs text-zinc-400 text-center">
                Diunggah pada: {formatDateIndo(selectedOrder.paymentProofUploadedAt || selectedOrder.updatedAt)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
