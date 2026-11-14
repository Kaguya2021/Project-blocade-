// server/game.js

export const DEFAULT_SKINS = ['default'];
export const DEFAULT_EQUIPPED = {
  pawn: 'default',
  board: 'default',
  wall: 'default',
  effect: 'default'
};

export const XP_PER_LEVEL = 500;
export const MIN_ELO = 100;
export const TURN_SECONDS = 30;
export const MAX_TIMEOUTS = 3;

// Полный каталог товаров со всеми категориями (pawn, board, wall, effect)
export const CATALOG = {
  pawn: {
    'default': 0,
    'emerald-core': 0,
    'sovereign-gold': 450,
    'inferno-blaze': 850,
    'glacial-frost': 850
  },
  board: {
    'default': 0
  },
  wall: {
    'default': 0,
    'classic-green': 0,
    'crimson-mahogany': 400,
    'golden-barricade': 850,
    'neon-laser-wall': 950,
    'crystal-prism': 1350
  },
  effect: {
    'default': 0
  }
};

export const BOT_WIN_COINS = { easy: 50, medium: 100, hard: 200, default: 100 };
export const BOT_LOSS_COINS = 15;
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

export function applyMove(m, side, r, c) {
  const p = m.pos[side];
  const dr = Math.abs(p.r - r);
  const dc = Math.abs(p.c - c);
  if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
    m.pos[side] = { r, c };
    const won = side === 'P1' ? r === 8 : r === 0;
    m.turn = otherSide(side);
    return { ok: true, won };
  }
  return { ok: false, error: 'INVALID_MOVE' };
}

export function applyWall(m, side, r, c, o) {
  if (m.wallsLeft[side] <= 0) return { ok: false, error: 'NO_WALLS' };
  m.walls.push({ r, c, o });
  m.wallsLeft[side] -= 1;
  m.turn = otherSide(side);
  return { ok: true };
}
