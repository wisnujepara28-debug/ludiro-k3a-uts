import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, recordCustomerOrder } from '../services/db';
import { formatRupiah } from '../utils/formatters';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const SHIPPING_OPTIONS = [
  { id: 'jne', name: 'JNE Regular', cost: 24000, est: '2-3 Hari' },
  { id: 'jnt', name: 'J&T Express', cost: 26000, est: '1-2 Hari' },
  { id: 'sicepat', name: 'SiCepat BEST', cost: 30000, est: '1 Hari (Next Day)' },
];

const PAYMENT_METHODS = [
  {
    id: 'bca',
    name: 'Transfer Bank BCA',
    accountNumber: '8291-039-121',
    accountName: 'PT MotoParts Indonesia',
    badge: 'Verifikasi Cepat',
  },
  {
    id: 'mandiri',
    name: 'Transfer Bank Mandiri',
    accountNumber: '137-00-1829-1021',
    accountName: 'PT MotoParts Indonesia',
    badge: 'Otomatis',
  },
  {
    id: 'qris',
    name: 'QRIS (Gopay / OVO / Dana / BCA Mobile)',
    accountNumber: 'NMID: ID102938472910',
    accountName: 'MotoParts ID Official',
    badge: 'Scan Langsung',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Step 1 or Step 2
  const [step, setStep] = useState<1 | 2>(1);

  // Customer & Shipping State
  const [name, setName] = useState(user?.displayName || 'Budi Santoso');
  const [email, setEmail] = useState(user?.email || 'wisnujepara28@gmail.com');
  const [phone, setPhone] = useState('081298765432');
  const [address, setAddress] = useState('Jl. Pemuda No. 88, RT 02/RW 04, Kel. Potroyudan');
  const [city, setCity] = useState('Jepara, Jawa Tengah');
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);

  // Payment Proof State (Mandatory)
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  if (!isOpen) return null;

  const totalAmount = subtotal + selectedShipping.cost;

  // Move to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMsg('Mohon lengkapi seluruh data penerima dan alamat pengiriman.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Keranjang belanja kosong.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  // Upload Photo File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentProofUrl(event.target?.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Quick Sample Receipt Generator for instant demo testing
  const handleGenerateSampleReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 440, 560);

      // Header Bar
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 440, 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('BUKTI TRANSFER PEMBAYARAN', 50, 42);

      // Body text
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '13px sans-serif';
      ctx.fillText('Merchant: MotoParts ID Official', 35, 105);
      ctx.fillText(`Metode: ${selectedPayment.name}`, 35, 130);
      ctx.fillText(`Rek Tujuan: ${selectedPayment.accountNumber}`, 35, 155);
      ctx.fillText(`Penerima: ${selectedPayment.accountName}`, 35, 180);
      ctx.fillText(`Pengirim: ${name}`, 35, 205);
      ctx.fillText(`Waktu: ${new Date().toLocaleString('id-ID')}`, 35, 230);

      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(35, 250);
      ctx.lineTo(405, 250);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('STATUS: BERHASIL', 35, 290);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`Nominal: ${formatRupiah(totalAmount)}`, 35, 330);

      ctx.fillStyle = '#71717a';
      ctx.font = '12px sans-serif';
      ctx.fillText(`No. Ref: TRX-${Date.now()}`, 35, 370);
      ctx.fillText('Terverifikasi Bank Jaringan ATM Bersama / Prima', 35, 395);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(35, 430, 370, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('LUNAS - SIAP DI-APPROVE ADMIN GUDANG', 70, 450);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPaymentProofUrl(dataUrl);
      setErrorMsg('');
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(selectedPayment.accountNumber.replace(/[^0-9]/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  // Submit Final Order with Mandatory Proof
  const handleSubmitFinalOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProofUrl) {
      setErrorMsg('Bukti transfer wajib dilampirkan sebelum pesanan dapat diproses.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ORD-${todayStr}-${randomSuffix}`;
      const customerUserId = user?.uid || `guest-${Date.now()}`;

      const orderPayload: Omit<Order, 'id'> = {
        orderNumber,
        userId: customerUserId,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: address.trim(),
        shippingCity: city.trim(),
        shippingMethod: `${selectedShipping.name} (${selectedShipping.est})`,
        paymentMethod: selectedPayment.name,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
          subtotal: item.product.price * item.quantity,
        })),
        subtotal,
        shippingCost: selectedShipping.cost,
        totalAmount,
        status: 'menunggu_approval', // Directly awaiting admin approval since proof is attached
        paymentProofUrl: paymentProofUrl,
        paymentProofUploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orderId = await createOrder(orderPayload);

      // Record customer profile
      await recordCustomerOrder(
        customerUserId,
        name.trim(),
        email.trim(),
        phone.trim(),
        address.trim(),
        totalAmount
      );

      clearCart();

      const createdOrder: Order = {
        ...orderPayload,
        id: orderId,
      };

      setOrderSuccess(createdOrder);
      onOrderCreated(createdOrder);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('Gagal memproses pesanan ke Firestore. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 my-6">
        {/* Header with Step Indicator */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Checkout Pembelian Sparepart
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className={step === 1 ? 'text-red-400 font-bold' : 'text-zinc-500'}>
                  1. Data Penerima & Kurir
                </span>
                <span>•</span>
                <span className={step === 2 ? 'text-red-400 font-bold' : 'text-zinc-500'}>
                  2. Transfer & Wajib Bukti Pembayaran
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Modal View */}
        {orderSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Pesanan & Bukti Transfer Berhasil Dikirim!</h3>
              <p className="text-sm font-mono text-amber-400 mt-1 font-bold">
                No. Pesanan: {orderSuccess.orderNumber}
              </p>
            </div>
            <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
              Bukti pembayaran telah tersimpan di <strong>Real Database Firestore</strong> dengan status{' '}
              <strong className="text-blue-400">Menunggu Approval Admin</strong>. Admin gudang akan
              segera memverifikasi struk Anda dan menyiapkan pengiriman barang.
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
              >
                Lihat Status di Riwayat Pesanan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 1: INFORMASI PELANGGAN & PILIH METODE BAYAR */}
            {/* ========================================================= */}
            {step === 1 && (
              <form onSubmit={handleProceedToStep2} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Form Penerima & Alamat */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> 1. Data Penerima & Lokasi Pengiriman
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nama Lengkap Penerima
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          No. WhatsApp / HP
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Alamat Lengkap
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Kota / Kabupaten
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Pilihan Ekspedisi */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-orange-400" /> Ekspedisi Pengiriman
                      </label>
                      <div className="space-y-2">
                        {SHIPPING_OPTIONS.map((opt) => (
                          <label
                            key={opt.id}
                            onClick={() => setSelectedShipping(opt)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedShipping.id === opt.id
                                ? 'bg-red-950/40 border-red-500 text-white'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shipping"
                                checked={selectedShipping.id === opt.id}
                                onChange={() => setSelectedShipping(opt)}
                                className="accent-red-500"
                              />
                              <span className="font-semibold text-zinc-200">{opt.name}</span>
                              <span className="text-[11px] text-zinc-500">({opt.est})</span>
                            </div>
                            <span className="font-bold text-zinc-200">{formatRupiah(opt.cost)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pilihan Metode Bayar & Rangkuman */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" /> 2. Pilih Bank / Metode Transfer
                    </h3>

                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <label
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm)}
                          className={`block p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedPayment.id === pm.id
                              ? 'bg-red-950/40 border-red-500 text-white shadow-md'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={selectedPayment.id === pm.id}
                                onChange={() => setSelectedPayment(pm)}
                                className="accent-red-500"
                              />
                              <span className="font-bold text-zinc-100">{pm.name}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-semibold">
                              {pm.badge}
                            </span>
                          </div>
                          <div className="ml-5 text-[11px] text-zinc-400">
                            Rekening: <span className="font-mono text-zinc-300">{pm.accountNumber}</span> a.n {pm.accountName}
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Ringkasan Belanja */}
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                      <span className="font-bold text-zinc-300">Rincian Tagihan ({cart.length} item):</span>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1 divide-y divide-zinc-900">
                        {cart.map((item) => (
                          <div key={item.product.id} className="pt-1 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-300 truncate max-w-[200px]">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-mono text-zinc-400">
                              {formatRupiah(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-zinc-800 space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-400">
                          <span>Subtotal:</span>
                          <span>{formatRupiah(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Ongkir ({selectedShipping.name}):</span>
                          <span>{formatRupiah(selectedShipping.cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-zinc-800">
                          <span>Total Tagihan:</span>
                          <span className="text-red-400">{formatRupiah(totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cart.length === 0}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <span>Lanjut ke Instruksi Transfer & Kirim Bukti (Wajib)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* STEP 2: INSTRUKSI TRANSFER & WAJIB UPLOAD BUKTI TRANSFER */}
            {/* ========================================================= */}
            {step === 2 && (
              <form onSubmit={handleSubmitFinalOrder} className="space-y-5">
                {/* Notice: Wajib Kirim Bukti */}
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">Wajib Mengirim Bukti Transfer:</span>
                    <p className="text-[11px] text-amber-300/90 mt-0.5">
                      Untuk memverifikasi pembayaran dan memproses pesanan sparepart Anda, Anda
                      <strong> diwajibkan</strong> mengunggah foto struk/bukti transfer bank sebelum menyelesaikan pesanan.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Detail Rekening & Nominal */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Rincian Transfer Pembayaran:
                      </span>

                      {/* Total Amount to Transfer */}
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-400">Nominal Transfer Tepat</p>
                          <p className="text-lg font-black text-red-400 font-mono">
                            {formatRupiah(totalAmount)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAmount}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1 font-semibold"
                        >
                          {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAmount ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>

                      {/* Destination Bank Account */}
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">
                            {selectedPayment.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-semibold">
                            {selectedPayment.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-white tracking-wide">
                            {selectedPayment.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyAccount}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1 font-semibold"
                          >
                            {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedAccount ? 'Tersalin' : 'Salin Rek'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Atas Nama: <strong className="text-zinc-200">{selectedPayment.accountName}</strong>
                        </p>
                      </div>

                      <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-900">
                        <div className="flex justify-between">
                          <span>Penerima Paket:</span>
                          <span className="font-semibold text-zinc-200">{name} ({phone})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kurir:</span>
                          <span className="font-semibold text-zinc-200">{selectedShipping.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Upload Bukti Transfer (WAJIB) */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-red-400" /> Upload Bukti Transfer (WAJIB)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-black">
                          *Wajib
                        </span>
                      </div>

                      {paymentProofUrl ? (
                        <div className="relative rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 flex flex-col items-center">
                          <img
                            src={paymentProofUrl}
                            alt="Preview Struk Transfer"
                            className="max-h-48 object-contain rounded-lg border border-zinc-800"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Struk Terlampir
                            </span>
                            <button
                              type="button"
                              onClick={() => setPaymentProofUrl('')}
                              className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold ml-2"
                            >
                              Ganti Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl p-5 text-center bg-zinc-900/60 transition-colors">
                          <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-zinc-300">
                            Pilih Foto Struk / Screenshot Transfer
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Format JPG, PNG, atau WebP (Maks. 4 MB)
                          </p>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-3 block w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                          />

                          {/* Quick Sample Receipt Button for easy testing */}
                          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex justify-center">
                            <button
                              type="button"
                              onClick={handleGenerateSampleReceipt}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-semibold transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Gunakan Sample Struk Otomatis (Demo Cepat)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {!paymentProofUrl && (
                        <p className="text-[11px] text-rose-400 italic text-center">
                          *Silakan unggah struk atau klik tombol sample struk di atas untuk melanjutkan.
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="py-3 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Kembali
                      </button>

                      <button
                        type="submit"
                        disabled={!paymentProofUrl || isSubmitting}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan Pesanan & Bukti...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Kirim Pesanan & Bukti Transfer (Wajib)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
