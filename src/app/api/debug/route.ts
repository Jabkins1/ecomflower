import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = process.env;
  const tursoUrl = env['TURSO_DATABASE_URL'];
  const tursoToken = env['TURSO_AUTH_TOKEN'];

  const allEnvKeys = Object.keys(env).filter(k => k.toUpperCase().includes('TURSO'));
  const sampleKeys = Object.keys(env).slice(0, 10);

  let dbInfo = null;
  try {
    const db = await getDb();
    const catCount = await db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number } | undefined;
    const prodCount = await db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number } | undefined;
    const revCount = await db.prepare('SELECT COUNT(*) as c FROM reviews').get() as { c: number } | undefined;
    dbInfo = {
      categories: Number(catCount?.c ?? 0),
      products: Number(prodCount?.c ?? 0),
      reviews: Number(revCount?.c ?? 0),
    };
  } catch (e: unknown) {
    dbInfo = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({
    version: 'v3',
    mode: tursoUrl ? 'TURSO (cloud)' : 'LOCAL (file)',
    tursoUrlSet: !!tursoUrl,
    tursoTokenSet: !!tursoToken,
    tursoUrlPrefix: tursoUrl ? tursoUrl.substring(0, 30) + '...' : null,
    nodeEnv: env['NODE_ENV'],
    tursoEnvKeys: allEnvKeys,
    sampleEnvKeys: sampleKeys,
    totalEnvKeys: Object.keys(env).length,
    db: dbInfo,
  });
}
