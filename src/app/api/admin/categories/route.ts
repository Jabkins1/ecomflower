import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.name
    `).all();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, slug, description } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Название и slug обязательны' }, { status: 400 });
    }
    const db = await getDb();
    const existing = await db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) {
      return NextResponse.json({ error: 'Категория с таким slug уже существует' }, { status: 400 });
    }
    const result = await db.prepare(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)'
    ).run(name, slug, description || null);
    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось создать категорию' }, { status: 500 });
  }
}
