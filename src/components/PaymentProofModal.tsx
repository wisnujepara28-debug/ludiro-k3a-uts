import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../utils/formatters';
import { uploadPaymentProof } from '../services/db';

interface PaymentProofModalProps {
  order: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  const [filePreview, setFilePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Quick sample receipt generator for demo ease
  const handleUseSampleReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 400, 550);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, 400, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('BUKTI TRANSFER RESMI', 70, 38);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '13px sans-serif';
      ctx.fillText('Toko Sparepart: MotoParts ID', 30, 90);
      ctx.fillText(`No. Pesanan: ${order.orderNumber}`, 30, 115);
      ctx.fillText(`Waktu: ${new Date().toLocaleString('id-ID')}`, 30, 140);
      ctx.fillText(`Metode: ${order.paymentMethod}`, 30, 165);

      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(30, 185);
      ctx.lineTo(370, 185);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('STATUS: BERHASIL', 30, 220);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Total: ${formatRupiah(order.totalAmount)}`, 30, 255);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Penerima: PT MotoParts Indonesia`, 30, 290);
      ctx.fillText(`Pengirim: ${order.customerName}`, 30, 315);
      ctx.fillText(`ID Transaksi: TRX-${Date.now()}`, 30, 340);

      ctx.fillStyle = '#52525b';
      ctx.font = 'italic 11px sans-serif';
      ctx.fillText('Struk digital terenkripsi MotoParts ID Firestore', 30, 500);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFilePreview(dataUrl);
      setErrorMsg('');
    }
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.totalAmount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePreview) {
      setErrorMsg('Silakan pilih foto atau gunakan struk sampel bukti pembayaran.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await uploadPaymentProof(order.id, filePreview);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Upload payment proof error:', err);
      setErrorMsg('Gagal mengunggah bukti ke database. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Upload Bukti Pembayaran Transfer
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pesanan: <span className="font-mono text-zinc-200">{order.orderNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white">Bukti Pembayaran Terkirim!</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Bukti pembayaran Anda telah tersimpan di real database. Status pesanan kini{' '}
              <strong className="text-blue-400">Menunggu Approval Admin</strong>. Admin akan
              segera memverifikasi struk Anda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitProof} className="p-4 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Transfer Instructions Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Total Yang Harus Ditransfer:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-red-400">
                    {formatRupiah(order.totalAmount)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="p-1 text-zinc-400 hover:text-white"
                    title="Salin nominal transfer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-300 border-t border-zinc-900 pt-2 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tujuan Pembayaran:</span>
                  <span className="font-semibold text-zinc-200">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Penerima:</span>
                  <span className="font-semibold text-zinc-200">PT MotoParts Indonesia</span>
                </div>
              </div>
            </div>

            {/* File Upload / Preview Area */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                Pilih Foto Struk / Screenshot Bukti Transfer:
              </label>

              {filePreview ? (
                <div className="relative rounded-xl border border-zinc-700 bg-zinc-950 p-3 flex flex-col items-center">
                  <img
                    src={filePreview}
                    alt="Preview Bukti Pembayaran"
                    className="max-h-60 rounded-lg object-contain"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFilePreview('')}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Ganti Foto Struk
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl p-6 text-center bg-zinc-950/60 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-300">
                    Klik untuk memilih file foto bukti pembayaran
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Format JPG, PNG, atau WebP (Maks. 3 MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-3 block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />

                  {/* Convenient Sample Receipt for quick testing */}
                  <div className="mt-3 pt-3 border-t border-zinc-900 flex justify-center">
                    <button
                      type="button"
                      onClick={handleUseSampleReceipt}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800/80 text-red-300 text-xs font-medium transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Gunakan Sample Struk Otomatis (Demo)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Warning Banner */}
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Wajib Mengunggah Bukti:</strong> Admin hanya akan memproses pesanan sparepart setelah bukti transfer resmi terverifikasi.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors"
              >
                Batal / Tutup
              </button>
              <button
                type="submit"
                disabled={!filePreview || isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Mengirim ke Firestore...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Kirim Bukti Transfer (Wajib)
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
