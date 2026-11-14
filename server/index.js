// ============================================================================
// BLOCADE — сервер: Express (REST API) + Socket.IO (онлайн) + Neon PostgreSQL
//
// Переменные окружения:
//   DATABASE_URL  — строка подключения Neon (обязательно)
//   AUTH_SECRET   — секрет для подписи токенов входа (необязательно; если не задан,
//                   вычисляется из DATABASE_URL и остаётся одинаковым между перезапусками)
//   PORT          — порт (по умолчанию 3001)
// ============================================================================
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
import pkg from 'pg';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import * as G from './game.js';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[BLOCADE] ВНИМАНИЕ: переменная DATABASE_URL не задана — база данных работать не будет.');
}
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  crypto.createHash('sha256').update(`blocade-auth:${DATABASE_URL || 'dev-secret'}`).digest('hex');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '10kb' }));

const DIST_DIR = path.join(__dirname, '../dist');
app.use(express.static(DIST_DIR));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 10000,
  pingTimeout: 10000
});

// ============================================================================
// БАЗА ДАННЫХ (Neon PostgreSQL)
// ============================================================================
const isLocalDb = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL || '');
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});
// Neon закрывает «спящие» соединения — без этого обработчика процесс падает
pool.on('error', (err) => console.error('[PG] idle client error:', err.message));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const USER_COLUMNS = [
  'password_hash TEXT',
  "avatar TEXT DEFAULT '👑'",
  'coins INT DEFAULT 1250',
  'elo INT DEFAULT 1000',
  'wins INT DEFAULT 0',
  'losses INT DEFAULT 0',
  'level INT DEFAULT 1',
  'xp INT DEFAULT 0',
  'created_at TEXT',
  'owned_skins TEXT[]',
  'equipped_pawn TEXT',
  'equipped_board TEXT',
  'equipped_wall TEXT',
  'equipped_effect TEXT',
  'daily_streak INT DEFAULT 1',
  'last_claim_date TEXT',
  'username_key TEXT'
];

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blocade_users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT '👑',
      coins INT DEFAULT 1250,
      elo INT DEFAULT 1000,
      wins INT DEFAULT 0,
      losses INT DEFAULT 0,
      level INT DEFAULT 1,
      xp INT DEFAULT 0,
      created_at TEXT,
      owned_skins TEXT[],
      equipped_pawn TEXT,
      equipped_board TEXT,
      equipped_wall TEXT,
      equipped_effect TEXT,
      daily_streak INT DEFAULT 1,
      last_claim_date TEXT,
      username_key TEXT
    );
  `);
  // Миграция старых таблиц: добавляем недостающие колонки
  for (const col of USER_COLUMNS) {
    await pool.query(`ALTER TABLE blocade_users ADD COLUMN IF NOT EXISTS ${col}`);
  }
  // Ключ для регистронезависимого логина (считаем в JS, чтобы работала и кириллица)
  const old = await pool.query('SELECT username FROM blocade_users WHERE username_key IS NULL');
  for (const row of old.rows) {
    await pool.query('UPDATE blocade_users SET username_key = $2 WHERE username = $1', [
      row.username,
      row.username.toLowerCase()
    ]);
  }
  try {
    await pool.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS blocade_users_username_key_idx ON blocade_users (username_key)'
    );
  } catch (err) {
    console.warn('[DB] Не удалось создать уникальный индекс username_key:', err.message);
  }
  await pool.query('CREATE INDEX IF NOT EXISTS blocade_users_elo_idx ON blocade_users (elo DESC)');
}

let dbReady = false;
(async function initDBWithRetry() {
  for (let attempt = 1; ; attempt++) {
    try {
      await initDB();
      dbReady = true;
      console.log('[DB] PostgreSQL подключён, таблица blocade_users готова.');
      return;
    } catch (err) {
      console.error(`[DB] Ошибка инициализации (попытка ${attempt}):`, err.message);
      await sleep(Math.min(30000, 2000 * attempt));
    }
  }
})();

// ============================================================================
// ПАРОЛИ И ТОКЕНЫ
// ============================================================================
const scrypt = promisify(crypto.scrypt);

async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(String(pw), salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// Поддерживает и новый формат (scrypt с солью), и старый sha256 (для уже созданных аккаунтов)
async function verifyPassword(pw, stored) {
  if (!stored) return { ok: false, legacy: false };
  if (stored.startsWith('scrypt$')) {
    const [, saltHex, hashHex] = stored.split('$');
    const hash = await scrypt(String(pw), Buffer.from(saltHex, 'hex'), 64);
    return { ok: safeEqual(hash.toString('hex'), hashHex), legacy: false };
  }
  const legacyHash = crypto.createHash('sha256').update(String(pw)).digest('hex');
  return { ok: safeEqual(legacyHash, stored), legacy: true };
}

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function signToken(userKey) {
  const payload = Buffer.from(JSON.stringify({ u: userKey, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.u || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return String(data.u);
  } catch {
    return null;
  }
}

// Защита от подбора пароля: не больше 8 неудачных попыток за 10 минут на (IP + логин)
const failedLogins = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_FAILS = 8;
function isLoginBlocked(id) {
  const rec = failedLogins.get(id);
  if (!rec) return false;
  if (rec.resetAt < Date.now()) {
    failedLogins.delete(id);
    return false;
  }
  return rec.count >= LOGIN_MAX_FAILS;
}
function noteLoginFail(id) {
  const rec = failedLogins.get(id);
  if (!rec || rec.resetAt < Date.now()) failedLogins.set(id, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
  else rec.count += 1;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of failedLogins) if (v.resetAt < now) failedLogins.delete(k);
}, 60 * 1000).unref();

// ============================================================================
// ПОЛЬЗОВАТЕЛИ
// ============================================================================
const USERNAME_RE = /^[\p{L}\p{N}_.\-]{3,20}$/u;

function rowToUser(row) {
  const owned = new Set(G.DEFAULT_SKINS);
  for (const id of row.owned_skins || []) {
    for (const cat of Object.keys(G.CATALOG)) {
      const norm = G.normalizeSkin(id, cat);
      if (norm && id !== 'default') owned.add(norm);
    }
  }
  const eq = (cat, val) => {
    const norm = val ? G.normalizeSkin(val, cat) : null;
    return norm && owned.has(norm) ? norm : G.DEFAULT_EQUIPPED[cat];
  };
  return {
    username: row.username,
    avatar: row.avatar || '👑',
    coins: row.coins,
    elo: row.elo,
    wins: row.wins,
    losses: row.losses,
    level: row.level,
    xp: row.xp,
    createdAt: row.created_at,
    ownedSkins: [...owned],
    equipped: {
      pawn: eq('pawn', row.equipped_pawn),
      board: eq('board', row.equipped_board),
      wall: eq('wall', row.equipped_wall),
      effect: eq('effect', row.equipped_effect)
    },
    dailyStreak: row.daily_streak || 0,
    lastClaimDate: row.last_claim_date || ''
  };
}

async function getUserRow(userKey) {
  const { rows } = await pool.query('SELECT * FROM blocade_users WHERE username_key = $1', [userKey]);
  return rows[0] || null;
}

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    console.error(`[API] ${req.method} ${req.path}:`, err);
    if (!res.headersSent) res.status(500).json({ error: 'SERVER' });
  });

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const key = verifyToken(header.startsWith('Bearer ') ? header.slice(7) : '');
  if (!key) return res.status(401).json({ error: 'UNAUTHORIZED' });
  req.userKey = key;
  next();
}

// ============================================================================
// REST API
// ============================================================================
app.get('/api/health', (req, res) => res.json({ ok: true, db: dbReady }));

app.post(
  '/api/register',
  wrap(async (req, res) => {
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');
    if (!USERNAME_RE.test(username)) return res.status(400).json({ error: 'INVALID_USERNAME' });
    if (password.length < 4 || password.length > 100) return res.status(400).json({ error: 'INVALID_PASSWORD' });

    const key = username.toLowerCase();
    if (await getUserRow(key)) return res.status(409).json({ error: 'USER_EXISTS' });

    const passwordHash = await hashPassword(password);
    const createdAt = new Date().toISOString().slice(0, 10);
    const { rows } = await pool.query(
      `INSERT INTO blocade_users (
         username, username_key, password_hash, avatar, coins, elo, wins, losses, level, xp,
         created_at, owned_skins, equipped_pawn, equipped_board, equipped_wall, equipped_effect
       ) VALUES ($1, $2, $3, '👑', 1250, 1000, 0, 0, 1, 0, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        username,
        key,
        passwordHash,
        createdAt,
        G.DEFAULT_SKINS,
        G.DEFAULT_EQUIPPED.pawn,
        G.DEFAULT_EQUIPPED.board,
        G.DEFAULT_EQUIPPED.wall,
        G.DEFAULT_EQUIPPED.effect
      ]
    );
    if (!rows[0]) return res.status(409).json({ error: 'USER_EXISTS' });
    res.json({ token: signToken(key), user: rowToUser(rows[0]) });
  })
);

