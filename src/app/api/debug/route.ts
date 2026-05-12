import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  
  const db = await getDb();
  const catCount = await db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number } | undefined;
  const prodCount = await db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number } | undefined;
  const revCount = await db.prepare('SELECT COUNT(*) as c FROM reviews').get() as { c: number } | undefined;

  return NextResponse.json({
    mode: tursoUrl ? 'TURSO (cloud)' : 'LOCAL (file)',
    tursoUrlSet: !!tursoUrl,
    tursoTokenSet: !!tursoToken,
    tursoUrlPrefix: tursoUrl ? tursoUrl.substring(0, 30) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
    categories: Number(catCount?.c ?? 0),
    products: Number(prodCount?.c ?? 0),
    reviews: Number(revCount?.c ?? 0),
  });
}
