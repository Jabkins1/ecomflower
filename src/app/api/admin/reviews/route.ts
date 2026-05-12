import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const reviews = await db.prepare(`
      SELECT id, customer_name, phone, rating, text, image_url, is_approved, created_at
      FROM reviews
      ORDER BY created_at DESC
    `).all();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, is_approved } = await request.json();
    const db = await getDb();
    await db.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?').run(is_approved ? 1 : 0, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
