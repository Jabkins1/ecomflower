import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const orders = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const items = await db.prepare('SELECT * FROM order_items').all();
    return NextResponse.json({ orders, items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const db = await getDb();
    await db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
