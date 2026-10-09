import React, { useState } from 'react';
import { X, ShoppingCart, Star, ShieldCheck, Check, Truck } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, CATEGORY_NAMES } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-zinc-950">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-zinc-950/80 text-red-400 border border-red-900/60">
                {CATEGORY_NAMES[product.category]}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="font-semibold text-zinc-300">{product.brand}</span>
                <span className="font-mono">{product.sku}</span>
              </div>

              <h2 className="text-lg font-extrabold text-white leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 my-2 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{product.soldCount} Terjual</span>
                <span className="text-zinc-500">•</span>
                <span
                  className={
                    product.stock > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
                  }
                >
                  {product.stock > 0 ? `Stok: ${product.stock} pcs` : 'Stok Habis'}
                </span>
              </div>

              <div className="my-3">
                <p className="text-2xl font-black text-white">
                  {formatRupiah(product.price)}
                </p>
              </div>

              {/* Compatibility */}
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1 mb-3">
                <span className="font-bold text-zinc-300">Kompatibilitas Motor:</span>
                <p className="text-zinc-400">{product.compatibility}</p>
              </div>

              {/* Description */}
              <div className="text-xs text-zinc-300 leading-relaxed max-h-28 overflow-y-auto pr-1">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              {product.stock > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-700 rounded-xl bg-zinc-950 px-2 py-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-2 py-1 text-zinc-400 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-semibold text-white">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="px-2 py-1 text-zinc-400 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" /> Masuk Keranjang!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Masukkan Keranjang
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-400 text-center text-sm font-medium">
                  Stok barang ini sedang kosong
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> 100% Produk Asli
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" /> Ekspedisi Terpercaya
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
