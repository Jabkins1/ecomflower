import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, phone, email, delivery_date, delivery_time, delivery_address, comment, items } = body;

    if (!customer_name || !phone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }

    const db = await getDb();
    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

    const result = await db.prepare(`
      INSERT INTO orders (customer_name, phone, email, delivery_date, delivery_time, delivery_address, comment, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(customer_name, phone, email || null, delivery_date || null, delivery_time || null, delivery_address || null, comment || null, total);
    const orderId = result.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      await insertItem.run(orderId, item.product_id || null, item.product_name, item.quantity, item.price);
    }
    return NextResponse.json({ success: true, order_id: orderId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка при создании заказа' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const orders = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
