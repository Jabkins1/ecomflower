import { Pool } from '@neondatabase/serverless';
import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'flower_shop.db');

let sqlJs: SqlJsStatic | null = null;
let localDbInstance: Database | null = null;
let pgPool: Pool | null = null;
let dbInitialized = false;

type Row = Record<string, unknown>;
type SqlVal = string | number | null | Uint8Array;
type RunResult = { changes: number; lastInsertRowid: number };

function flatParams(params: unknown[]): unknown[] {
  return params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
}

function splitSql(sql: string): string[] {
  return sql.split(';').map((part) => part.trim()).filter(Boolean);
}

function sqliteToPostgres(sql: string): string {
  return sql
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT NOW()')
    .replace(/\bREAL\b/gi, 'NUMERIC');
}

function convertParams(sql: string, params: unknown[]): { sql: string; params: unknown[] } {
  let idx = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++idx}`);
  return { sql: pgSql, params };
}

class StatementWrapper {
  constructor(
    private wrapper: DbWrapper,
    private sql: string
  ) {}

  all(...params: unknown[]): Promise<Row[]> {
    return this.wrapper.all(this.sql, flatParams(params));
  }

  get(...params: unknown[]): Promise<Row | undefined> {
    return this.wrapper.get(this.sql, flatParams(params));
  }

  run(...params: unknown[]): Promise<RunResult> {
    return this.wrapper.run(this.sql, flatParams(params));
  }
}

export class DbWrapper {
  constructor(
    private localDb: Database | null,
    private pgUrl: string | null
  ) {}

  prepare(sql: string): StatementWrapper {
    return new StatementWrapper(this, sql);
  }

  async all(sql: string, params: unknown[] = []): Promise<Row[]> {
    if (this.pgUrl) {
      if (!pgPool) pgPool = new Pool({ connectionString: this.pgUrl });
      const { sql: pgSql, params: pgParams } = convertParams(sql, params);
      const result = await pgPool.query(pgSql, pgParams as never[]);
      return result.rows as Row[];
    }

    if (!this.localDb) return [];
    const stmt = this.localDb.prepare(sql);
    const flat = params as SqlVal[];
    if (flat.length) stmt.bind(flat);
    const rows: Row[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject() as Row);
    stmt.free();
    return rows;
  }

  async get(sql: string, params: unknown[] = []): Promise<Row | undefined> {
    const rows = await this.all(sql, params);
    return rows[0];
  }

  async run(sql: string, params: unknown[] = []): Promise<RunResult> {
    if (this.pgUrl) {
      if (!pgPool) pgPool = new Pool({ connectionString: this.pgUrl });
      const { sql: pgSql, params: pgParams } = convertParams(sql, params);
      const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
      const finalSql = isInsert && !pgSql.toUpperCase().includes('RETURNING')
        ? pgSql + ' RETURNING *'
        : pgSql;
      const result = await pgPool.query(finalSql, pgParams as never[]);
      const lastId = isInsert ? (result.rows?.[0]?.id ?? 0) : 0;
      return { changes: result.rowCount ?? 0, lastInsertRowid: Number(lastId) };
    }

    if (!this.localDb) return { changes: 0, lastInsertRowid: 0 };
    const stmt = this.localDb.prepare(sql);
    const flat = params as SqlVal[];
    if (flat.length) stmt.bind(flat);
    stmt.step();
    stmt.free();

    const meta = this.localDb.exec('SELECT changes(), last_insert_rowid()');
    const changes = (meta[0]?.values[0][0] as number) ?? 0;
    const lastInsertRowid = (meta[0]?.values[0][1] as number) ?? 0;
    this.persist();
    return { changes, lastInsertRowid };
  }

  async exec(sql: string): Promise<void> {
    if (this.pgUrl) {
      if (!pgPool) pgPool = new Pool({ connectionString: this.pgUrl });
      for (const statement of splitSql(sql)) {
        await pgPool.query(sqliteToPostgres(statement));
      }
      return;
    }
    for (const statement of splitSql(sql)) {
      this.localDb?.exec(statement);
    }
    this.persist();
  }

  async pragma(setting: string): Promise<void> {
    if (this.pgUrl) return;
    this.localDb?.run(`PRAGMA ${setting}`);
  }

  async execQuery(sql: string): Promise<{ columns: string[]; values: unknown[][] }[]> {
    if (this.pgUrl) {
      if (!pgPool) pgPool = new Pool({ connectionString: this.pgUrl });
      const result = await pgPool.query(sql);
      if (!result.rows.length) return [{ columns: [], values: [] }];
      const columns = result.fields.map(f => f.name);
      const values = result.rows.map((r: Record<string, unknown>) => columns.map(c => r[c]));
      return [{ columns, values }];
    }
    return (this.localDb?.exec(sql) ?? []) as { columns: string[]; values: unknown[][] }[];
  }

  persist(): void {
    if (!this.localDb) return;
    const data = this.localDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

export async function getDb(): Promise<DbWrapper> {
  const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (pgUrl) {
    const db = new DbWrapper(null, pgUrl);
    if (!dbInitialized) {
      await initializeDb(db);
      dbInitialized = true;
    }
    return db;
  }

  if (!sqlJs) {
    sqlJs = await initSqlJs({
      locateFile: (f) =>
        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', f),
    });
  }

  if (!localDbInstance) {
    localDbInstance = fs.existsSync(DB_PATH)
      ? new sqlJs.Database(fs.readFileSync(DB_PATH))
      : new sqlJs.Database();
  }

  const db = new DbWrapper(localDbInstance, null);
  if (!dbInitialized) {
    await db.pragma('journal_mode = WAL');
    await db.pragma('foreign_keys = ON');
    await initializeDb(db);
    dbInitialized = true;
  }
  return db;
}

async function initializeDb(db: DbWrapper) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      old_price REAL,
      category_id INTEGER REFERENCES categories(id),
      image_url TEXT,
      in_stock INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      delivery_date TEXT,
      delivery_time TEXT,
      delivery_address TEXT,
      comment TEXT,
      total REAL NOT NULL,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      phone TEXT,
      rating INTEGER NOT NULL,
      text TEXT NOT NULL,
      image_url TEXT,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  try {
    const isPg = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
    if (isPg) {
      await db.exec('ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT');
    } else {
      await db.exec('ALTER TABLE categories ADD COLUMN image_url TEXT');
    }
  } catch {
  }

  const settingsRow = await db.prepare("SELECT COUNT(*) as c FROM site_settings WHERE key = 'hero_image_url'").get() as { c: number } | undefined;
  if (!settingsRow || Number(settingsRow.c) === 0) {
    await db.prepare("INSERT INTO site_settings (key, value) VALUES ('hero_image_url', '')").run();
  }

  const row = await db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number } | undefined;
  if (!row || Number(row.c) === 0) await seedData(db);
}

async function seedData(db: DbWrapper) {
  const categories = [
    ['Розы', 'rozy', 'Классические розы всех сортов и оттенков', 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&q=85'],
    ['Пионы', 'piony', 'Нежные и пышные пионы', 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=500&q=85'],
    ['Тюльпаны', 'tyulpany', 'Весенние тюльпаны разных цветов', 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=500&q=85'],
    ['Букеты', 'bukety', 'Готовые букеты для любого повода', 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=500&q=85'],
    ['Полевые цветы', 'polevye', 'Нежные полевые цветы и луговые миксы', 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=500&q=85'],
  ];

  for (const category of categories) {
    await db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)').run(...category);
  }

  const products: unknown[][] = [
    ['Красные розы 25 шт', 'Классические алые розы премиум-сорта Ред Наоми. Длина стебля 60 см, крупный бутон. Символ страсти и любви.', 2900, 3400, 1, 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=700&q=85', 1, 1],
    ['Белые розы 15 шт', 'Нежные белые розы сорта Аваланш. Безупречная форма бутона, стоят до 10 дней в вазе.', 1950, null, 1, 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=700&q=85', 1, 0],
    ['Розовые розы 51 шт', 'Пышный монобукет из нежно-розовых роз — для самых тёплых признаний.', 5900, 6800, 1, 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=700&q=85', 1, 1],
    ['Пионы белые 7 шт', 'Пышные белые пионы с тонким ароматом. Сорт Duchesse de Nemours — классика флористики.', 2800, 3200, 2, 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=700&q=85', 1, 1],
    ['Пионы розовые 5 шт', 'Воздушные розовые пионы сорта Sarah Bernhardt в крафтовой упаковке. Нежный аромат.', 2200, null, 2, 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=700&q=85', 1, 0],
    ['Тюльпаны 25 шт', 'Свежие весенние тюльпаны. Доступны белые, красные, жёлтые, розовые и лиловые — уточните цвет при заказе.', 1750, 2000, 3, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=700&q=85', 1, 0],
    ['Тюльпаны красные 51 шт', 'Эффектный букет из 51 алого тюльпана — впечатляющий подарок к любому событию.', 3500, null, 3, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=700&q=85', 1, 1],
    ['Букет «Нежность»', 'Пастельный букет из роз, пионов, эустомы и матиолы. Упакован в корейскую бумагу ручной работы.', 4500, 5200, 4, 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=700&q=85', 1, 1],
    ['Букет «Романтика»', 'Роскошный авторский букет из красных роз, пионов и зелени эвкалипта в премиум-оформлении.', 5800, 6500, 4, 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=700&q=85', 1, 1],
    ['Букет «Весна»', 'Яркий весенний микс из тюльпанов, ранункулюсов и анемонов. Живое настроение в букете.', 3200, null, 4, 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=700&q=85', 1, 0],
    ['Луговой микс', 'Нежный букет из ромашек, колокольчиков, васильков и злаков. Деревенский шарм и натуральная красота.', 1800, null, 5, 'https://images.unsplash.com/photo-1444930694458-01babf71870c?w=700&q=85', 1, 0],
    ['Лаванда 7 веток', 'Свежие ветки настоящей прованской лаванды. Наполнит дом нежным ароматом и уютом.', 1400, null, 5, 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=700&q=85', 1, 0],
  ];

  const insert = db.prepare(`
    INSERT INTO products (name, description, price, old_price, category_id, image_url, in_stock, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const product of products) {
    await insert.run(...product);
  }
}
