import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  
  const db = await getDb();
  const catCount = await db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number } | undefined;
  const prodCount = await db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number } | undefined;
  const revCount = await db.prepare('SELECT COUNT(*) as c FROM reviews').get() as { c: number } | undefined;

  const allEnvKeys = Object.keys(process.env).filter(k => k.includes('TURSO') || k.includes('turso'));

  return NextResponse.json({
    mode: tursoUrl ? 'TURSO (cloud)' : 'LOCAL (file)',
    tursoUrlSet: !!tursoUrl,
    tursoTokenSet: !!tursoToken,
    tursoUrlPrefix: tursoUrl ? tursoUrl.substring(0, 30) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
    tursoEnvKeys: allEnvKeys,
    totalEnvKeys: Object.keys(process.env).length,
    categories: Number(catCount?.c ?? 0),
    products: Number(prodCount?.c ?? 0),
    reviews: Number(revCount?.c ?? 0),
  });
}
