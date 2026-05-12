import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const isPostgres = () => !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'SQL запрос не указан' }, { status: 400 });
    }

    const trimmed = query.trim().toUpperCase();
    const db = await getDb();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      const result = await db.prepare(query).all();
      return NextResponse.json({ rows: result, type: 'select', count: result.length });
    } else if (trimmed.startsWith('INSERT') || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
      const result = await db.prepare(query).all();
      return NextResponse.json({ type: 'write', rows_affected: result.length, rows: result });
    } else if (trimmed.startsWith('CREATE') || trimmed.startsWith('DROP') || trimmed.startsWith('ALTER')) {
      await db.exec(query);
      return NextResponse.json({ type: 'ddl', message: 'Выполнено успешно' });
    } else {
      return NextResponse.json({ error: 'Неподдерживаемый тип запроса' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ошибка выполнения запроса';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const pg = isPostgres();

    const tables = pg
      ? await db.prepare(
          "SELECT table_name as name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        ).all() as unknown as { name: string }[]
      : await db.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ).all() as unknown as { name: string }[];

    const schema: Record<string, unknown[]> = {};
    for (const table of tables) {
      const rows = await db.prepare(`SELECT * FROM ${table.name} ORDER BY id DESC LIMIT 100`).all();
      schema[table.name] = rows;
    }

    const tableInfo: Record<string, unknown[]> = {};
    for (const table of tables) {
      if (pg) {
        const cols = await db.prepare(
          `SELECT ordinal_position as cid, column_name as name, data_type as type,
           CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END as notnull,
           column_default as dflt_value,
           CASE WHEN column_name = 'id' THEN 1 ELSE 0 END as pk
           FROM information_schema.columns WHERE table_name = ? ORDER BY ordinal_position`
        ).all(table.name);
        tableInfo[table.name] = cols;
      } else {
        tableInfo[table.name] = await db.prepare(`PRAGMA table_info(${table.name})`).all();
      }
    }

    return NextResponse.json({ tables: tables.map(t => t.name), data: schema, columns: tableInfo });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
