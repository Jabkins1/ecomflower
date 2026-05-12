import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = process.env;
  const pgUrl = env['POSTGRES_URL'] || env['DATABASE_URL'];

  const allEnvKeys = Object.keys(env).filter(k => 
    k.toUpperCase().includes('POSTGRES') || 
    k.toUpperCase().includes('DATABASE') ||
    k.toUpperCase().includes('TURSO')
  );
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
    version: 'v4',
    mode: pgUrl ? 'POSTGRES (cloud)' : 'LOCAL (file)',
    pgUrlSet: !!pgUrl,
    pgUrlPrefix: pgUrl ? pgUrl.substring(0, 40) + '...' : null,
    nodeEnv: env['NODE_ENV'],
    dbEnvKeys: allEnvKeys,
    sampleEnvKeys: sampleKeys,
    totalEnvKeys: Object.keys(env).length,
    db: dbInfo,
  });
}
