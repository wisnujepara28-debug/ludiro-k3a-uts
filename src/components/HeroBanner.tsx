import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Database, Sparkles } from 'lucide-react';

export const HeroBanner: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Katalog Sparepart Motor Racing & Harian Terlengkap</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Upgrade Performa & Gaya <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">
                Motor Impian Anda
              </span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Tersedia 12 produk pilihan dalam 3 kategori utama: <strong>Mesin & Performa</strong>,{' '}
              <strong>Pengereman & Kaki-kaki</strong>, serta <strong>Kelistrikan & Aksesoris</strong>. 
              Semua data produk, pesanan, dan bukti transfer terhubung langsung ke Firestore Real Database.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all active:scale-95"
              >
                Lihat Katalog Produk
              </button>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Single Source of Truth: Firestore DB</span>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/90 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">100% Original</h4>
                  <p className="text-[11px] text-zinc-400">Garansi Pabrikan</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/90 flex items-center justify-center text-orange-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">Kirim Cepat</h4>
                  <p className="text-[11px] text-zinc-400">JNE, J&T, SiCepat</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/90 flex items-center justify-center text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">Approval Cepat</h4>
                  <p className="text-[11px] text-zinc-400">Verifikasi Struk Real-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Highlights Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-400">Live Database Aktif</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">3 Kategori • 12 SKU</span>
              </div>

              <div className="space-y-3.5 my-5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🔥</span>
                    <div>
                      <p className="font-semibold text-zinc-200">Mesin & Performa</p>
                      <p className="text-[11px] text-zinc-400">Bore Up, Camshaft, PWK, ECU BRT</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-400">4 Produk</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🛑</span>
                    <div>
                      <p className="font-semibold text-zinc-200">Pengereman & Kaki-kaki</p>
                      <p className="text-[11px] text-zinc-400">Brembo CNC, RCB S1, YSS G-Sport, TDR</p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-400">4 Produk</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">⚡</span>
                    <div>
                      <p className="font-semibold text-zinc-200">Kelistrikan & Aksesoris</p>
                      <p className="text-[11px] text-zinc-400">Biled Matrix, Koil Kawahara, Yoshimura</p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-400">4 Produk</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-zinc-400">
                🛒 Keranjang Belanja • 🧾 Approval Bukti Transfer • 📊 Laporan Sales
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
