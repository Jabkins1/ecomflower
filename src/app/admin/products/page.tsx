'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Category { id: number; name: string; slug: string; }

const emptyForm = {
  name: '', description: '', price: '', old_price: '', category_id: '',
  image_url: '', in_stock: '1', is_featured: '0',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/products', { cache: 'no-store' });
    const data = await res.json();
    setProducts(data.products);
    const catRes = await fetch('/api/admin/categories', { cache: 'no-store' });
    const catData = await catRes.json();
    setCategories(catData);
    setLoading(false);
  };

  useEffect(() => { setMounted(true); load(); }, []);

  if (!mounted) return null;

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      old_price: String(p.old_price || ''), category_id: String(p.category_id || ''),
      image_url: p.image_url || '', in_stock: String(p.in_stock), is_featured: String(p.is_featured),
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      name: form.name, description: form.description,
      price: parseFloat(form.price), old_price: form.old_price ? parseFloat(form.old_price) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      image_url: form.image_url, in_stock: parseInt(form.in_stock), is_featured: parseInt(form.is_featured),
    };

    const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} позиций в каталоге</p>
        </div>
        <button onClick={openAdd} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Добавить товар
        </button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Редактировать товар' : 'Новый товар'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="Название товара" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none" placeholder="Описание товара" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Старая цена (₽)</label>
                  <input type="number" value={form.old_price} onChange={e => setForm(p => ({ ...p, old_price: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400">
                  <option value="">— Без категории —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL изображения</label>
                <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400" placeholder="https://..." />
                {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-24 h-24 object-cover rounded-lg" />}
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.in_stock === '1'} onChange={e => setForm(p => ({ ...p, in_stock: e.target.checked ? '1' : '0' }))} className="w-4 h-4 accent-green-500" />
                  В наличии
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured === '1'} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked ? '1' : '0' }))} className="w-4 h-4 accent-green-500" />
                  Хит продаж
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <Check size={16} /> {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Фото</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Название</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Категория</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Цена</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Наличие</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Хит</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <img src={p.image_url || ''} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 max-w-[200px] truncate">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 max-w-[200px] truncate">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{p.price.toLocaleString('ru-RU')} ₽</span>
                      {p.old_price && <span className="text-xs text-gray-400 line-through ml-1">{p.old_price.toLocaleString('ru-RU')}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {p.in_stock ? 'Да' : 'Нет'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_featured ? <span className="text-amber-500 text-base">★</span> : <span className="text-gray-300">☆</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
