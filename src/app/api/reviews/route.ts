import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export async function GET() {
  try {
    const db = await getDb();
    const reviews = await db.prepare(`
      SELECT id, customer_name, phone, rating, text, image_url, is_approved, created_at
      FROM reviews
      WHERE is_approved = 1
      ORDER BY created_at DESC
    `).all();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, rating, text, image } = await request.json();
    const safeName = String(name || '').trim();
    const safePhone = String(phone || '').trim();
    const safeText = String(text || '').trim();
    const safeRating = Number(rating);

    if (!safeName || !safeText || !safeRating) {
      return NextResponse.json({ error: 'Заполните имя, текст и оценку' }, { status: 400 });
    }

    if (safeRating < 1 || safeRating > 5) {
      return NextResponse.json({ error: 'Оценка должна быть от 1 до 5' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      if (image.length > MAX_IMAGE_SIZE * 1.37) {
        return NextResponse.json({ error: 'Изображение слишком большое (макс. 2 МБ)' }, { status: 400 });
      }
      imageUrl = image;
    }

    const db = await getDb();
    await db.prepare(`
      INSERT INTO reviews (customer_id, customer_name, phone, rating, text, image_url, is_approved)
      VALUES (NULL, ?, ?, ?, ?, ?, 0)
    `).run(safeName, safePhone || null, safeRating, safeText, imageUrl);

    return NextResponse.json({ success: true, message: 'Спасибо! Отзыв отправлен на модерацию.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось отправить отзыв' }, { status: 500 });
  }
}
