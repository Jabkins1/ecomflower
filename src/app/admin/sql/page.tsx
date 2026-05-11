'use client';

import { useEffect, useState } from 'react';
import { Play, RefreshCw, ChevronRight, Database, Table2 } from 'lucide-react';

interface DbData {
  tables: string[];
  data: Record<string, Record<string, unknown>[]>;
  columns: Record<string, { cid: number; name: string; type: string; notnull: number; dflt_value: unknown; pk: number }[]>;
}

const EXAMPLE_QUERIES = [
  { label: 'Все товары', sql: 'SELECT * FROM products;' },
  { label: 'Все заказы', sql: 'SELECT * FROM orders ORDER BY created_at DESC;' },
  { label: 'Товары со скидкой', sql: 'SELECT name, price, old_price FROM products WHERE old_price IS NOT NULL;' },
  { label: 'Заказы по статусам', sql: 'SELECT status, COUNT(*) as count, SUM(total) as total FROM orders GROUP BY status;' },
  { label: 'Топ товаров', sql: 'SELECT p.name, SUM(oi.quantity) as sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY sold DESC;' },
  { label: 'Новые заказы', sql: "SELECT * FROM orders WHERE status = 'new';" },
  { label: 'Категории', sql: 'SELECT * FROM categories;' },
  { label: 'Состав заказов', sql: 'SELECT o.id, o.customer_name, oi.product_name, oi.quantity, oi.price FROM orders o JOIN order_items oi ON o.id = oi.order_id;' },
];

export default function SqlConsolePage() {
  const [query, setQuery] = useState('SELECT * FROM products LIMIT 10;');
  const [result, setResult] = useState<{ rows?: Record<string, unknown>[]; type?: string; count?: number; rows_affected?: number; last_insert_id?: unknown; message?: string } | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [dbData, setDbData] = useState<DbData | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'tables'>('tables');
  const [mounted, setMounted] = useState(false);

  const loadDb = async () => {
    const res = await fetch('/api/admin/sql');
    const data = await res.json();
    setDbData(data);
    if (data.tables?.length > 0 && !activeTable) {
      setActiveTable(data.tables[0]);
    }
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { loadDb(); }, []);

  if (!mounted) return null;

  const runQuery = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка запроса');
      } else {
        setResult(data);
        if (data.type !== 'select') loadDb();
      }
    } catch {
      setError('Ошибка соединения');
    }
    setRunning(false);
  };

  const rows = result?.rows || [];
  const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
  const tableRows = activeTable ? (dbData?.data[activeTable] || []) : [];
  const tableCols = activeTable ? (dbData?.columns[activeTable] || []) : [];

  return (
    <div className="flex h-screen">
      {/* Left panel: tables list */}
      <div className="w-56 bg-gray-900 text-gray-300 flex flex-col border-r border-gray-800">
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Database size={15} />
            <span>flower_shop.db</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {dbData?.tables.map(table => (
            <button
              key={table}
              onClick={() => { setActiveTable(table); setActiveTab('tables'); }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-xs hover:bg-gray-800 transition-colors ${activeTable === table && activeTab === 'tables' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
            >
              <Table2 size={13} />
              {table}
              <span className="ml-auto text-gray-600">{dbData.data[table]?.length}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => setActiveTab('console')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'console' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Play size={13} /> SQL Консоль
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {activeTab === 'tables' && activeTable ? (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
              <Table2 size={16} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">{activeTable}</h2>
              <span className="text-sm text-gray-500">— {tableRows.length} строк</span>
              <button onClick={loadDb} className="ml-auto text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Column info */}
            <div className="px-6 py-2 border-b border-gray-100 bg-white">
              <div className="flex gap-2 flex-wrap">
                {tableCols.map(col => (
                  <span key={col.name} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md font-mono">
                    {col.name} <span className="text-gray-400">{col.type}</span>
                    {col.pk ? <span className="text-green-500 ml-1">PK</span> : null}
                    {col.notnull ? <span className="text-orange-400 ml-1">NOT NULL</span> : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {tableRows.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Таблица пуста</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {Object.keys(tableRows[0]).map(col => (
                        <th key={col} className="px-4 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 font-mono text-gray-700 max-w-[200px] truncate whitespace-nowrap">
                            {val === null ? <span className="text-gray-300 italic">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <>
            {/* SQL Console */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
              <Play size={16} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">SQL Консоль</h2>
            </div>

            <div className="p-4 flex gap-2 flex-wrap bg-white border-b border-gray-100">
              {EXAMPLE_QUERIES.map(({ label, sql }) => (
                <button
                  key={label}
                  onClick={() => setQuery(sql)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-green-50 hover:text-green-600 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                >
                  <ChevronRight size={12} /> {label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-gray-900">
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                rows={6}
                className="w-full bg-gray-800 text-green-400 font-mono text-sm px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-gray-700"
                placeholder="Введите SQL запрос..."
                onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') runQuery(); }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600 text-xs">Ctrl+Enter для запуска</span>
                <button
                  onClick={runQuery}
                  disabled={running || !query.trim()}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Play size={14} /> {running ? 'Выполняем...' : 'Выполнить'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white">
              {error && (
                <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-mono">
                  ❌ {error}
                </div>
              )}
              {result && result.type !== 'select' && (
                <div className="m-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  ✅ {result.type === 'write'
                    ? `Выполнено. Затронуто строк: ${result.rows_affected}${result.last_insert_id ? `, ID новой записи: ${result.last_insert_id}` : ''}`
                    : result.message || 'Выполнено успешно'}
                </div>
              )}
              {result && result.type === 'select' && (
                <>
                  <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-500">
                    Результат: <strong>{result.count}</strong> строк
                  </div>
                  {rows.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {cols.map(col => (
                            <th key={col} className="px-4 py-2.5 text-left font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/50">
                            {cols.map(col => (
                              <td key={col} className="px-4 py-2 font-mono text-gray-700 max-w-[200px] truncate">
                                {row[col] === null ? <span className="text-gray-300 italic">NULL</span> : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-gray-400">Запрос вернул 0 строк</div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
