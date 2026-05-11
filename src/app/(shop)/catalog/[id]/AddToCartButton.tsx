'use client';

import { useCart } from '@/components/CartProvider';
import { Product } from '@/lib/types';
import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.find(i => i.product.id === product.id);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product.in_stock) {
    return (
      <button disabled className="w-full bg-gray-100 text-gray-400 px-6 py-4 rounded-2xl font-semibold cursor-not-allowed">
        Нет в наличии
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handleAdd}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all ${added ? 'bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
      >
        {added ? <><Check size={20} /> Добавлено!</> : <><ShoppingBag size={20} /> В корзину</>}
      </button>
      {inCart && (
        <Link href="/cart" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors">
          Перейти в корзину ({inCart.quantity})
        </Link>
      )}
    </div>
  );
}
