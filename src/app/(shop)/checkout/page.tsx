'use client';

import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    delivery_date: '',
    delivery_time: '',
    delivery_address: '',
    comment: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const orderItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price: product.price,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: orderItems }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.order_id);
        clearCart();
      } else {
        setError(data.error || 'Ошибка при оформлении заказа');
      }
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Заказ оформлен!</h1>
          <p className="text-gray-500 mb-2">Номер вашего заказа: <strong className="text-gray-900">#{success}</strong></p>
          <p className="text-gray-500 mb-8">
            Мы свяжемся с вами в ближайшее время для подтверждения. Спасибо за покупку! 🌸
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/catalog" className="bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-semibold transition-colors">
              Продолжить покупки
            </Link>
            <Link href="/" className="border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
        <Link href="/catalog" className="bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-600 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Назад в корзину
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-5">Контактные данные</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ваше имя *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (необязательно)</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ivan@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-5">Дата и место получения</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Желаемая дата</label>
                <input
                  type="date"
                  name="delivery_date"
                  value={form.delivery_date}
                  onChange={handleChange}
                  min={today}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Желаемое время</label>
                <select
                  name="delivery_time"
                  value={form.delivery_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
                >
                  <option value="">Не важно</option>
                  <option value="09:00-12:00">09:00 – 12:00</option>
                  <option value="12:00-15:00">12:00 – 15:00</option>
                  <option value="15:00-18:00">15:00 – 18:00</option>
                  <option value="18:00-21:00">18:00 – 21:00</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Адрес доставки</label>
                <input
                  type="text"
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  placeholder="ул. Ленина, 5, кв. 12 (или «Самовывоз»)"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Пожелания</h2>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={3}
              placeholder="Пожелания по букету, открытка, поздравление и т.д."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition-colors"
          >
            {loading ? 'Оформляем...' : 'Подтвердить заказ'}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
              <Package size={18} className="text-rose-400" /> Ваш заказ
            </h2>
            <div className="space-y-4 mb-5">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <img src={product.image_url || ''} alt={product.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{quantity} шт × {product.price.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-sm font-bold text-gray-900">{(product.price * quantity).toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Итого</span>
                <span className="font-bold text-2xl text-gray-900">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">+ стоимость доставки</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
