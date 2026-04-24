'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ApiResponse {
  products: Product[];
  categories: { id: number; name: string; slug: string }[];
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ApiResponse>({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);

    fetch(`/api/products?${params}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory, search]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    router.push(`/catalog?${params}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Каталог цветов</h1>
        <p className="text-gray-500">Свежие цветы и красивые букеты на любой вкус</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
              <SlidersHorizontal size={16} />
              <span>Категории</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!activeCategory ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Все цветы
              </button>
              {data.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeCategory === cat.slug ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🌸</p>
              <p className="text-gray-500 text-lg">Ничего не найдено</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{data.products.length} товаров</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  );
}