app.post(
  '/api/login',
  wrap(async (req, res) => {
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');
    const key = username.toLowerCase();
    const limiterId = `${req.ip}|${key}`;

    if (isLoginBlocked(limiterId)) return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
    if (!key || !password) return res.status(401).json({ error: 'BAD_CREDENTIALS' });

    const row = await getUserRow(key);
    // Проверяем пароль даже если пользователя нет — чтобы время ответа не выдавало существование логина
    const check = await verifyPassword(password, row?.password_hash ?? 'scrypt$00$00');
    if (!row || !check.ok) {
      noteLoginFail(limiterId);
      return res.status(401).json({ error: 'BAD_CREDENTIALS' });
    }
    failedLogins.delete(limiterId);

    if (check.legacy) {
      // Старый sha256-хеш → переводим на scrypt с солью
      const upgraded = await hashPassword(password);
      await pool.query('UPDATE blocade_users SET password_hash = $2 WHERE username_key = $1', [key, upgraded]);
    }
    res.json({ token: signToken(key), user: rowToUser(row) });
  })
);

app.get(
  '/api/me',
  requireAuth,
  wrap(async (req, res) => {
    const row = await getUserRow(req.userKey);
    if (!row) return res.status(401).json({ error: 'UNAUTHORIZED' });
    res.json({ user: rowToUser(row) });
  })
);

