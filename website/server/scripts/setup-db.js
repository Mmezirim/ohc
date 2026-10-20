// Creates the database, applies db/schema.sql and seeds the original site content.
//   npm run db:setup          -> create + seed empty tables only
//   npm run db:setup -- --reset (or npm run db:reset) -> drop all tables and reseed
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { dbConfig, dbName as getDbName } from '../src/db.js';
import * as seed from '../src/data/seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const reset = process.argv.includes('--reset');
const dbName = getDbName();

const TABLES = [
  'comments', 'posts', 'sermons', 'featured_messages', 'giving_accounts', 'timeline', 'leaders',
  'beliefs', 'ministries', 'events', 'locations', 'service_times', 'settings', 'visit_requests', 'clusters', 'enquiries',
  'audit_log', 'admin_sessions', 'admin_users', 'media',
];

async function insertAll(conn, table, rows, mapRow = (r) => r) {
  const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
  if (n > 0) {
    console.log(`  ${table}: has ${n} rows, skipped`);
    return;
  }
  for (const [i, row] of rows.entries()) {
    const data = { ...mapRow(row) };
    if (!('sort_order' in data) && table !== 'posts' && table !== 'settings') data.sort_order = i;
    await conn.query(`INSERT INTO \`${table}\` SET ?`, [data]);
  }
  console.log(`  ${table}: inserted ${rows.length}`);
}

async function addColumnIfMissing(conn, table, column, definition) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column],
  );
  if (!rows.length) {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`  migrated: ${table}.${column}`);
  }
}

/** Registers the images shipped in client/public/images in the media library. */
async function seedBuiltinMedia(conn) {
  const dir = path.join(here, '..', '..', 'client', 'public', 'images');
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return;
  }
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
  let added = 0;
  for (const f of files) {
    const mime = types[path.extname(f).toLowerCase()];
    if (!mime) continue;
    const { size } = await fs.stat(path.join(dir, f));
    const [r] = await conn.query('INSERT IGNORE INTO media (url, filename, mime, size_bytes, builtin) VALUES (?, ?, ?, ?, 1)', [`/images/${f}`, f, mime, size]);
    added += r.affectedRows;
  }
  console.log(`  media: registered ${added} built-in images`);
}

async function main() {
  const conn = await mysql.createConnection({ ...dbConfig({ withDatabase: false }), multipleStatements: true });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.changeUser({ database: dbName });
  console.log(`[setup] using database ${dbName}`);

  if (reset) {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of TABLES) await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[setup] dropped existing tables');
  }

  await conn.query(await fs.readFile(path.join(here, '..', 'db', 'schema.sql'), 'utf8'));
  console.log('[setup] schema applied');

  // In-place migrations for databases created by earlier versions.
  await addColumnIfMissing(conn, 'enquiries', 'handled', "TINYINT(1) NOT NULL DEFAULT 0 AFTER consent");
  await addColumnIfMissing(conn, 'visit_requests', 'handled', "TINYINT(1) NOT NULL DEFAULT 0 AFTER source");
  await addColumnIfMissing(conn, 'posts', 'body_markdown', 'MEDIUMTEXT NULL AFTER body');
  await addColumnIfMissing(conn, 'clusters', 'chapter', "VARCHAR(120) NOT NULL DEFAULT 'Yaba' AFTER name");
  await addColumnIfMissing(conn, 'clusters', 'leader', 'VARCHAR(160) NULL AFTER area');
  await addColumnIfMissing(conn, 'clusters', 'email', 'VARCHAR(190) NULL AFTER leader');
  await addColumnIfMissing(conn, 'clusters', 'phone', 'VARCHAR(60) NULL AFTER email');
  await seedBuiltinMedia(conn);

  await insertAll(conn, 'settings', Object.entries(seed.settings), ([setting_key, setting_value]) => ({ setting_key, setting_value }));
  await insertAll(conn, 'service_times', seed.serviceTimes);
  await insertAll(conn, 'locations', seed.locations, (l) => ({
    ...l,
    pastors: JSON.stringify(l.pastors),
    schedule: JSON.stringify(l.schedule),
  }));
  await insertAll(conn, 'events', seed.events);
  await insertAll(conn, 'ministries', seed.ministries);
  await insertAll(conn, 'beliefs', seed.beliefs);
  await insertAll(conn, 'leaders', seed.leaders);
  await insertAll(conn, 'timeline', seed.timeline);
  await insertAll(conn, 'giving_accounts', seed.givingAccounts);
  await insertAll(conn, 'featured_messages', seed.featuredMessages);
  await insertAll(conn, 'posts', seed.posts);
  await insertAll(conn, 'clusters', seed.clusters);

  await conn.end();
  console.log('[setup] done');
}

main().catch((err) => {
  console.error('[setup] failed:', err.message);
  process.exit(1);
});
