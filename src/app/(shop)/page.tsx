import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Truck, Clock, Star, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = await getDb();
  const featured = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = 1 AND p.in_stock = 1
    ORDER BY p.created_at DESC LIMIT 6
  `).all() as unknown as Product[];

  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all() as unknown as { id: number; name: string; slug: string }[];

  const categoryImages: Record<string, string> = {
    'rozy':     'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&q=85',
    'piony':    'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=500&q=85',
    'tyulpany': 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=500&q=85',
    'bukety':   'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=500&q=85',
    'polevye':  'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=500&q=85',
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <p className="text-rose-500 font-medium text-sm uppercase tracking-widest mb-3">Свежие цветы ежедневно</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Дарите цветы<br />
              <span className="text-rose-500">с любовью</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
              Свежие розы, пышные пионы, нежные тюльпаны и авторские букеты. Доставим в день заказа по всему городу.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/catalog" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-full font-semibold transition-colors flex items-center justify-center gap-2">
                Смотреть каталог <ArrowRight size={18} />
              </Link>
              <Link href="/order-terms" className="border border-rose-200 hover:border-rose-400 text-rose-600 px-8 py-3.5 rounded-full font-semibold transition-colors text-center">
                Условия заказа
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-3xl opacity-40" />
              <img
                src="https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=700&q=85"
                alt="Красивый букет цветов"
                className="relative z-10 w-full rounded-3xl shadow-2xl object-cover aspect-square"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Быстрая доставка', desc: 'Доставим за 2–3 часа по городу' },
              { icon: Star, title: 'Свежие цветы', desc: 'Только свежесрезанные цветы' },
              { icon: Clock, title: 'Работаем ежедневно', desc: 'С 8:00 до 22:00 без выходных' },
              { icon: Shield, title: 'Гарантия качества', desc: 'Вернём деньги если не понравится' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-4">
                <div className="bg-rose-50 p-3 rounded-2xl mb-3">
                  <Icon className="text-rose-500" size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-rose-500 text-sm font-medium uppercase tracking-widest mb-1">Ассортимент</p>
            <h2 className="text-3xl font-bold text-gray-900">Категории</h2>
          </div>
          <Link href="/catalog" className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1">
            Все товары <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=400&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-500 text-sm font-medium uppercase tracking-widest mb-1">Популярное</p>
              <h2 className="text-3xl font-bold text-gray-900">Хиты продаж</h2>
            </div>
            <Link href="/catalog" className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1">
              Весь каталог <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Нужен особенный букет?</h2>
          <p className="text-rose-100 text-lg mb-8 max-w-lg mx-auto">
            Оставьте заявку на предварительный заказ — наш флорист соберёт букет именно для вас
          </p>
          <Link href="/checkout" className="bg-white text-rose-600 hover:bg-rose-50 px-8 py-3.5 rounded-full font-bold transition-colors inline-flex items-center gap-2">
            Оформить заказ <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
