'use client';

import { useEffect, useState, useRef } from 'react';
import { Review } from '@/lib/types';
import { Star, Send, ImagePlus, X } from 'lucide-react';

const initialForm = { name: '', phone: '', rating: '5', text: '' };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/reviews', { cache: 'no-store' });
    setReviews(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Изображение слишком большое (макс. 2 МБ)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rating: Number(form.rating), image }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Не удалось отправить отзыв');
      setSaving(false);
      return;
    }
    setForm(initialForm);
    setImage(null);
    if (fileRef.current) fileRef.current.value = '';
    setMessage(data.message || 'Отзыв отправлен на модерацию');
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <p className="text-green-500 font-medium text-sm uppercase tracking-widest mb-3">Отзывы</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Отзывы клиентов ZELENAYA</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Оставьте отзыв — он появится на сайте после одобрения администратором.</p>
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
              {review.image_url && (
                <img src={review.image_url} alt="Фото к отзыву" className="mt-4 rounded-2xl max-h-64 object-cover" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Написать отзыв</h2>
          <div className="space-y-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Ваше имя *" />
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Телефон (необязательно)" />
            <select value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
              <option value="5">5 звёзд</option>
              <option value="4">4 звезды</option>
              <option value="3">3 звезды</option>
              <option value="2">2 звезды</option>
              <option value="1">1 звезда</option>
            </select>
            <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none" placeholder="Текст отзыва *" />

            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" id="review-image" />
              {image ? (
                <div className="relative inline-block">
                  <img src={image} alt="Превью" className="h-24 rounded-xl object-cover" />
                  <button onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor="review-image" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 cursor-pointer transition-colors">
                  <ImagePlus size={18} /> Прикрепить фото (до 2 МБ)
                </label>
              )}
            </div>

            {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{message}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <button onClick={submit} disabled={saving || !form.name || !form.text} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
              <Send size={17} /> {saving ? 'Отправляем...' : 'Отправить отзыв'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
