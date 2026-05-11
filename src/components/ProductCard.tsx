'use client';

import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from './CartProvider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <Link href={`/catalog/${product.id}`} className="block relative overflow-hidden aspect-[4/5]">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-sm font-medium px-4 py-1.5 rounded-full">Нет в наличии</span>
          </div>
        )}
        {product.old_price && product.in_stock ? (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Скидка
          </div>
        ) : null}
        {product.is_featured ? (
          <div className="absolute top-3 right-3 bg-amber-400 text-white p-1.5 rounded-full">
            <Star size={12} fill="white" />
          </div>
        ) : null}
      </Link>

      <div className="p-4">
        <Link href={`/catalog/${product.id}`}>
          <h3 className="font-medium text-gray-800 text-sm leading-tight hover:text-green-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {product.category_name && (
          <span className="text-xs text-green-400 font-medium">{product.category_name}</span>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">{product.price.toLocaleString('ru-RU')} ₽</span>
            {product.old_price && (
              <span className="text-sm text-gray-400 line-through ml-2">{product.old_price.toLocaleString('ru-RU')} ₽</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white p-2.5 rounded-xl transition-colors"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
