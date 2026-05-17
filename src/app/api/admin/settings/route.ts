import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key] = row.value ?? '';
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить настройки' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>;
    const db = await getDb();
    for (const [key, value] of Object.entries(body)) {
      const existing = await db.prepare('SELECT key FROM site_settings WHERE key = ?').get(key);
      if (existing) {
        await db.prepare('UPDATE site_settings SET value = ? WHERE key = ?').run(value, key);
      } else {
        await db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run(key, value);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось сохранить настройки' }, { status: 500 });
  }
}
