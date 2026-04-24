import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, old_price, category_id, image_url, in_stock, is_featured } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Название и цена обязательны' }, { status: 400 });
    }

    const db = await getDb();
    const result = db.prepare(`
      INSERT INTO products (name, description, price, old_price, category_id, image_url, in_stock, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description || null, price, old_price || null, category_id || null, image_url || null, in_stock ?? 1, is_featured ?? 0);

    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
