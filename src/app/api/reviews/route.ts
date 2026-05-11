import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET() {
  try {
    const db = await getDb();
    const reviews = await db.prepare(`
      SELECT id, customer_id, customer_name, rating, text, is_approved, created_at
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
    const { name, email, phone, password, rating, text } = await request.json();
    const safeEmail = String(email || '').trim().toLowerCase();
    const safeName = String(name || '').trim();
    const safeText = String(text || '').trim();
    const safeRating = Number(rating);

    if (!safeName || !safeEmail || !password || !safeText || !safeRating) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    if (safeRating < 1 || safeRating > 5) {
      return NextResponse.json({ error: 'Оценка должна быть от 1 до 5' }, { status: 400 });
    }

    const db = await getDb();
    let customer = await db.prepare('SELECT id, password_hash FROM customers WHERE email = ?').get(safeEmail) as { id: number; password_hash: string } | undefined;
    const passwordHash = hashPassword(String(password));

    if (customer && customer.password_hash !== passwordHash) {
      return NextResponse.json({ error: 'Клиент с таким email уже зарегистрирован. Укажите правильный пароль.' }, { status: 400 });
    }

    if (!customer) {
      const result = await db.prepare(`
        INSERT INTO customers (name, email, password_hash, phone)
        VALUES (?, ?, ?, ?)
      `).run(safeName, safeEmail, passwordHash, phone || null);
      customer = { id: result.lastInsertRowid, password_hash: passwordHash };
    }

    await db.prepare(`
      INSERT INTO reviews (customer_id, customer_name, rating, text, is_approved)
      VALUES (?, ?, ?, ?, 0)
    `).run(customer.id, safeName, safeRating, safeText);

    return NextResponse.json({ success: true, message: 'Отзыв отправлен на модерацию' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось отправить отзыв' }, { status: 500 });
  }
}
