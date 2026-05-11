'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/lib/types';
import { Star, Send } from 'lucide-react';

const initialForm = { name: '', email: '', phone: '', password: '', rating: '5', text: '' };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/reviews', { cache: 'no-store' });
    setReviews(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rating: Number(form.rating) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Не удалось отправить отзыв');
      setSaving(false);
      return;
    }
    setForm(initialForm);
    setMessage(data.message || 'Отзыв отправлен на модерацию');
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <p className="text-green-500 font-medium text-sm uppercase tracking-widest mb-3">Отзывы</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Отзывы клиентов ZELENAYA</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Зарегистрируйтесь и оставьте отзыв. Он появится на сайте после одобрения администратором.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Загрузка...</div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm text-gray-500">Пока нет одобренных отзывов</div>
          ) : reviews.map(review => (
            <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{review.customer_name}</h3>
                  <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={17} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Написать отзыв</h2>
          <div className="space-y-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Ваше имя *" />
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Email *" />
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Телефон" />
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Пароль *" />
            <select value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
              <option value="5">5 звёзд</option>
              <option value="4">4 звезды</option>
              <option value="3">3 звезды</option>
              <option value="2">2 звезды</option>
              <option value="1">1 звезда</option>
            </select>
            <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={5} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none" placeholder="Текст отзыва *" />
            {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{message}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <button onClick={submit} disabled={saving || !form.name || !form.email || !form.password || !form.text} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
              <Send size={17} /> {saving ? 'Отправляем...' : 'Отправить на модерацию'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
