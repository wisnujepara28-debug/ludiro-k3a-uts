import React, { useState } from 'react';
import { ShoppingCart, Star, Eye, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, CATEGORY_NAMES } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative bg-zinc-900/90 rounded-2xl border border-zinc-800 hover:border-zinc-700 overflow-hidden shadow-md hover:shadow-xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-950">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-zinc-950/80 backdrop-blur-sm text-red-400 border border-red-900/40">
            {CATEGORY_NAMES[product.category]}
          </span>
        </div>

        {/* Quick View Floating Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title="Lihat Detail Produk"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Stock warning */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-800 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Stok Habis
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80">
              Sisa {product.stock} unit!
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Compatibility */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-semibold text-zinc-300">{product.brand}</span>
            <span className="font-mono text-zinc-500 text-[10px]">{product.sku}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Compatibility badge */}
          <p className="mt-1.5 text-[11px] text-zinc-400 line-clamp-1 bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-800/80">
            🛵 {product.compatibility}
          </p>
        </div>

        <div className="pt-2 border-t border-zinc-800/80">
          {/* Rating and Sold */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-zinc-500">{product.soldCount} terjual</span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Harga</p>
              <p className="text-base font-extrabold text-white tracking-tight">
                {formatRupiah(product.price)}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 active:scale-95'
              }`}
              title={isOutOfStock ? 'Stok habis' : 'Tambah ke Keranjang'}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
