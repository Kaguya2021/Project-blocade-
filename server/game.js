// server/game.js

export const DEFAULT_SKINS = ['pawn_emerald', 'board_classic_wood', 'wall_classic_green', 'fx_emerald'];
export const DEFAULT_EQUIPPED = {
  pawn: 'pawn_emerald',
  board: 'board_classic_wood',
  wall: 'wall_classic_green',
  effect: 'fx_emerald'
};

export const XP_PER_LEVEL = 500;
export const MIN_ELO = 100;
export const TURN_SECONDS = 30;
export const MAX_TIMEOUTS = 3;

// Каталог: ID и цены ДОЛЖНЫ совпадать с CATALOG в src/App.jsx
export const CATALOG = {
  pawn: {
    pawn_emerald: 0,
    pawn_gold: 450,
    pawn_fire: 850,
    pawn_ice: 850,
    pawn_neon: 1400,
    pawn_cosmic: 1800
  },
  board: {
    board_classic_wood: 0,
    board_dark_wood: 500,
    board_neon_grid: 950,
    board_ice_world: 1100,
    board_lava_world: 1500,
    board_golden: 2000,
    board_galaxy: 2200
  },
  wall: {
    wall_classic_green: 0,
    wall_red_wood: 400,
    wall_golden: 850,
    wall_neon: 950,
    wall_crystal: 1350,
    wall_fire: 1550
  },
  effect: {
    fx_emerald: 0,
    fx_gold_crown: 500,
    fx_lightning: 900,
    fx_supernova: 1600
  }
};

// Старые ID (из прошлых версий) → текущие
export const LEGACY_SKIN_MAP = {
  default: null, // зависит от категории, см. normalizeSkin
  'emerald-core': 'pawn_emerald',
  'sovereign-gold': 'pawn_gold',
  'inferno-blaze': 'pawn_fire',
  'glacial-frost': 'pawn_ice',
  'classic-green': 'wall_classic_green',
  'crimson-mahogany': 'wall_red_wood',
  'golden-barricade': 'wall_golden',
  'neon-laser-wall': 'wall_neon',
  'crystal-prism': 'wall_crystal'
};

export const ALL_SKIN_IDS = new Set(Object.values(CATALOG).flatMap((c) => Object.keys(c)));

export function normalizeSkin(id, category) {
  if (id === 'default') return DEFAULT_EQUIPPED[category];
  const mapped = LEGACY_SKIN_MAP[id] || id;
  return CATALOG[category]?.[mapped] !== undefined ? mapped : null;
}

// Награды за матч с ботом (ключи = id сложности в клиенте)
export const BOT_WIN_COINS = { EASY: 50, NORMAL: 80, MEDIUM: 110, HARD: 150, EXPERT: 200 };
export const BOT_LOSS_COINS = 35;
export const BOT_WIN_XP = 75;
export const BOT_LOSS_XP = 20;

export const ONLINE_REWARDS = {
  winCoins: 150,
  winXp: 150,
  loseCoins: 40,
  loseXp: 50
};

export function canonicalAvatar(avatar) {
  return typeof avatar === 'string' && avatar.trim() ? avatar.trim() : '👑';
}

export function dailyRewardForStreak(streak) {
  return Math.min(1000, 100 + (streak - 1) * 50);
}

export function calcElo(myElo, oppElo) {
  const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
  const k = 32;
  const winDelta = Math.round(k * (1 - expected));
  const loseDelta = Math.round(k * (0 - expected));
  return { winnerDelta: Math.max(10, winDelta), loserDelta: Math.min(-10, loseDelta) };
}

export function otherSide(side) {
  return side === 'P1' ? 'P2' : 'P1';
}

export function createMatch(code, p1, p2) {
  return {
    code,
    players: { P1: p1, P2: p2 },
    pos: { P1: { r: 0, c: 4 }, P2: { r: 8, c: 4 } },
    walls: [],
    wallsLeft: { P1: 10, P2: 10 },
    turn: 'P1',
    status: 'playing',
    winner: null,
    timeouts: { P1: 0, P2: 0 },
    timer: null,
    turnEndsAt: Date.now() + TURN_SECONDS * 1000
  };
}

