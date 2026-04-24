import { getDb } from '@/lib/db';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import Link from 'next/link';
import { ArrowLeft, Package, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(id) as (Product & { category_slug?: string }) | undefined;

  if (!product) notFound();

  const related = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ? AND p.id != ? AND p.in_stock = 1 LIMIT 4
  `).all(product.category_id, product.id) as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-600 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Назад в каталог
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
        <div className="relative rounded-3xl overflow-hidden aspect-square shadow-sm">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=700&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-sm font-medium px-5 py-2 rounded-full">Нет в наличии</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category_name && (
            <Link href={`/catalog?category=${product.category_slug}`} className="text-rose-400 text-sm font-medium hover:text-rose-600 transition-colors mb-2">
              {product.category_name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900">{product.price.toLocaleString('ru-RU')} ₽</span>
            {product.old_price && (
              <span className="text-xl text-gray-400 line-through">{product.old_price.toLocaleString('ru-RU')} ₽</span>
            )}
            {product.old_price && (
              <span className="bg-rose-100 text-rose-600 text-sm font-semibold px-3 py-1 rounded-full">
                Скидка {Math.round((1 - product.price / product.old_price) * 100)}%
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          )}

          <AddToCartButton product={product} />

          <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Truck size={17} className="text-rose-400 shrink-0" />
              <span>Доставка по городу за 2–3 часа</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Package size={17} className="text-rose-400 shrink-0" />
              <span>Красивая упаковка в подарок</span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие товары</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <Link key={p.id} href={`/catalog/${p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.image_url || ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-rose-600 font-bold text-sm">{p.price.toLocaleString('ru-RU')} ₽</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
