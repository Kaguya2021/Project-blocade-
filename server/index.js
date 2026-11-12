import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import crypto from 'crypto';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Раздаем собранный фронтенд Vite из папки dist
app.use(express.static(path.join(__dirname, '../dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const BOARD_SIZE = 9;
const INITIAL_WALLS = 10;

// Подключение к Neon PostgreSQL через DATABASE_URL из переменных окружения Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Автоматическое создание таблицы пользователей при запуске сервера
async function initDB() {
  try {
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
        last_claim_date TEXT
      );
    `);
    console.log('PostgreSQL database connected & table verified.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}
initDB();

const rooms = new Map();
let quickMatchQueue = [];

function hashPassword(pw) {
  return crypto.createHash('sha256').update(String(pw)).digest('hex');
}

function wallsConflict(w1, w2) {
  if (w1.o === w2.o) {
    if (w1.r === w2.r && w1.c === w2.c) return true;
    if (w1.o === 'H' && w1.r === w2.r && Math.abs(w1.c - w2.c) === 1) return true;
    if (w1.o === 'V' && w1.c === w2.c && Math.abs(w1.r - w2.r) === 1) return true;
  } else {
    if (w1.r === w2.r && w1.c === w2.c) return true;
  }
  return false;
}

function isEdgeBlocked(r1, c1, r2, c2, walls) {
  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    return walls.some((w) => w.o === 'V' && w.c === minC && (w.r === r1 || w.r === r1 - 1));
  }
  if (c1 === c2) {
    const minR = Math.min(r1, r2);
    return walls.some((w) => w.o === 'H' && w.r === minR && (w.c === c1 || w.c === c1 - 1));
  }
  return true;
}

function hasPathToGoal(startPos, goalRow, walls) {
  const visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
  const queue = [startPos];
  visited[startPos.r][startPos.c] = true;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.r === goalRow) return true;
    for (const [dr, dc] of dirs) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited[nr][nc]) {
        if (!isEdgeBlocked(curr.r, curr.c, nr, nc, walls)) {
          visited[nr][nc] = true;
          queue.push({ r: nr, c: nc });
        }
      }
    }
  }
  return false;
}

function getValidMoves(playerPos, otherPos, walls) {
  const moves = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
    if (isEdgeBlocked(playerPos.r, playerPos.c, nr, nc, walls)) continue;

    if (nr === otherPos.r && nc === otherPos.c) {
      const jr = nr + dr;
      const jc = nc + dc;
      if (jr >= 0 && jr < BOARD_SIZE && jc >= 0 && jc < BOARD_SIZE && !isEdgeBlocked(nr, nc, jr, jc, walls)) {
        moves.push({ r: jr, c: jc });
      } else {
        const diags = dr !== 0 ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
        for (const [ddr, ddc] of diags) {
          const sr = nr + ddr;
          const sc = nc + ddc;
          if (sr >= 0 && sr < BOARD_SIZE && sc >= 0 && sc < BOARD_SIZE && !isEdgeBlocked(nr, nc, sr, sc, walls)) {
            moves.push({ r: sr, c: sc });
          }
        }
      }
    } else {
      moves.push({ r: nr, c: nc });
    }
  }
  return moves;
}

// REST API для авторизации с сохранением в PostgreSQL
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const clean = String(username || '').trim().toLowerCase();
  if (clean.length < 3 || String(password || '').length < 4) {
    return res.status(400).json({ error: 'Invalid username or password length' });
  }

  try {
    const check = await pool.query('SELECT username FROM blocade_users WHERE username = $1', [clean]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = hashPassword(password);
    const createdAt = new Date().toISOString().slice(0, 10);
    const ownedSkins = ['pawn_emerald', 'board_classic_wood', 'wall_classic_green', 'fx_emerald'];

    await pool.query(
      `INSERT INTO blocade_users (
        username, password_hash, avatar, coins, elo, wins, losses, level, xp, 
        created_at, owned_skins, equipped_pawn, equipped_board, equipped_wall, equipped_effect
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        String(username).trim(), passwordHash, '👑', 1250, 1000, 0, 0, 1, 0,
        createdAt, ownedSkins, 'pawn_emerald', 'board_classic_wood', 'wall_classic_green', 'fx_emerald'
      ]
    );

    res.json({
      user: {
        username: String(username).trim(),
        avatar: '👑',
        coins: 1250,
        elo: 1000,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0,
        createdAt,
        ownedSkins,
        equipped: {
          pawn: 'pawn_emerald',
          board: 'board_classic_wood',
          wall: 'wall_classic_green',
          effect: 'fx_emerald'
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const clean = String(username || '').trim().toLowerCase();

  try {
    const result = await pool.query('SELECT * FROM blocade_users WHERE LOWER(username) = $1', [clean]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const row = result.rows[0];
    if (row.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: {
        username: row.username,
        avatar: row.avatar,
        coins: row.coins,
        elo: row.elo,
        wins: row.wins,
        losses: row.losses,
        level: row.level,
        xp: row.xp,
        createdAt: row.created_at,
        ownedSkins: row.owned_skins,
        equipped: {
          pawn: row.equipped_pawn,
          board: row.equipped_board,
          wall: row.equipped_wall,
          effect: row.equipped_effect
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Отдача index.html для роутинга фронтенда
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Socket.IO логика комнат и онлайн-матчей
function createRoomState(code, p1Socket, p1Meta) {
  return {
    code,
    status: 'waiting',
    turn: 'P1',
    p1: { socketId: p1Socket.id, ...p1Meta, pos: { r: 8, c: 4 }, wallsLeft: INITIAL_WALLS },
    p2: null,
    walls: [],
    winner: null
  };
}

io.on('connection', (socket) => {
  socket.on('create_room', ({ user }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = createRoomState(code, socket, user);
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room_created', { code, room });
  });

  socket.on('join_room', ({ code, user }) => {
    const cleanCode = String(code || '').trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return socket.emit('room_error', { message: 'Room not found' });
    if (room.status !== 'waiting' || room.p2) return socket.emit('room_error', { message: 'Room full' });

    room.p2 = { socketId: socket.id, ...user, pos: { r: 0, c: 4 }, wallsLeft: INITIAL_WALLS };
    room.status = 'playing';
    socket.join(cleanCode);
    io.to(cleanCode).emit('match_started', { room });
  });

  socket.on('quick_match', ({ user }) => {
    quickMatchQueue = quickMatchQueue.filter((item) => item.socket.connected && item.socket.id !== socket.id);
    if (quickMatchQueue.length > 0) {
      const opponent = quickMatchQueue.shift();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room = createRoomState(code, opponent.socket, opponent.user);
      room.p2 = { socketId: socket.id, ...user, pos: { r: 0, c: 4 }, wallsLeft: INITIAL_WALLS };
      room.status = 'playing';
      rooms.set(code, room);

      opponent.socket.join(code);
      socket.join(code);
      io.to(code).emit('match_started', { room });
    } else {
      quickMatchQueue.push({ socket, user });
      socket.emit('searching');
    }
  });

  socket.on('move_pawn', ({ code, r, c }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return;
    const isP1 = room.p1.socketId === socket.id;
    const isP2 = room.p2?.socketId === socket.id;
    if ((room.turn === 'P1' && !isP1) || (room.turn === 'P2' && !isP2)) return;

    const actor = isP1 ? room.p1 : room.p2;
    const other = isP1 ? room.p2 : room.p1;
    const valid = getValidMoves(actor.pos, other.pos, room.walls);
    if (!valid.some((m) => m.r === r && m.c === c)) return;

    actor.pos = { r, c };
    if ((isP1 && r === 0) || (isP2 && r === BOARD_SIZE - 1)) {
      room.status = 'finished';
      room.winner = isP1 ? 'P1' : 'P2';
    } else {
      room.turn = room.turn === 'P1' ? 'P2' : 'P1';
    }
    io.to(code).emit('state_updated', { room });
  });

  socket.on('place_wall', ({ code, r, c, o }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return;
    const isP1 = room.p1.socketId === socket.id;
    const isP2 = room.p2?.socketId === socket.id;
    if ((room.turn === 'P1' && !isP1) || (room.turn === 'P2' && !isP2)) return;

    const actor = isP1 ? room.p1 : room.p2;
    if (actor.wallsLeft <= 0) return;
    if (r < 0 || r >= BOARD_SIZE - 1 || c < 0 || c >= BOARD_SIZE - 1 || (o !== 'H' && o !== 'V')) return;

    const candidate = { r, c, o };
    if (room.walls.some((w) => wallsConflict(w, candidate))) return;
    const nextWalls = [...room.walls, candidate];
    if (!hasPathToGoal(room.p1.pos, 0, nextWalls) || !hasPathToGoal(room.p2.pos, BOARD_SIZE - 1, nextWalls)) return;

    room.walls = nextWalls;
    actor.wallsLeft -= 1;
    room.turn = room.turn === 'P1' ? 'P2' : 'P1';
    io.to(code).emit('state_updated', { room });
  });

  socket.on('disconnect', () => {
    quickMatchQueue = quickMatchQueue.filter((item) => item.socket.id !== socket.id);
    for (const [code, room] of rooms.entries()) {
      if (room.status === 'playing' && (room.p1.socketId === socket.id || room.p2?.socketId === socket.id)) {
        room.status = 'finished';
        room.winner = room.p1.socketId === socket.id ? 'P2' : 'P1';
        io.to(code).emit('state_updated', { room });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`BLOCADE server running on port ${PORT}`);
});
