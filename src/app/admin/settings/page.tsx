'use client';

import { useEffect, useState } from 'react';
import { Check, Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setHeroImageUrl(data.hero_image_url ?? '');
      });
  }, []);

  if (!mounted) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero_image_url: heroImageUrl }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-100 p-2.5 rounded-xl">
          <Settings className="text-green-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки сайта</h1>
          <p className="text-gray-500 text-sm mt-0.5">Внешний вид и контент главной страницы</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-semibold text-gray-800 mb-1">Фоновое изображение hero-секции</h2>
          <p className="text-gray-400 text-sm mb-4">
            Картинка отображается за текстом «Дарите цветы с любовью» с затемнением.
            Вставьте URL изображения (Unsplash, ваш сервер и т.д.).
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL изображения</label>
          <input
            value={heroImageUrl}
            onChange={e => setHeroImageUrl(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
            placeholder="https://images.unsplash.com/photo-...?w=1600&q=85"
          />
          {heroImageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden h-48 w-full bg-gray-100 relative">
              <img src={heroImageUrl} alt="Предпросмотр" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                Дарите цветы с любовью
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Check size={16} />
          {saving ? 'Сохраняем...' : saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}