// --- Магазин -----------------------------------------------------------------
const EQUIP_COLUMN = {
  pawn: 'equipped_pawn',
  board: 'equipped_board',
  wall: 'equipped_wall',
  effect: 'equipped_effect'
};

app.post(
  '/api/shop/buy',
  requireAuth,
  wrap(async (req, res) => {
    const category = String(req.body?.category ?? '');
    const itemId = String(req.body?.itemId ?? '');
    const price = G.CATALOG[category]?.[itemId];
    if (price === undefined) return res.status(400).json({ error: 'UNKNOWN_ITEM' });

    // Одним атомарным запросом: хватает монет + ещё не куплено → списываем, добавляем, надеваем
    const col = EQUIP_COLUMN[category];
    const { rows } = await pool.query(
      `UPDATE blocade_users
          SET coins = coins - $2::int,
              owned_skins = array_append(COALESCE(owned_skins, ARRAY[]::text[]), $3::text),
              ${col} = $3::text
        WHERE username_key = $1
          AND coins >= $2::int
          AND NOT ($3::text = ANY(COALESCE(owned_skins, ARRAY[]::text[])))
      RETURNING *`,
      [req.userKey, price, itemId]
    );
    if (rows[0]) return res.json({ user: rowToUser(rows[0]) });

    const row = await getUserRow(req.userKey);
    if (!row) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const user = rowToUser(row);
    if (user.ownedSkins.includes(itemId)) return res.status(409).json({ error: 'ALREADY_OWNED', user });
    return res.status(402).json({ error: 'NOT_ENOUGH_COINS', user });
  })
);

app.post(
  '/api/shop/equip',
  requireAuth,
  wrap(async (req, res) => {
    const category = String(req.body?.category ?? '');
    const itemId = String(req.body?.itemId ?? '');
    if (G.CATALOG[category]?.[itemId] === undefined) return res.status(400).json({ error: 'UNKNOWN_ITEM' });

    const col = EQUIP_COLUMN[category];
    const { rows } = await pool.query(
      `UPDATE blocade_users
          SET ${col} = $2::text
        WHERE username_key = $1
          AND ($2::text = ANY(COALESCE(owned_skins, ARRAY[]::text[])) OR $2::text = ANY($3::text[]))
      RETURNING *`,
      [req.userKey, itemId, G.DEFAULT_SKINS]
    );
    if (!rows[0]) return res.status(403).json({ error: 'NOT_OWNED' });
    res.json({ user: rowToUser(rows[0]) });
  })
);

app.post(
  '/api/profile/avatar',
  requireAuth,
  wrap(async (req, res) => {
    const avatar = G.canonicalAvatar(req.body?.avatar);
    if (!avatar) return res.status(400).json({ error: 'UNKNOWN_AVATAR' });
    const { rows } = await pool.query('UPDATE blocade_users SET avatar = $2 WHERE username_key = $1 RETURNING *', [
      req.userKey,
      avatar
    ]);
    if (!rows[0]) return res.status(401).json({ error: 'UNAUTHORIZED' });
    res.json({ user: rowToUser(rows[0]) });
  })
);

// --- Ежедневная награда --------------------------------------------------------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dayNumber = (iso) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
const shiftDate = (iso, days) => new Date((dayNumber(iso) + days) * 86400000).toISOString().slice(0, 10);

