'use client';

import { useEffect, useState, Fragment } from 'react';
import { Order, OrderItem } from '@/lib/types';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтверждён', processing: 'В работе',
  delivered: 'Доставлен', cancelled: 'Отменён',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    setOrders(data.orders);
    setItems(data.items);
    setLoading(false);
  };

  useEffect(() => { setMounted(true); load(); }, []);

  if (!mounted) return null;

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await load();
  };

  const deleteOrder = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Удалить заказ #${id}? Это действие нельзя отменить.`)) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    if (expanded === id) setExpanded(null);
    await load();
  };

  const getOrderItems = (orderId: number) => items.filter(i => i.order_id === orderId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length > 0 ? `${orders.length} заказов` : 'Управление заказами клиентов'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Загрузка...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500">Заказов пока нет</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-8" />
                <th className="px-4 py-3 text-left font-semibold text-gray-500">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Клиент</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Телефон</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Дата доставки</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Сумма</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Статус</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Создан</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <Fragment key={order.id}>
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {expanded === order.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-700">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <a href={`tel:${order.phone}`} className="hover:text-green-500" onClick={e => e.stopPropagation()}>{order.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {order.delivery_date ? `${order.delivery_date}${order.delivery_time ? ' ' + order.delivery_time : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{order.total.toLocaleString('ru-RU')} ₽</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => deleteOrder(order.id, e)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить заказ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr>
                      <td colSpan={9} className="bg-gray-50 px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Состав заказа</h4>
                            <div className="space-y-1.5">
                              {getOrderItems(order.id).map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{item.product_name} × {item.quantity}</span>
                                  <span className="font-medium text-gray-800">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wider">Детали</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              {order.email && <p>Email: {order.email}</p>}
                              {order.delivery_address && <p>Адрес: {order.delivery_address}</p>}
                              {order.comment && <p>Пожелания: {order.comment}</p>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
