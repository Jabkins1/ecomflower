import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'SQL запрос не указан' }, { status: 400 });
    }

    const trimmed = query.trim().toUpperCase();
    const db = await getDb();

    let result;
    let rowsAffected = 0;
    let lastInsertId = null;

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      result = db.prepare(query).all();
      return NextResponse.json({ rows: result, type: 'select', count: result.length });
    } else if (trimmed.startsWith('INSERT') || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
      const stmt = db.prepare(query).run();
      rowsAffected = stmt.changes;
      lastInsertId = stmt.lastInsertRowid;
      return NextResponse.json({ type: 'write', rows_affected: rowsAffected, last_insert_id: lastInsertId });
    } else if (trimmed.startsWith('CREATE') || trimmed.startsWith('DROP') || trimmed.startsWith('ALTER')) {
      db.exec(query);
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
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all() as { name: string }[];

    const schema: Record<string, unknown[]> = {};
    for (const table of tables) {
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      const rows = db.prepare(`SELECT * FROM ${table.name} ORDER BY rowid DESC LIMIT 100`).all();
      schema[table.name] = rows;
    }

    const tableInfo: Record<string, unknown[]> = {};
    for (const table of tables) {
      tableInfo[table.name] = db.prepare(`PRAGMA table_info(${table.name})`).all();
    }

    return NextResponse.json({ tables: tables.map(t => t.name), data: schema, columns: tableInfo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 });
  }
}
