import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, old_price, category_id, image_url, in_stock, is_featured } = body;

    const db = await getDb();
    await db.prepare(`
      UPDATE products SET name=?, description=?, price=?, old_price=?, category_id=?, image_url=?, in_stock=?, is_featured=?
      WHERE id=?
    `).run(name, description || null, price, old_price || null, category_id || null, image_url || null, in_stock ?? 1, is_featured ?? 0, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();
    await db.prepare('DELETE FROM products WHERE id=?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
