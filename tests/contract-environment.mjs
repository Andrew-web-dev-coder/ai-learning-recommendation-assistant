import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import pg from 'pg';

const root = new URL('../', import.meta.url);
const migrations = [
  'database/migrations/001_initial_schema.sql',
  'database/migrations/002_indexes.sql',
  'database/seeds/001_reference_data.sql',
];

async function availablePort() {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const { port } = listener.address();
  listener.close();
  await once(listener, 'close');
  return port;
}

export async function startContractEnvironment(context) {
  const input = process.env.CONTRACT_DB_URL;
  assert(input, 'Set CONTRACT_DB_URL for the disposable PostgreSQL service. See docs/api/TESTING.md.');
  const url = new URL(input);
  assert(
    url.protocol === 'postgresql:' && url.hostname === '127.0.0.1' &&
    url.port && url.username && url.password && url.pathname === '/postgres' &&
    !url.search && !url.hash,
    'Use an explicit loopback postgresql://user:password@127.0.0.1:port/postgres URL.',
  );
  const config = {
    host: url.hostname, port: Number(url.port),
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    connectionTimeoutMillis: 5000,
  };
  const admin = new pg.Client({ ...config, database: 'postgres' });
  const database = 'contract_' + randomUUID().replaceAll('-', '');
  let created = false;
  let db;
  let server;
  let serverClosed;
  let serverLog = '';
  context.after(async () => {
    try {
      if (server) {
        server.kill();
        await serverClosed;
      }
      await db?.end();
    } finally {
      try {
        if (created) await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`);
      } finally {
        await admin.end();
      }
    }
  });

  await admin.connect();
  // All fixture writes target a newly created database. The maintenance DB only
  // receives CREATE/DROP for the specific database created by this run.
  await admin.query(`CREATE DATABASE "${database}" TEMPLATE template0`);
  created = true;
  db = new pg.Client({ ...config, database });
  await db.connect();
  const identity = await db.query('SELECT current_database() AS name');
  assert.equal(identity.rows[0].name, database);
  for (const file of migrations) {
    await db.query(await readFile(new URL(file, root), 'utf8'));
  }

  const port = await availablePort();
  const origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    cwd: root,
    env: {
      ...process.env, NODE_ENV: 'production', PORT: String(port),
      DB_HOST: config.host, DB_PORT: String(config.port), DB_USER: config.user,
      DB_PASSWORD: config.password, DB_NAME: database,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverClosed = new Promise(resolve => server.once('close', resolve));
  server.on('error', error => { serverLog += error.message; });
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', chunk => { serverLog = (serverLog + chunk).slice(-8000); });
  }

  const deadline = Date.now() + 15000;
  // Wait for the actual child to bind before probing, then verify DB identity.
  while (Date.now() < deadline && server.exitCode === null && !server.killed) {
    if (serverLog.includes(`Backend running at http://localhost:${port}`)) {
      const response = await fetch(origin + '/api/health', { signal: AbortSignal.timeout(1000) })
        .catch(() => null);
      if (response?.ok) {
        assert.equal((await response.json()).database, database);
        return { db, origin, database };
      }
    }
    await delay(100);
  }
  throw new Error(`API readiness failed. Backend output:\n${serverLog}`);
}
