/**
 * SQLite через sql.js (чистый WebAssembly).
 * Не требует нативной компиляции — работает на любой версии Node.js.
 */
import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/tmp/flower_shop.db'
  : path.join(process.cwd(), 'flower_shop.db');

let sqlJs: SqlJsStatic | null = null;

// ─── Совместимый враппер ────────────────────────────────────────────────────

type Row = Record<string, unknown>;
type SqlVal = string | number | null | Uint8Array | boolean;

class StatementWrapper {
  constructor(
    private rawDb: Database,
    private wrapper: DbWrapper,
    private sql: string
  ) {}

  all(...params: unknown[]): Row[] {
    const stmt = this.rawDb.prepare(this.sql);
    const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (flat.length) stmt.bind(flat as SqlVal[]);
    const rows: Row[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject() as Row);
    stmt.free();
    return rows;
  }

  get(...params: unknown[]): Row | undefined {
    const stmt = this.rawDb.prepare(this.sql);
    const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (flat.length) stmt.bind(flat as SqlVal[]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as Row;
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  run(...params: unknown[]): { changes: number; lastInsertRowid: number } {
    const stmt = this.rawDb.prepare(this.sql);
    const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    if (flat.length) stmt.bind(flat as SqlVal[]);
    stmt.step();
    stmt.free();

    const meta = this.rawDb.exec('SELECT changes(), last_insert_rowid()');
    const changes = (meta[0]?.values[0][0] as number) ?? 0;
    const lastInsertRowid = (meta[0]?.values[0][1] as number) ?? 0;

    if (!this.wrapper.txActive) this.wrapper.persist();
    return { changes, lastInsertRowid };
  }
}

export class DbWrapper {
  txActive = false;

  constructor(private db: Database) {}

  prepare(sql: string): StatementWrapper {
    return new StatementWrapper(this.db, this, sql);
  }

  exec(sql: string): void {
    this.db.exec(sql);
    if (!this.txActive) this.persist();
  }

  pragma(setting: string): void {
    this.db.run(`PRAGMA ${setting}`);
  }

  transaction(fn: () => void): () => void {
    return () => {
      this.txActive = true;
      this.db.run('BEGIN');
      try {
        fn();
        this.db.run('COMMIT');
        this.persist();
      } catch (e) {
        this.db.run('ROLLBACK');
        throw e;
      } finally {
        this.txActive = false;
      }
    };
  }

  /** Для SQL-консоли: возвращает структурированные результаты. */
  execQuery(sql: string): { columns: string[]; values: unknown[][] }[] {
    return this.db.exec(sql) as { columns: string[]; values: unknown[][] }[];
  }

  persist(): void {
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// ─── Инициализация ─────────────────────────────────────────────────────────

export async function getDb(): Promise<DbWrapper> {
  if (!sqlJs) {
    sqlJs = await initSqlJs({
      locateFile: (f) =>
        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', f),
    });
  }

  // Читаем файл каждый раз — гарантирует актуальные данные после любых изменений
  const raw = fs.existsSync(DB_PATH)
    ? new sqlJs.Database(fs.readFileSync(DB_PATH))
    : new sqlJs.Database();

  const db = new DbWrapper(raw);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initializeDb(db);
  return db;
}

function initializeDb(db: DbWrapper) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
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
  `);

  const row = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (row.c === 0) seedData(db);
}

function seedData(db: DbWrapper) {
  const ins = db.prepare(`
    INSERT INTO products (name, description, price, old_price, category_id, image_url, in_stock, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seed = db.transaction(() => {
    db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(
      'Розы', 'rozy', 'Классические розы всех сортов и оттенков'
    );
    db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(
      'Пионы', 'piony', 'Нежные и пышные пионы'
    );
    db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(
      'Тюльпаны', 'tyulpany', 'Весенние тюльпаны разных цветов'
    );
    db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(
      'Букеты', 'bukety', 'Готовые букеты для любого повода'
    );
    db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(
      'Полевые цветы', 'polevye', 'Нежные полевые цветы и луговые миксы'
    );

    ins.run('Красные розы 25 шт',
      'Классические алые розы премиум-сорта Ред Наоми. Длина стебля 60 см, крупный бутон. Символ страсти и любви.',
      2900, 3400, 1, 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=700&q=85', 1, 1);
    ins.run('Белые розы 15 шт',
      'Нежные белые розы сорта Аваланш. Безупречная форма бутона, стоят до 10 дней в вазе.',
      1950, null, 1, 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=700&q=85', 1, 0);
    ins.run('Розовые розы 51 шт',
      'Пышный монобукет из нежно-розовых роз — для самых тёплых признаний.',
      5900, 6800, 1, 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=700&q=85', 1, 1);
    ins.run('Пионы белые 7 шт',
      'Пышные белые пионы с тонким ароматом. Сорт Duchesse de Nemours — классика флористики.',
      2800, 3200, 2, 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=700&q=85', 1, 1);
    ins.run('Пионы розовые 5 шт',
      'Воздушные розовые пионы сорта Sarah Bernhardt в крафтовой упаковке. Нежный аромат.',
      2200, null, 2, 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=700&q=85', 1, 0);
    ins.run('Тюльпаны 25 шт',
      'Свежие весенние тюльпаны. Доступны белые, красные, жёлтые, розовые и лиловые — уточните цвет при заказе.',
      1750, 2000, 3, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=700&q=85', 1, 0);
    ins.run('Тюльпаны красные 51 шт',
      'Эффектный букет из 51 алого тюльпана — впечатляющий подарок к любому событию.',
      3500, null, 3, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=700&q=85', 1, 1);
    ins.run('Букет «Нежность»',
      'Пастельный букет из роз, пионов, эустомы и матиолы. Упакован в корейскую бумагу ручной работы.',
      4500, 5200, 4, 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=700&q=85', 1, 1);
    ins.run('Букет «Романтика»',
      'Роскошный авторский букет из красных роз, пионов и зелени эвкалипта в премиум-оформлении.',
      5800, 6500, 4, 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=700&q=85', 1, 1);
    ins.run('Букет «Весна»',
      'Яркий весенний микс из тюльпанов, ранункулюсов и анемонов. Живое настроение в букете.',
      3200, null, 4, 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=700&q=85', 1, 0);
    ins.run('Луговой микс',
      'Нежный букет из ромашек, колокольчиков, васильков и злаков. Деревенский шарм и натуральная красота.',
      1800, null, 5, 'https://images.unsplash.com/photo-1444930694458-01babf71870c?w=700&q=85', 1, 0);
    ins.run('Лаванда 7 веток',
      'Свежие ветки настоящей прованской лаванды. Наполнит дом нежным ароматом и уютом.',
      1400, null, 5, 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=700&q=85', 1, 0);
  });

  seed();
}