app.post(
  '/api/daily/claim',
  requireAuth,
  wrap(async (req, res) => {
    // Клиент присылает свою локальную дату (чтобы «новый день» наступал в полночь по его времени),
    // но сервер принимает её только в пределах ±1 дня от UTC — чтобы нельзя было накрутить награды.
    const serverToday = new Date().toISOString().slice(0, 10);
    let today = String(req.body?.date ?? '');
    if (!DATE_RE.test(today) || Math.abs(dayNumber(today) - dayNumber(serverToday)) > 1) today = serverToday;

    const row = await getUserRow(req.userKey);
    if (!row) return res.status(401).json({ error: 'UNAUTHORIZED' });

    const last = row.last_claim_date || '';
    if (last && last >= today) return res.status(409).json({ error: 'ALREADY_CLAIMED', user: rowToUser(row) });

    const streak = last && last === shiftDate(today, -1) ? (row.daily_streak || 0) + 1 : 1;
    const reward = G.dailyRewardForStreak(streak);

    const { rows } = await pool.query(
      `UPDATE blocade_users
          SET coins = coins + $2::int, daily_streak = $3::int, last_claim_date = $4::text
        WHERE username_key = $1 AND (last_claim_date IS NULL OR last_claim_date < $4::text)
      RETURNING *`,
      [req.userKey, reward, streak, today]
    );
    if (!rows[0]) return res.status(409).json({ error: 'ALREADY_CLAIMED' });
    res.json({ user: rowToUser(rows[0]), reward, streak });
  })
);

// --- Итог матча с ботом ------------------------------------------------------------
// Бот играет в браузере, поэтому результат присылает клиент. ELO за ботов не начисляем
// (иначе его можно было бы накрутить), только монеты/опыт/статистику; плюс небольшой кулдаун.
const lastBotResult = new Map();
app.post(
  '/api/match/bot-result',
  requireAuth,
  wrap(async (req, res) => {
    const result = req.body?.result;
    const difficulty = String(req.body?.difficulty ?? '');
    if (result !== 'win' && result !== 'loss') return res.status(400).json({ error: 'BAD_INPUT' });
    if (!Object.prototype.hasOwnProperty.call(G.BOT_WIN_COINS, difficulty)) return res.status(400).json({ error: 'BAD_INPUT' });

    const now = Date.now();
    if (now - (lastBotResult.get(req.userKey) || 0) < 3000) return res.status(429).json({ error: 'TOO_FAST' });
    lastBotResult.set(req.userKey, now);

    const win = result === 'win';
    const coins = win ? G.BOT_WIN_COINS[difficulty] : G.BOT_LOSS_COINS;
    const xp = win ? G.BOT_WIN_XP : G.BOT_LOSS_XP;

    const { rows } = await pool.query(
      `UPDATE blocade_users
          SET wins = wins + $2::int, losses = losses + $3::int,
              coins = coins + $4::int, xp = xp + $5::int, level = (xp + $5::int) / ${G.XP_PER_LEVEL} + 1
        WHERE username_key = $1
      RETURNING *`,
      [req.userKey, win ? 1 : 0, win ? 0 : 1, coins, xp]
    );
    if (!rows[0]) return res.status(401).json({ error: 'UNAUTHORIZED' });
    res.json({ user: rowToUser(rows[0]), rewards: { coins, xp } });
  })
);

// --- Рейтинг ---------------------------------------------------------------------
app.get(
  '/api/leaderboard',
  wrap(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT username, avatar, elo, wins, losses, level FROM blocade_users ORDER BY elo DESC, wins DESC, username ASC LIMIT 25'
    );
    res.json({
      rows: rows.map((r) => ({
        username: r.username,
        avatar: r.avatar || '👑',
        elo: r.elo,
        wins: r.wins,
        losses: r.losses,
        level: r.level
      }))
    });
  })
);

app.use('/api', (req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

// Фронтенд (SPA). Если проект ещё не собран (`npm run build`), даём понятный ответ.
app.get('*', (req, res) => {
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res
    .status(200)
    .send('BLOCADE server is running. Frontend is not built: run `npm run build` (or use `npm run dev` on port 5173).');
});

// ============================================================================
// ОНЛАЙН: подбор соперника, приватные комнаты, матчи (Socket.IO)
// ============================================================================
const GRACE_MS = 30000; // сколько ждём вернувшегося игрока, прежде чем засчитать поражение

const userSockets = new Map(); // userKey -> socket (одна активная вкладка на игрока)
const userMatch = new Map(); // userKey -> код матча
const matches = new Map();
