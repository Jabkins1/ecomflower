import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, slug, description, image_url } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Название и slug обязательны' }, { status: 400 });
    }
    const db = await getDb();
    const existing = await db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, id);
    if (existing) {
      return NextResponse.json({ error: 'Категория с таким slug уже существует' }, { status: 400 });
    }
    await db.prepare('UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?')
      .run(name, slug, description || null, image_url || null, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось обновить категорию' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const count = ((await db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(id)) as unknown as { c: number }).c;
    if (count > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить: в категории есть ${count} товаров. Сначала переназначьте или удалите их.` },
        { status: 400 }
      );
    }
    await db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось удалить категорию' }, { status: 500 });
  }
}