// ---- Правила (зеркало клиентской логики) ----
const SIZE = 9;
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function wallsConflict(w1, w2) {
  if (w1.o === w2.o) {
    if (w1.r === w2.r && w1.c === w2.c) return true;
    if (w1.o === 'H' && w1.r === w2.r && Math.abs(w1.c - w2.c) === 1) return true;
    if (w1.o === 'V' && w1.c === w2.c && Math.abs(w1.r - w2.r) === 1) return true;
  } else if (w1.r === w2.r && w1.c === w2.c) return true;
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

function pathExists(start, goalRow, walls) {
  const seen = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const q = [start];
  seen[start.r][start.c] = true;
  while (q.length) {
    const cur = q.shift();
    if (cur.r === goalRow) return true;
    for (const [dr, dc] of DIRS) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || seen[nr][nc]) continue;
      if (isEdgeBlocked(cur.r, cur.c, nr, nc, walls)) continue;
      seen[nr][nc] = true;
      q.push({ r: nr, c: nc });
    }
  }
  return false;
}

export function getValidMoves(pos, other, walls) {
  const moves = [];
  for (const [dr, dc] of DIRS) {
    const nr = pos.r + dr;
    const nc = pos.c + dc;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
    if (isEdgeBlocked(pos.r, pos.c, nr, nc, walls)) continue;
    if (nr === other.r && nc === other.c) {
      const jr = nr + dr;
      const jc = nc + dc;
      if (jr >= 0 && jr < SIZE && jc >= 0 && jc < SIZE && !isEdgeBlocked(nr, nc, jr, jc, walls)) {
        moves.push({ r: jr, c: jc });
      } else {
        const diags = dr !== 0 ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
        for (const [ddr, ddc] of diags) {
          const sr = nr + ddr;
          const sc = nc + ddc;
          if (sr >= 0 && sr < SIZE && sc >= 0 && sc < SIZE && !isEdgeBlocked(nr, nc, sr, sc, walls)) {
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

export function applyMove(m, side, r, c) {
  if (m.turn !== side) return { ok: false, error: 'NOT_YOUR_TURN' };
  if (!Number.isInteger(r) || !Number.isInteger(c)) return { ok: false, error: 'INVALID_MOVE' };
  const legal = getValidMoves(m.pos[side], m.pos[otherSide(side)], m.walls);
  if (!legal.some((mv) => mv.r === r && mv.c === c)) return { ok: false, error: 'INVALID_MOVE' };
  m.pos[side] = { r, c };
  const won = side === 'P1' ? r === SIZE - 1 : r === 0;
  m.turn = otherSide(side);
  return { ok: true, won };
}

export function applyWall(m, side, r, c, o) {
  if (m.turn !== side) return { ok: false, error: 'NOT_YOUR_TURN' };
  if (m.wallsLeft[side] <= 0) return { ok: false, error: 'NO_WALLS' };
  if ((o !== 'H' && o !== 'V') || !Number.isInteger(r) || !Number.isInteger(c)) return { ok: false, error: 'INVALID_WALL' };
  if (r < 0 || r >= SIZE - 1 || c < 0 || c >= SIZE - 1) return { ok: false, error: 'INVALID_WALL' };
  const cand = { r, c, o };
  if (m.walls.some((w) => wallsConflict(w, cand))) return { ok: false, error: 'INVALID_WALL' };
  const next = [...m.walls, cand];
  // P1 идёт вниз (к строке 8), P2 — вверх (к строке 0)
  if (!pathExists(m.pos.P1, SIZE - 1, next) || !pathExists(m.pos.P2, 0, next)) {
    return { ok: false, error: 'INVALID_WALL' };
  }
  m.walls = next;
  m.wallsLeft[side] -= 1;
  m.turn = otherSide(side);
  return { ok: true };
}
