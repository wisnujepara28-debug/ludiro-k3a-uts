import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-base text-white">Keranjang Belanja</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {cart.length} item
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-500">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-bold text-base text-zinc-200">Keranjang masih kosong</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Yuk jelajahi 12 produk sparepart motor pilihan dan tambahkan ke keranjang Anda!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-500 transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs text-zinc-400 font-medium">Daftar Sparepart</span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                  >
                    Kosongkan Keranjang
                  </button>
                </div>

                {cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex gap-3.5 items-center hover:border-zinc-700/80 transition-all"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-zinc-900 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                        {product.brand}
                      </p>
                      <h4 className="text-xs font-bold text-zinc-100 truncate">{product.name}</h4>
                      <p className="text-xs font-semibold text-zinc-300 mt-0.5">
                        {formatRupiah(product.price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-zinc-700/80 rounded-lg bg-zinc-900 text-xs">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="px-2 py-0.5 text-zinc-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-bold text-white">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="px-2 py-0.5 text-zinc-400 hover:text-white font-bold disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer with Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/90 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Subtotal Produk:</span>
                <span className="font-semibold text-zinc-200">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-zinc-300">Estimasi Total:</span>
                <span className="font-extrabold text-lg text-white">{formatRupiah(subtotal)}</span>
              </div>

              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Checkout Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
