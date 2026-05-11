'use client';

import { useEffect, useState } from 'react';
import { Check, Trash2, X, Star } from 'lucide-react';

interface AdminReview {
  id: number;
  customer_id: number;
  customer_name: string;
  email?: string;
  phone?: string;
  rating: number;
  text: string;
  is_approved: number;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
    setReviews(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setApproved = async (id: number, approved: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved: approved ? 1 : 0 }),
    });
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить отзыв?')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Отзывы</h1>
        <p className="text-gray-500 text-sm mt-1">Модерация отзывов клиентов</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Загрузка...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-gray-500">Отзывов пока нет</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{review.customer_name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {review.is_approved ? 'Одобрен' : 'На модерации'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{review.email || 'без email'} {review.phone ? `· ${review.phone}` : ''}</p>
                  <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString('ru-RU')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setApproved(review.id, true)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Одобрить">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setApproved(review.id, false)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors" title="Скрыть">
                    <X size={18} />
                  </button>
                  <button onClick={() => remove(review.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Удалить">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
