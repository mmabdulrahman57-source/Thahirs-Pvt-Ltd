import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { DATA_DIR, exportDatabase, restoreDb, importDatabase, load } from '../jsonStore.js';

const execFileAsync = promisify(execFile);

export function listBackups() {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter(f => f.startsWith('backup-') || f.startsWith('db-snapshot-'))
    .sort()
    .reverse();
}

export function createJsonBackup() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const backupPath = join(DATA_DIR, `backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(load(), null, 2));
  return backupPath;
}

export async function createSqlBackup() {
  const dumpPath = process.env.MYSQLDUMP_PATH || 'mysqldump';
  const url = new URL(process.env.DATABASE_URL.replace(/^mysql:\/\//, 'http://'));
  const dbName = url.pathname.replace(/^\//, '');
  const outPath = join(DATA_DIR, `mysql-backup-${Date.now()}.sql`);

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  await execFileAsync(dumpPath, [
    `-h${url.hostname}`,
    `-P${url.port || 3306}`,
    `-u${decodeURIComponent(url.username)}`,
    ...(url.password ? [`-p${decodeURIComponent(url.password)}`] : []),
    dbName,
  ], { maxBuffer: 50 * 1024 * 1024 }).then(({ stdout }) => {
    writeFileSync(outPath, stdout);
  });

  return outPath;
}

export async function exportDb() {
  return exportDatabase();
}

export function restoreFromJson(filePath) {
  restoreDb(filePath);
}

export function importFromJson(jsonString) {
  importDatabase(jsonString);
}

export async function runDailyBackup() {
  createJsonBackup();
  try {
    await createSqlBackup();
  } catch {
    // mysqldump optional if not installed
  }
}
