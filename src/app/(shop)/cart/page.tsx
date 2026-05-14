'use client';

import { useCart } from '@/components/CartProvider';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🛍️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
        <p className="text-gray-500 mb-8">Добавьте понравившиеся цветы из каталога</p>
        <Link href="/catalog" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-full font-semibold transition-colors inline-flex items-center gap-2">
          <ShoppingBag size={18} /> Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
              <Link href={`/catalog/${product.id}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
                <img
                  src={product.image_url || ''}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/catalog/${product.id}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors text-sm block mb-1 line-clamp-2">
                  {product.name}
                </Link>
                {product.category_name && (
                  <p className="text-green-400 text-xs mb-3">{product.category_name}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-600 flex items-center justify-center transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-600 flex items-center justify-center transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      {(product.price * quantity).toLocaleString('ru-RU')} ₽
                    </span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Итого</h2>

            <div className="space-y-3 mb-5">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate max-w-[60%]">{product.name}</span>
                  <span className="text-gray-700 font-medium shrink-0 ml-2">{(product.price * quantity).toLocaleString('ru-RU')} ₽</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Итого</span>
                <span className="font-bold text-2xl text-gray-900">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Доставка рассчитывается при оформлении</p>
            </div>

            <Link href="/checkout" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              Оформить заказ <ArrowRight size={18} />
            </Link>

            <Link href="/catalog" className="w-full mt-3 border border-gray-200 hover:border-green-300 text-gray-600 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
