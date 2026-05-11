import { getDb } from '@/lib/db';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingUp, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await getDb();

  const totalProducts = ((await db.prepare('SELECT COUNT(*) as c FROM products').get()) as unknown as { c: number }).c;
  const totalOrders = ((await db.prepare('SELECT COUNT(*) as c FROM orders').get()) as unknown as { c: number }).c;
  const newOrders = ((await db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='new'").get()) as unknown as { c: number }).c;
  const totalRevenue = ((await db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE status != 'cancelled'").get()) as unknown as { s: number }).s;
  const recentOrders = await db.prepare(`
    SELECT o.*, COUNT(oi.id) as items_count FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id ORDER BY o.created_at DESC LIMIT 5
  `).all() as unknown as ({ items_count: number; id: number; customer_name: string; total: number; status: string; created_at: string })[];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    new: 'Новый', confirmed: 'Подтверждён', processing: 'В работе', delivered: 'Доставлен', cancelled: 'Отменён',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-500 text-sm mt-1">Обзор магазина ZELENAYA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Товаров', value: totalProducts, icon: Package, color: 'rose', href: '/admin/products' },
          { label: 'Всего заказов', value: totalOrders, icon: ShoppingCart, color: 'blue', href: '/admin/orders' },
          { label: 'Новых заказов', value: newOrders, icon: TrendingUp, color: 'amber', href: '/admin/orders' },
          { label: 'Выручка', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, icon: Database, color: 'green', href: '/admin/orders' },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 bg-${color}-50`}>
              <Icon className={`text-${color}-500`} size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Последние заказы</h2>
          <Link href="/admin/orders" className="text-green-500 text-sm hover:text-green-700">Все заказы →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-500">#</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500">Клиент</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500">Позиций</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500">Сумма</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500">Статус</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Заказов пока нет</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-3 text-gray-700">{order.customer_name}</td>
                  <td className="px-6 py-3 text-gray-500">{order.items_count}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">{order.total.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
