import mysql from 'mysql2/promise';

let pool = null;
let available = false;

/**
 * Connection settings. DATABASE_URL (e.g. Aiven's "mysql://user:pass@host:port/db?ssl-mode=REQUIRED")
 * takes precedence; otherwise the individual DB_* variables are used.
 */
function connectionSettings() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const u = new URL(url);
    const sslMode = (u.searchParams.get('ssl-mode') || u.searchParams.get('sslmode') || '').toUpperCase();
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: decodeURIComponent(u.pathname.replace(/^\//, '')) || process.env.DB_NAME || 'oakhouse',
      ssl: ['REQUIRED', 'REQUIRE', 'VERIFY_CA', 'VERIFY_IDENTITY'].includes(sslMode) || String(process.env.DB_SSL).toLowerCase() === 'true',
    };
  }
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oakhouse',
    ssl: String(process.env.DB_SSL).toLowerCase() === 'true',
  };
}

export const dbName = () => connectionSettings().database;

export function dbConfig({ withDatabase = true } = {}) {
  const { database, ssl, ...conn } = connectionSettings();
  const cfg = {
    ...conn,
    charset: 'utf8mb4',
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
  };
  if (withDatabase) cfg.database = database;
  // Managed MySQL (Aiven etc.) requires TLS; their CA isn't in Node's default store, so don't pin it.
  if (ssl) cfg.ssl = { rejectUnauthorized: false };
  return cfg;
}

/** Connects once at startup. If MySQL is unreachable the API falls back to bundled seed content. */
export async function initDb() {
  pool = mysql.createPool(dbConfig());
  const check = async (quiet) => {
    try {
      await pool.query('SELECT 1 FROM settings LIMIT 1');
      available = true;
      console.log('[db] connected to MySQL');
      return true;
    } catch (err) {
      available = false;
      if (!quiet) console.warn(`[db] MySQL unavailable (${err.code || err.message}) — serving read-only seed content. Run \`npm run db:setup\`.`);
      return false;
    }
  };
  if (!(await check(false))) {
    // Keep retrying in the background (e.g. the database was set up after the server started).
    const timer = setInterval(async () => {
      if (await check(true)) clearInterval(timer);
    }, 30000);
    timer.unref();
  }
  return available;
}

export const isDbAvailable = () => available;

export async function query(sql, params) {
  if (!available) {
    const err = new Error('Database unavailable');
    err.status = 503;
    throw err;
  }
  const [rows] = await pool.query(sql, params);
  return rows;
}
