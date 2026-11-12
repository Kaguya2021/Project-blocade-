import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Globe,
  Cpu,
  ShoppingBag,
  Backpack,
  User,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  RotateCw,
  Shield,
  Coins,
  Crown,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  Clock,
  Flame,
  Zap,
  Gift,
  Award,
  Users,
  Edit3,
  Plus,
  LogOut,
  Lock,
  Languages,
  Hand,
  AlertCircle
} from 'lucide-react';

// ============================================================================
// 1. TRANSLATIONS (RU / EN)
// ============================================================================
const I18N = {
  ru: {
    brandSub: 'ТАКТИЧЕСКАЯ СТРАТЕГИЯ СЕТКИ',
    play: 'ИГРАТЬ',
    playSub: 'Быстрый старт против ИИ',
    onlineMatch: 'ОНЛАЙН МАТЧ',
    onlineSub: 'Поиск соперника и комнаты',
    playWithBot: 'ИГРА С БОТОМ',
    botSub: '5 уровней интеллекта',
    shop: 'МАГАЗИН',
    inventory: 'ИНВЕНТАРЬ',
    profile: 'ПРОФИЛЬ',
    leaderboard: 'РЕЙТИНГ',
    daily: 'НАГРАДЫ',
    settings: 'НАСТРОЙКИ',
    back: 'НАЗАД',
    login: 'ВОЙТИ',
    register: 'РЕГИСТРАЦИЯ',
    logout: 'ВЫЙТИ',
    username: 'Логин',
    password: 'Пароль',
    confirmPassword: 'Повторите пароль',
    authTitleLogin: 'ВХОД В АККАУНТ',
    authTitleReg: 'СОЗДАНИЕ АККАУНТА',
    authSub: 'Личная база данных: прогресс, скины, монеты и ELO сохраняются за вашим логином.',
    switchToReg: 'Нет аккаунта? Зарегистрироваться',
    switchToLogin: 'Уже есть аккаунт? Войти',
    errShortUser: 'Логин должен быть от 3 символов',
    errShortPass: 'Пароль должен быть от 4 символов',
    errPassMatch: 'Пароли не совпадают',
    errUserExists: 'Этот логин уже занят',
    errWrongCreds: 'Неверный логин или пароль',
    yourTurn: 'ВАШ ХОД',
    oppTurn: 'ХОД СОПЕРНИКА',
    botThinking: 'БОТ ДУМАЕТ...',
    wallsLeft: 'Стен',
    round: 'Раунд',
    dragWallHint: 'Удерживайте и перетащите блок на линию сетки или нажмите для выбора',
    horizontalWall: 'ГОРИЗОНТАЛЬНАЯ',
    verticalWall: 'ВЕРТИКАЛЬНАЯ',
    blockedPathAlert: 'Нельзя полностью перекрыть путь к финишу!',
    victory: 'ПОБЕДА В МАТЧЕ!',
    defeat: 'ПОРАЖЕНИЕ В МАТЧЕ',
    roundWin: 'РАУНД ВЫИГРАН!',
    roundLoss: 'РАУНД ПРОИГРАН',
    nextRound: 'СЛЕДУЮЩИЙ РАУНД',
    playAgain: 'ИГРАТЬ СНОВА',
    toMenu: 'В МЕНЮ',
    quickMatch: 'БЫСТРЫЙ ПОИСК',
    createRoom: 'СОЗДАТЬ КОМНАТУ',
    joinRoom: 'ВОЙТИ ПО КОДУ',
    roomCode: 'Код комнаты',
    searching: 'Поиск соперника...',
    inviteLink: 'Ссылка-приглашение',
    copied: 'Скопировано!',
    difficulty: 'Сложность бота',
    yourSide: 'Ваша сторона',
    bottomSide: 'Снизу (Старт 9-й ряд)',
    topSide: 'Сверху (Старт 1-й ряд)',
    roundsCount: 'Количество раундов',
    startMatch: 'НАЧАТЬ БОЙ',
    buy: 'КУПИТЬ',
    equip: 'НАДЕТЬ',
    equipped: 'НАДЕТО',
    livePreview: 'ПРЕДПРОСМОТР ДОСКИ',
    winRate: 'Процент побед',
    matches: 'Матчей',
    wins: 'Побед',
    losses: 'Поражений',
    favSkin: 'Любимый скин',
    regDate: 'Дата регистрации',
    saveProfile: 'СОХРАНИТЬ',
    claim: 'ЗАБРАТЬ',
    claimed: 'ПОЛУЧЕНО',
    soundEffects: 'Звуковые эффекты',
    animations: 'Плавные анимации',
    language: 'Язык интерфейса'
  },
  en: {
    brandSub: 'TACTICAL GRID STRATEGY',
    play: 'PLAY',
    playSub: 'Instant match vs AI',
    onlineMatch: 'ONLINE MATCH',
    onlineSub: 'Real-time matchmaking & rooms',
    playWithBot: 'PLAY WITH BOT',
    botSub: '5 AI intelligence tiers',
    shop: 'SHOP',
    inventory: 'INVENTORY',
    profile: 'PROFILE',
    leaderboard: 'LEADERBOARD',
    daily: 'DAILY REWARDS',
    settings: 'SETTINGS',
    back: 'BACK',
    login: 'LOGIN',
    register: 'REGISTER',
    logout: 'LOGOUT',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    authTitleLogin: 'ACCOUNT LOGIN',
    authTitleReg: 'CREATE ACCOUNT',
    authSub: 'Personal database: coins, skins, inventory & ELO are saved to your username.',
    switchToReg: 'No account? Register now',
    switchToLogin: 'Already have an account? Login',
    errShortUser: 'Username must be at least 3 characters',
    errShortPass: 'Password must be at least 4 characters',
    errPassMatch: 'Passwords do not match',
    errUserExists: 'Username already taken',
    errWrongCreds: 'Invalid username or password',
    yourTurn: 'YOUR TURN',
    oppTurn: 'OPPONENT TURN',
    botThinking: 'BOT THINKING...',
    wallsLeft: 'Walls',
    round: 'Round',
    dragWallHint: 'Press & hold a wall block below to drag onto a groove, or tap to select',
    horizontalWall: 'HORIZONTAL',
    verticalWall: 'VERTICAL',
    blockedPathAlert: 'Cannot completely block all paths to the goal!',
    victory: 'MATCH VICTORY!',
    defeat: 'MATCH DEFEAT',
    roundWin: 'ROUND WON!',
    roundLoss: 'ROUND LOST',
    nextRound: 'NEXT ROUND',
    playAgain: 'PLAY AGAIN',
    toMenu: 'MAIN MENU',
    quickMatch: 'QUICK MATCH',
    createRoom: 'CREATE ROOM',
    joinRoom: 'JOIN BY CODE',
    roomCode: 'Room code',
    searching: 'Searching opponent...',
    inviteLink: 'Invite Link',
    copied: 'Copied!',
    difficulty: 'Bot Difficulty',
    yourSide: 'Your Side',
    bottomSide: 'Bottom (Start Row 9)',
    topSide: 'Top (Start Row 1)',
    roundsCount: 'Rounds to Win',
    startMatch: 'START MATCH',
    buy: 'BUY',
    equip: 'EQUIP',
    equipped: 'EQUIPPED',
    livePreview: 'LIVE BOARD PREVIEW',
    winRate: 'Win Rate',
    matches: 'Matches',
    wins: 'Wins',
    losses: 'Losses',
    favSkin: 'Favorite Skin',
    regDate: 'Registered',
    saveProfile: 'SAVE',
    claim: 'CLAIM',
    claimed: 'CLAIMED',
    soundEffects: 'Sound Effects',
    animations: 'Smooth Animations',
    language: 'Interface Language'
  }
};

// ============================================================================
// 2. SOUND ENGINE (Web Audio API)
// ============================================================================
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.05);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'move') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'wall') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(165, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.13);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.connect(g);
          g.connect(this.ctx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.08);
          g.gain.setValueAtTime(0.1, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.26);
        });
      }
    } catch (_) {}
  }
}
const sfx = new SoundFX();

// ============================================================================
// 3. SKINS CATALOG
// ============================================================================
const CATALOG = {
  pawn: [
    { id: 'pawn_emerald', name: 'Emerald Core', rarity: 'COMMON', price: 0, gradient: 'radial-gradient(circle at 30% 30%, #86efac, #55C879 55%, #15803d)', ring: '#bbf7d0', glow: 'rgba(85, 200, 121, 0.5)' },
    { id: 'pawn_gold', name: 'Sovereign Gold', rarity: 'RARE', price: 450, gradient: 'radial-gradient(circle at 30% 30%, #fef08a, #E9C56B 55%, #a16207)', ring: '#fef9c3', glow: 'rgba(233, 197, 107, 0.55)' },
    { id: 'pawn_fire', name: 'Inferno Blaze', rarity: 'EPIC', price: 850, gradient: 'radial-gradient(circle at 30% 30%, #fed7aa, #f97316 50%, #991b1b)', ring: '#ffedd5', glow: 'rgba(249, 115, 22, 0.6)' },
    { id: 'pawn_ice', name: 'Glacial Frost', rarity: 'EPIC', price: 850, gradient: 'radial-gradient(circle at 30% 30%, #e0f2fe, #38bdf8 55%, #0369a1)', ring: '#bae6fd', glow: 'rgba(56, 189, 248, 0.6)' },
    { id: 'pawn_neon', name: 'Cyber Pulse', rarity: 'LEGENDARY', price: 1400, gradient: 'radial-gradient(circle at 30% 30%, #f5d0fe, #d946ef 55%, #4c1d95)', ring: '#fae8ff', glow: 'rgba(217, 70, 239, 0.65)' },
    { id: 'pawn_cosmic', name: 'Astral Nebula', rarity: 'LEGENDARY', price: 1800, gradient: 'radial-gradient(circle at 30% 30%, #c7d2fe, #6366f1 50%, #0f172a)', ring: '#e0e7ff', glow: 'rgba(99, 102, 241, 0.7)' }
  ],
  board: [
    { id: 'board_classic_wood', name: 'Classic Wood', rarity: 'COMMON', price: 0, frameBg: '#2A251D', cellBg: '#363026', cellBorder: '#473F32', grooveBg: '#191713' },
    { id: 'board_dark_wood', name: 'Dark Obsidian Wood', rarity: 'RARE', price: 500, frameBg: '#1C1B18', cellBg: '#262420', cellBorder: '#35322C', grooveBg: '#12110F' },
    { id: 'board_neon_grid', name: 'Neon Grid', rarity: 'EPIC', price: 950, frameBg: '#111827', cellBg: '#1E293B', cellBorder: '#334155', grooveBg: '#090D16' },
    { id: 'board_ice_world', name: 'Ice World', rarity: 'EPIC', price: 1100, frameBg: '#162836', cellBg: '#1E3A4F', cellBorder: '#2C526E', grooveBg: '#0E1B24' },
    { id: 'board_lava_world', name: 'Lava World', rarity: 'LEGENDARY', price: 1500, frameBg: '#291512', cellBg: '#3B1D18', cellBorder: '#572921', grooveBg: '#170B09' },
    { id: 'board_golden', name: 'Golden Dynasty', rarity: 'LEGENDARY', price: 2000, frameBg: '#2E2614', cellBg: '#3F341B', cellBorder: '#615028', grooveBg: '#1A150B' },
    { id: 'board_galaxy', name: 'Galaxy Matrix', rarity: 'LEGENDARY', price: 2200, frameBg: '#19152B', cellBg: '#241E3D', cellBorder: '#393061', grooveBg: '#0E0B1A' }
  ],
  wall: [
    { id: 'wall_classic_green', name: 'Classic Green', rarity: 'COMMON', price: 0, bg: 'linear-gradient(135deg, #6EE794, #55C879 50%, #379956)', shadow: '0 0 12px rgba(85,200,121,0.45)', border: '#A7F3D0' },
    { id: 'wall_red_wood', name: 'Crimson Mahogany', rarity: 'RARE', price: 400, bg: 'linear-gradient(135deg, #F87171, #DC2626 50%, #7F1D1D)', shadow: '0 0 12px rgba(220,38,38,0.45)', border: '#FECACA' },
    { id: 'wall_golden', name: 'Golden Barricade', rarity: 'EPIC', price: 850, bg: 'linear-gradient(135deg, #FDE047, #E9C56B 50%, #A16207)', shadow: '0 0 14px rgba(233,197,107,0.55)', border: '#FEF9C3' },
    { id: 'wall_neon', name: 'Neon Laser Wall', rarity: 'EPIC', price: 950, bg: 'linear-gradient(135deg, #F0ABFC, #D946EF 50%, #701A75)', shadow: '0 0 16px rgba(217,70,239,0.65)', border: '#FAE8FF' },
    { id: 'wall_crystal', name: 'Crystal Prism', rarity: 'LEGENDARY', price: 1350, bg: 'linear-gradient(135deg, #A5F3FC, #06B6D4 50%, #155E75)', shadow: '0 0 16px rgba(6,182,212,0.6)', border: '#CFFAFE' },
    { id: 'wall_fire', name: 'Magma Shield', rarity: 'LEGENDARY', price: 1550, bg: 'linear-gradient(135deg, #FDBA74, #EA580C 50%, #7C2D12)', shadow: '0 0 16px rgba(234,88,12,0.65)', border: '#FFEDD5' }
  ],
  effect: [
    { id: 'fx_emerald', name: 'Emerald Aura', rarity: 'COMMON', price: 0, color: '#55C879' },
    { id: 'fx_gold_crown', name: 'Royal Gold Burst', rarity: 'RARE', price: 500, color: '#E9C56B' },
    { id: 'fx_lightning', name: 'Arc Lightning', rarity: 'EPIC', price: 900, color: '#38BDF8' },
    { id: 'fx_supernova', name: 'Supernova Shockwave', rarity: 'LEGENDARY', price: 1600, color: '#E879F9' }
  ]
};

const AVATARS = ['♟️', '👑', '🦊', '🐉', '⚡', '🔥', '❄️', '🌌', '🛡️', '🎯'];

const BOT_PROFILES = [
  { id: 'EASY', name: 'Rookie Bot', elo: 800, avatar: '🤖', color: '#AAA69A', descRu: 'Простые шаги вперёд, редко ставит стены', descEn: 'Simple forward steps, rarely places walls' },
  { id: 'NORMAL', name: 'Guard Bot', elo: 1050, avatar: '🛡️', color: '#55C879', descRu: 'Защищает проход и оценивает дистанцию', descEn: 'Defends lanes and evaluates distance' },
  { id: 'MEDIUM', name: 'Tactician AI', elo: 1300, avatar: '🧠', color: '#38BDF8', descRu: 'Анализирует кратчайший путь BFS в реальном времени', descEn: 'Analyzes real-time BFS shortest path' },
  { id: 'HARD', name: 'Grandmaster AI', elo: 1600, avatar: '⚔️', color: '#E9C56B', descRu: 'Комбинирует прорывы и удлиняющие блокировки', descEn: 'Combines breakthroughs and path-extending walls' },
  { id: 'EXPERT', name: 'Apex Oracle', elo: 1950, avatar: '👑', color: '#F43F5E', descRu: 'Глубокий просчёт разницы путей и контр-блоков', descEn: 'Deep path-delta & counter-wall calculation' }
];

// ============================================================================
// 4. GAME ENGINE & BFS PATHFINDING
// ============================================================================
const BOARD_SIZE = 9;
const INITIAL_WALLS = 10;

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

function shortestPathLength(startPos, goalRow, walls) {
  const visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
  const queue = [{ r: startPos.r, c: startPos.c, dist: 0 }];
  visited[startPos.r][startPos.c] = true;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.r === goalRow) return curr.dist;
    for (const [dr, dc] of dirs) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited[nr][nc]) {
        if (!isEdgeBlocked(curr.r, curr.c, nr, nc, walls)) {
          visited[nr][nc] = true;
          queue.push({ r: nr, c: nc, dist: curr.dist + 1 });
        }
      }
    }
  }
  return Infinity;
}

function canPlaceWall(candidate, walls, p1Pos, p2Pos) {
  if (candidate.r < 0 || candidate.r >= BOARD_SIZE - 1 || candidate.c < 0 || candidate.c >= BOARD_SIZE - 1) {
    return false;
  }
  if (walls.some((w) => wallsConflict(w, candidate))) return false;
  const nextWalls = [...walls, candidate];
  const d1 = shortestPathLength(p1Pos, 0, nextWalls);
  const d2 = shortestPathLength(p2Pos, BOARD_SIZE - 1, nextWalls);
  return d1 !== Infinity && d2 !== Infinity;
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

function computeBotAction(difficulty, botSide, p1Pos, p2Pos, walls, botWallsLeft) {
  const botPos = botSide === 'P1' ? p1Pos : p2Pos;
  const oppPos = botSide === 'P1' ? p2Pos : p1Pos;
  const botGoal = botSide === 'P1' ? 0 : BOARD_SIZE - 1;
  const oppGoal = botSide === 'P1' ? BOARD_SIZE - 1 : 0;

  const validMoves = getValidMoves(botPos, oppPos, walls);
  if (validMoves.length === 0) return null;

  // Immediate winning move
  const winMove = validMoves.find((m) => m.r === botGoal);
  if (winMove) return { type: 'move', r: winMove.r, c: winMove.c };

  const rankedMoves = validMoves
    .map((m) => ({
      ...m,
      dist: shortestPathLength(m, botGoal, walls)
    }))
    .sort((a, b) => a.dist - b.dist);

  if (difficulty === 'EASY') {
    const pick = Math.random() < 0.65 ? rankedMoves[0] : rankedMoves[Math.floor(Math.random() * rankedMoves.length)];
    return { type: 'move', r: pick.r, c: pick.c };
  }

  const curBotDist = shortestPathLength(botPos, botGoal, walls);
  const curOppDist = shortestPathLength(oppPos, oppGoal, walls);

  const wallChance = { NORMAL: 0.25, MEDIUM: 0.45, HARD: 0.65, EXPERT: 0.82 }[difficulty] || 0.4;
  if (botWallsLeft > 0 && (curOppDist <= curBotDist || Math.random() < wallChance)) {
    let bestWall = null;
    let bestScore = -999;

    for (let r = 0; r < BOARD_SIZE - 1; r++) {
      for (let c = 0; c < BOARD_SIZE - 1; c++) {
        for (const o of ['H', 'V']) {
          const cand = { r, c, o };
          if (!canPlaceWall(cand, walls, p1Pos, p2Pos)) continue;
          const nextWalls = [...walls, cand];
          const newBotDist = shortestPathLength(botPos, botGoal, nextWalls);
          const newOppDist = shortestPathLength(oppPos, oppGoal, nextWalls);
          const oppGain = newOppDist - curOppDist;
          const botLoss = newBotDist - curBotDist;
          const score = oppGain * 2.2 - botLoss * 1.6;
          if (score > bestScore && oppGain > 0) {
            bestScore = score;
            bestWall = cand;
          }
        }
      }
    }

    const threshold = difficulty === 'EXPERT' ? 1.2 : difficulty === 'HARD' ? 1.8 : 2.2;
    if (bestWall && bestScore >= threshold) {
      return { type: 'wall', ...bestWall };
    }
  }

  const bestMove = rankedMoves[0];
  return { type: 'move', r: bestMove.r, c: bestMove.c };
}

// ============================================================================
// 5. LOCAL DATABASE & ACCOUNT STORAGE (Login + Password)
// ============================================================================
const DB_USERS_KEY = 'blocade_users_db_v2';
const DB_SESSION_KEY = 'blocade_active_session_v2';

function simpleHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function createDefaultAccount(username, password) {
  return {
    username: username.trim(),
    passwordHash: simpleHash(password),
    avatar: '👑',
    coins: 1250,
    elo: 1000,
    wins: 0,
    losses: 0,
    level: 1,
    xp: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    ownedSkins: ['pawn_emerald', 'board_classic_wood', 'wall_classic_green', 'fx_emerald'],
    equipped: {
      pawn: 'pawn_emerald',
      board: 'board_classic_wood',
      wall: 'wall_classic_green',
      effect: 'fx_emerald'
    },
    dailyStreak: 1,
    lastClaimDate: '',
    questsClaimed: []
  };
}

function loadUsersDB() {
  try {
    return JSON.parse(localStorage.getItem(DB_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsersDB(db) {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(db));
}

// ============================================================================
// 6. MAIN APPLICATION
// ============================================================================
export default function App() {
  const [lang, setLang] = useState('ru');
  const t = I18N[lang];

  // Auth & User Profile State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authPass2, setAuthPass2] = useState('');
  const [authError, setAuthError] = useState('');

  // Navigation & Settings
  const [screen, setScreen] = useState('menu'); // menu | setup_bot | online_lobby | game | shop | inventory | profile | leaderboard | daily | settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animEnabled, setAnimEnabled] = useState(true);

  // Bot Setup
  const [botDiff, setBotDiff] = useState('MEDIUM');
  const [playerSide, setPlayerSide] = useState('P1'); // P1 = bottom (row 8 -> 0), P2 = top (row 0 -> 8)
  const [totalRounds, setTotalRounds] = useState(1);

  // Match State
  const [gameMode, setGameMode] = useState('bot'); // 'bot' | 'online'
  const [p1Pos, setP1Pos] = useState({ r: 8, c: 4 });
  const [p2Pos, setP2Pos] = useState({ r: 0, c: 4 });
  const [p1WallsLeft, setP1WallsLeft] = useState(INITIAL_WALLS);
  const [p2WallsLeft, setP2WallsLeft] = useState(INITIAL_WALLS);
  const [walls, setWalls] = useState([]);
  const [turn, setTurn] = useState('P1');
  const [turnTimer, setTurnTimer] = useState(30);
  const [botThinking, setBotThinking] = useState(false);
  const [roundScore, setRoundScore] = useState({ P1: 0, P2: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinner, setRoundWinner] = useState(null);
  const [matchWinner, setMatchWinner] = useState(null);
  const [boardShake, setBoardShake] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  // Wall Placement & Press-and-Hold Drag State
  const [selectedOrientation, setSelectedOrientation] = useState(null); // null | 'H' | 'V'
  const [hoverWall, setHoverWall] = useState(null); // { r, c, o, valid }
  const [draggingWall, setDraggingWall] = useState(null); // { o: 'H' | 'V', x, y }
  const boardRef = useRef(null);

  // Online Lobby State
  const [onlineSearching, setOnlineSearching] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [onlineOpponent, setOnlineOpponent] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Shop / Inventory / Leaderboard State
  const [shopTab, setShopTab] = useState('pawn');
  const [previewLoadout, setPreviewLoadout] = useState(null);
  const [lbTab, setLbTab] = useState('GLOBAL');
  const [editAvatar, setEditAvatar] = useState('👑');

  // Load saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(DB_SESSION_KEY);
    const db = loadUsersDB();
    if (savedSession && db[savedSession]) {
      setCurrentUser(db[savedSession]);
      setEditAvatar(db[savedSession].avatar);
    } else {
      // Create guest session or prompt auth
      const guestKey = 'guest_player';
      if (!db[guestKey]) {
        db[guestKey] = createDefaultAccount('Commander', '1234');
        saveUsersDB(db);
      }
      setCurrentUser(db[guestKey]);
      setEditAvatar(db[guestKey].avatar);
    }
  }, []);

  // Persist user updates to local DB
  const updateCurrentUser = (updater) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const db = loadUsersDB();
      db[updated.username.toLowerCase()] = updated;
      saveUsersDB(db);
      return updated;
    });
  };

  // Sync sound setting
  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Equipped Skins
  const activeLoadout = previewLoadout || currentUser?.equipped || {
    pawn: 'pawn_emerald',
    board: 'board_classic_wood',
    wall: 'wall_classic_green',
    effect: 'fx_emerald'
  };
  const pawnSkin = CATALOG.pawn.find((s) => s.id === activeLoadout.pawn) || CATALOG.pawn[0];
  const boardSkin = CATALOG.board.find((s) => s.id === activeLoadout.board) || CATALOG.board[0];
  const wallSkin = CATALOG.wall.find((s) => s.id === activeLoadout.wall) || CATALOG.wall[0];
  const effectSkin = CATALOG.effect.find((s) => s.id === activeLoadout.effect) || CATALOG.effect[0];

  // ==========================================================================
  // AUTH HANDLERS (Login + Password)
  // ==========================================================================
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanUser = authUser.trim();
    const key = cleanUser.toLowerCase();

    if (cleanUser.length < 3) {
      setAuthError(t.errShortUser);
      sfx.play('error');
      return;
    }
    if (authPass.length < 4) {
      setAuthError(t.errShortPass);
      sfx.play('error');
      return;
    }

    const db = loadUsersDB();

    if (authMode === 'register') {
      if (authPass !== authPass2) {
        setAuthError(t.errPassMatch);
        sfx.play('error');
        return;
      }
      if (db[key]) {
        setAuthError(t.errUserExists);
        sfx.play('error');
        return;
      }
      const newAcc = createDefaultAccount(cleanUser, authPass);
      db[key] = newAcc;
      saveUsersDB(db);
      localStorage.setItem(DB_SESSION_KEY, key);
      setCurrentUser(newAcc);
      setEditAvatar(newAcc.avatar);
      setAuthModalOpen(false);
      setAuthUser('');
      setAuthPass('');
      setAuthPass2('');
      sfx.play('win');
    } else {
      const existing = db[key];
      if (!existing || existing.passwordHash !== simpleHash(authPass)) {
        setAuthError(t.errWrongCreds);
        sfx.play('error');
        return;
      }
      localStorage.setItem(DB_SESSION_KEY, key);
      setCurrentUser(existing);
      setEditAvatar(existing.avatar);
      setAuthModalOpen(false);
      setAuthUser('');
      setAuthPass('');
      sfx.play('click');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(DB_SESSION_KEY);
    setAuthMode('login');
    setAuthError('');
    setAuthModalOpen(true);
    sfx.play('click');
  };

  // ==========================================================================
  // MATCH START & FLOW
  // ==========================================================================
  const resetRoundBoard = () => {
    setP1Pos({ r: 8, c: 4 });
    setP2Pos({ r: 0, c: 4 });
    setP1WallsLeft(INITIAL_WALLS);
    setP2WallsLeft(INITIAL_WALLS);
    setWalls([]);
    setTurn('P1');
    setTurnTimer(30);
    setSelectedOrientation(null);
    setHoverWall(null);
    setDraggingWall(null);
    setRoundWinner(null);
    setStatusBanner('');
  };

  const startNewMatch = (mode = 'bot', oppData = null) => {
    sfx.play('click');
    setGameMode(mode);
    setOnlineOpponent(oppData);
    setRoundScore({ P1: 0, P2: 0 });
    setCurrentRound(1);
    setMatchWinner(null);
    resetRoundBoard();
    setScreen('game');
  };

  // Turn countdown timer
  useEffect(() => {
    if (screen !== 'game' || matchWinner || roundWinner) return;
    const interval = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          setTurn((cur) => (cur === 'P1' ? 'P2' : 'P1'));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, matchWinner, roundWinner, turn]);

  // Handle round/match finish
  const concludeRound = (winnerSide) => {
    setRoundWinner(winnerSide);
    const nextScore = { ...roundScore, [winnerSide]: roundScore[winnerSide] + 1 };
    setRoundScore(nextScore);

    const winsNeeded = Math.ceil(totalRounds / 2);
    const isPlayerWin = winnerSide === playerSide;

    if (nextScore[winnerSide] >= winsNeeded || gameMode === 'online') {
      setMatchWinner(winnerSide);
      if (isPlayerWin) {
        sfx.play('win');
        updateCurrentUser((u) => ({
          ...u,
          wins: u.wins + 1,
          coins: u.coins + 150,
          elo: u.elo + 24,
          xp: u.xp + 120,
          level: Math.floor((u.xp + 120) / 500) + 1
        }));
      } else {
        sfx.play('error');
        updateCurrentUser((u) => ({
          ...u,
          losses: u.losses + 1,
          coins: u.coins + 35,
          elo: Math.max(400, u.elo - 16),
          xp: u.xp + 40
        }));
      }
    } else {
      sfx.play(isPlayerWin ? 'win' : 'error');
    }
  };

  // Bot AI execution effect
  useEffect(() => {
    if (screen !== 'game' || matchWinner || roundWinner) return;
    const oppSide = playerSide === 'P1' ? 'P2' : 'P1';
    if (turn !== oppSide) return;

    setBotThinking(true);
    const delay = gameMode === 'online' ? 950 : 550;
    const timer = setTimeout(() => {
      const oppWalls = oppSide === 'P1' ? p1WallsLeft : p2WallsLeft;
      const effectiveDiff = gameMode === 'online' ? 'HARD' : botDiff;
      const action = computeBotAction(effectiveDiff, oppSide, p1Pos, p2Pos, walls, oppWalls);

      if (action) {
        if (action.type === 'move') {
          if (oppSide === 'P1') setP1Pos({ r: action.r, c: action.c });
          else setP2Pos({ r: action.r, c: action.c });
          sfx.play('move');

          const goalRow = oppSide === 'P1' ? 0 : BOARD_SIZE - 1;
          if (action.r === goalRow) {
            setBotThinking(false);
            concludeRound(oppSide);
            return;
          }
        } else if (action.type === 'wall') {
          setWalls((prev) => [...prev, { r: action.r, c: action.c, o: action.o }]);
          if (oppSide === 'P1') setP1WallsLeft((w) => w - 1);
          else setP2WallsLeft((w) => w - 1);
          sfx.play('wall');
        }
      }

      setBotThinking(false);
      setTurn(playerSide);
      setTurnTimer(30);
    }, delay);

    return () => clearTimeout(timer);
  }, [turn, screen, matchWinner, roundWinner, playerSide, gameMode, botDiff, p1Pos, p2Pos, walls, p1WallsLeft, p2WallsLeft]);

  // ==========================================================================
  // PLAYER MOVES & WALL PLACEMENT (Click + Press-and-Hold Drag)
  // ==========================================================================
  const isPlayerTurn = screen === 'game' && !matchWinner && !roundWinner && turn === playerSide && !botThinking;
  const myPos = playerSide === 'P1' ? p1Pos : p2Pos;
  const oppPos = playerSide === 'P1' ? p2Pos : p1Pos;
  const myWallsLeft = playerSide === 'P1' ? p1WallsLeft : p2WallsLeft;
  const oppWallsLeft = playerSide === 'P1' ? p2WallsLeft : p1WallsLeft;

  const validMoveTargets = useMemo(() => {
    if (!isPlayerTurn) return [];
    return getValidMoves(myPos, oppPos, walls);
  }, [isPlayerTurn, myPos, oppPos, walls]);

  const handleCellClick = (r, c) => {
    if (!isPlayerTurn) return;
    if (!validMoveTargets.some((m) => m.r === r && m.c === c)) return;

    if (playerSide === 'P1') setP1Pos({ r, c });
    else setP2Pos({ r, c });
    setSelectedOrientation(null);
    setHoverWall(null);
    sfx.play('move');

    const goalRow = playerSide === 'P1' ? 0 : BOARD_SIZE - 1;
    if (r === goalRow) {
      concludeRound(playerSide);
    } else {
      setTurn(playerSide === 'P1' ? 'P2' : 'P1');
      setTurnTimer(30);
    }
  };

  const attemptPlaceWall = (r, c, o) => {
    if (!isPlayerTurn || myWallsLeft <= 0) return false;
    const candidate = { r, c, o };
    if (!canPlaceWall(candidate, walls, p1Pos, p2Pos)) {
      sfx.play('error');
      setBoardShake(true);
      setStatusBanner(t.blockedPathAlert);
      setTimeout(() => setBoardShake(false), 300);
      setTimeout(() => setStatusBanner(''), 2400);
      return false;
    }

    setWalls((prev) => [...prev, candidate]);
    if (playerSide === 'P1') setP1WallsLeft((w) => w - 1);
    else setP2WallsLeft((w) => w - 1);

    setSelectedOrientation(null);
    setHoverWall(null);
    sfx.play('wall');
    setTurn(playerSide === 'P1' ? 'P2' : 'P1');
    setTurnTimer(30);
    return true;
  };

  // Convert screen pointer coordinates into nearest 2-cell wall junction (0..7, 0..7)
  const getJunctionFromClientXY = (clientX, clientY, orientation) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    if (relX < -24 || relX > rect.width + 24 || relY < -24 || relY > rect.height + 24) {
      return null;
    }

    const stepX = rect.width / BOARD_SIZE;
    const stepY = rect.height / BOARD_SIZE;

    const c = Math.max(0, Math.min(BOARD_SIZE - 2, Math.round(relX / stepX) - 1));
    const r = Math.max(0, Math.min(BOARD_SIZE - 2, Math.round(relY / stepY) - 1));
    const valid = canPlaceWall({ r, c, o: orientation }, walls, p1Pos, p2Pos);
    return { r, c, o: orientation, valid };
  };

  // Start press-and-hold drag from bottom dock
  const startWallDrag = (orientation, e) => {
    if (!isPlayerTurn || myWallsLeft <= 0) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    sfx.play('click');
    setSelectedOrientation(orientation);
    setDraggingWall({ o: orientation, x: clientX, y: clientY });
    setHoverWall(getJunctionFromClientXY(clientX, clientY, orientation));
  };

  useEffect(() => {
    if (!draggingWall) return;

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDraggingWall((prev) => (prev ? { ...prev, x: clientX, y: clientY } : null));
      setHoverWall(getJunctionFromClientXY(clientX, clientY, draggingWall.o));
    };

    const onEnd = (e) => {
      const changed = e.changedTouches ? e.changedTouches[0] : e;
      const snap = getJunctionFromClientXY(changed.clientX, changed.clientY, draggingWall.o);
      if (snap) {
        attemptPlaceWall(snap.r, snap.c, snap.o);
      }
      setDraggingWall(null);
      setHoverWall(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [draggingWall, walls, p1Pos, p2Pos, isPlayerTurn, myWallsLeft]);

  // ==========================================================================
  // ONLINE MATCHMAKING HELPERS
  // ==========================================================================
  const triggerQuickMatch = () => {
    sfx.play('click');
    setOnlineSearching(true);
    setTimeout(() => {
      setOnlineSearching(false);
      const rivals = [
        { username: 'Kira_Vortex', elo: 1140, avatar: '🦊' },
        { username: 'ShadowGrid', elo: 1290, avatar: '⚡' },
        { username: 'Alina_Tactics', elo: 1085, avatar: '🔥' },
        { username: 'BishkekKing', elo: 1410, avatar: '👑' }
      ];
      const opp = rivals[Math.floor(Math.random() * rivals.length)];
      setPlayerSide('P1');
      setTotalRounds(1);
      startNewMatch('online', opp);
    }, 1800);
  };

  const generatePrivateRoom = () => {
    sfx.play('click');
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  // ==========================================================================
  // SHOP & INVENTORY HELPERS
  // ==========================================================================
  const handleBuyOrEquip = (category, item) => {
    if (!currentUser) return;
    const owned = currentUser.ownedSkins.includes(item.id);
    if (owned) {
      sfx.play('click');
      updateCurrentUser((u) => ({
        ...u,
        equipped: { ...u.equipped, [category]: item.id }
      }));
      setPreviewLoadout(null);
    } else if (currentUser.coins >= item.price) {
      sfx.play('win');
      updateCurrentUser((u) => ({
        ...u,
        coins: u.coins - item.price,
        ownedSkins: [...u.ownedSkins, item.id],
        equipped: { ...u.equipped, [category]: item.id }
      }));
      setPreviewLoadout(null);
    } else {
      sfx.play('error');
    }
  };

  // ==========================================================================
  // RENDER BOARD COMPONENT (Shared between Match & Live Shop Preview)
  // ==========================================================================
  const renderInteractiveBoard = (isPreview = false) => {
    const activeWalls = isPreview
      ? [
          { r: 2, c: 2, o: 'H' },
          { r: 4, c: 5, o: 'V' },
          { r: 6, c: 3, o: 'H' }
        ]
      : walls;

    const previewP1 = isPreview ? { r: 7, c: 4 } : p1Pos;
    const previewP2 = isPreview ? { r: 1, c: 4 } : p2Pos;

    return (
      <div
        ref={isPreview ? null : boardRef}
        className={`relative aspect-square w-full max-w-[440px] mx-auto rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border border-white/10 select-none ${
          boardShake && !isPreview ? 'animate-shake' : ''
        }`}
        style={{ backgroundColor: boardSkin.frameBg }}
      >
        {/* 9x9 Grid Cells */}
        <div
          className="relative w-full h-full grid grid-cols-9 grid-rows-9 gap-[5px] sm:gap-[7px] rounded-xl p-1"
          style={{ backgroundColor: boardSkin.grooveBg }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
            const r = Math.floor(idx / BOARD_SIZE);
            const c = idx % BOARD_SIZE;
            const isValidTarget = !isPreview && validMoveTargets.some((m) => m.r === r && m.c === c);
            const isGoalTop = r === 0;
            const isGoalBottom = r === BOARD_SIZE - 1;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => !isPreview && handleCellClick(r, c)}
                className={`relative rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-150 ${
                  isValidTarget ? 'cursor-pointer ring-2 ring-[#55C879] scale-[1.03]' : ''
                }`}
                style={{
                  backgroundColor: boardSkin.cellBg,
                  border: `1px solid ${boardSkin.cellBorder}`,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.45)'
                }}
              >
                {/* Goal Row Subtle Indicators */}
                {isGoalTop && <div className="absolute top-0 inset-x-1.5 h-[2px] bg-[#55C879]/40 rounded-full" />}
                {isGoalBottom && <div className="absolute bottom-0 inset-x-1.5 h-[2px] bg-[#E9C56B]/40 rounded-full" />}

                {/* Valid Move Dot */}
                {isValidTarget && (
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#55C879] animate-pulse shadow-[0_0_10px_#55C879]" />
                )}

                {/* Player 1 Pawn (Bottom) */}
                {previewP1.r === r && previewP1.c === c && (
                  <div
                    className="w-[74%] h-[74%] rounded-full flex items-center justify-center transition-all duration-200 z-20"
                    style={{
                      background: playerSide === 'P1' || isPreview ? pawnSkin.gradient : 'radial-gradient(circle at 30% 30%, #fca5a5, #ef4444 60%, #7f1d1d)',
                      boxShadow: `0 4px 10px rgba(0,0,0,0.6), 0 0 14px ${playerSide === 'P1' || isPreview ? pawnSkin.glow : 'rgba(239,68,68,0.5)'}`,
                      border: `2px solid ${playerSide === 'P1' || isPreview ? pawnSkin.ring : '#fecaca'}`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white/70" />
                  </div>
                )}

                {/* Player 2 Pawn (Top) */}
                {previewP2.r === r && previewP2.c === c && (
                  <div
                    className="w-[74%] h-[74%] rounded-full flex items-center justify-center transition-all duration-200 z-20"
                    style={{
                      background: playerSide === 'P2' && !isPreview ? pawnSkin.gradient : 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b 60%, #92400e)',
                      boxShadow: `0 4px 10px rgba(0,0,0,0.6), 0 0 14px ${playerSide === 'P2' && !isPreview ? pawnSkin.glow : 'rgba(245,158,11,0.5)'}`,
                      border: `2px solid ${playerSide === 'P2' && !isPreview ? pawnSkin.ring : '#fef3c7'}`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white/70" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Placed Walls Layer */}
          {activeWalls.map((w, i) => {
            const leftPct = ((w.c + 1) / BOARD_SIZE) * 100;
            const topPct = ((w.r + 1) / BOARD_SIZE) * 100;
            const isH = w.o === 'H';
            return (
              <div
                key={`wall-${i}-${w.r}-${w.c}-${w.o}`}
                className="absolute z-30 rounded-full pointer-events-none transition-transform duration-200"
                style={{
                  left: isH ? `${(w.c / BOARD_SIZE) * 100 + 1}%` : `calc(${leftPct}% - 4px)`,
                  top: isH ? `calc(${topPct}% - 4px)` : `${(w.r / BOARD_SIZE) * 100 + 1}%`,
                  width: isH ? `${(2 / BOARD_SIZE) * 100 - 2}%` : '8px',
                  height: isH ? '8px' : `${(2 / BOARD_SIZE) * 100 - 2}%`,
                  background: wallSkin.bg,
                  boxShadow: wallSkin.shadow,
                  border: `1px solid ${wallSkin.border}`
                }}
              />
            );
          })}

          {/* Interactive Junction Hotspots (for tap-to-place OR drag snap preview) */}
          {!isPreview &&
            isPlayerTurn &&
            myWallsLeft > 0 &&
            Array.from({ length: (BOARD_SIZE - 1) * (BOARD_SIZE - 1) }).map((_, jIdx) => {
              const jr = Math.floor(jIdx / (BOARD_SIZE - 1));
              const jc = jIdx % (BOARD_SIZE - 1);
              const leftPct = ((jc + 1) / BOARD_SIZE) * 100;
              const topPct = ((jr + 1) / BOARD_SIZE) * 100;
              const activeO = selectedOrientation || 'H';

              return (
                <button
                  key={`junc-${jr}-${jc}`}
                  type="button"
                  onMouseEnter={() => {
                    if (selectedOrientation) {
                      setHoverWall({
                        r: jr,
                        c: jc,
                        o: selectedOrientation,
                        valid: canPlaceWall({ r: jr, c: jc, o: selectedOrientation }, walls, p1Pos, p2Pos)
                      });
                    }
                  }}
                  onClick={() => {
                    if (selectedOrientation) {
                      attemptPlaceWall(jr, jc, selectedOrientation);
                    }
                  }}
                  style={{
                    left: `calc(${leftPct}% - 13px)`,
                    top: `calc(${topPct}% - 13px)`
                  }}
                  className={`absolute w-[26px] h-[26px] z-40 rounded-full flex items-center justify-center transition-opacity ${
                    selectedOrientation ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      canPlaceWall({ r: jr, c: jc, o: activeO }, walls, p1Pos, p2Pos)
                        ? 'bg-[#55C879]/70 ring-2 ring-[#55C879]/40'
                        : 'bg-red-500/40'
                    }`}
                  />
                </button>
              );
            })}

          {/* Snap Preview Ghost Wall */}
          {!isPreview && hoverWall && (
            <div
              className="absolute z-30 rounded-full pointer-events-none transition-all duration-75"
              style={{
                left:
                  hoverWall.o === 'H'
                    ? `${(hoverWall.c / BOARD_SIZE) * 100 + 1}%`
                    : `calc(${((hoverWall.c + 1) / BOARD_SIZE) * 100}% - 5px)`,
                top:
                  hoverWall.o === 'H'
                    ? `calc(${((hoverWall.r + 1) / BOARD_SIZE) * 100}% - 5px)`
                    : `${(hoverWall.r / BOARD_SIZE) * 100 + 1}%`,
                width: hoverWall.o === 'H' ? `${(2 / BOARD_SIZE) * 100 - 2}%` : '10px',
                height: hoverWall.o === 'H' ? '10px' : `${(2 / BOARD_SIZE) * 100 - 2}%`,
                background: hoverWall.valid ? 'rgba(85, 200, 121, 0.85)' : 'rgba(239, 68, 68, 0.85)',
                boxShadow: hoverWall.valid ? '0 0 16px #55C879' : '0 0 16px #ef4444'
              }}
            />
          )}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // TOP BAR & AUTH MODAL
  // ==========================================================================
  const renderTopBar = () => (
    <header className="w-full max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2 border-b border-white/5">
      <div className="flex items-center gap-2.5">
        {screen !== 'menu' && (
          <button
            onClick={() => {
              sfx.play('click');
              setPreviewLoadout(null);
              setScreen('menu');
            }}
            className="p-2 rounded-xl bg-[#22211D] hover:bg-[#2c2b26] border border-white/10 text-[#F4F1E8] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => {
            sfx.play('click');
            setScreen('menu');
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#55C879] to-[#2e8b4c] flex items-center justify-center shadow-[0_0_16px_rgba(85,200,121,0.35)]">
            <Shield className="w-5 h-5 text-[#171714] stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-wider text-[#F4F1E8] leading-none">BLOCADE</h1>
            <p className="text-[10px] tracking-widest text-[#AAA69A] hidden sm:block">{t.brandSub}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Toggle */}
        <button
          onClick={() => {
            sfx.play('click');
            setLang((l) => (l === 'ru' ? 'en' : 'ru'));
          }}
          className="px-2.5 py-1.5 rounded-xl bg-[#22211D] hover:bg-[#2c2b26] border border-white/10 text-xs font-bold text-[#F4F1E8] flex items-center gap-1.5 transition"
        >
          <Languages className="w-3.5 h-3.5 text-[#55C879]" />
          {lang.toUpperCase()}
        </button>

        {/* Coins Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-[#22211D] border border-[#E9C56B]/30 flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-[#E9C56B]" />
          <span className="text-xs sm:text-sm font-extrabold text-[#E9C56B]">{currentUser?.coins ?? 0}</span>
        </div>

        {/* Account Pill */}
        <button
          onClick={() => {
            sfx.play('click');
            setAuthError('');
            setAuthModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-[#22211D] hover:bg-[#2b2a25] border border-white/10 flex items-center gap-2 transition"
        >
          <span className="text-base">{currentUser?.avatar || '👑'}</span>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-[#F4F1E8] leading-none">{currentUser?.username}</div>
            <div className="text-[10px] text-[#55C879] font-semibold">ELO {currentUser?.elo}</div>
          </div>
        </button>
      </div>
    </header>
  );

  const renderAuthModal = () => {
    if (!authModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#22211D] border border-white/10 p-6 shadow-2xl relative">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-[#AAA69A] hover:text-white text-sm font-bold"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#55C879]/15 border border-[#55C879]/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#55C879]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#F4F1E8]">
                {authMode === 'login' ? t.authTitleLogin : t.authTitleReg}
              </h2>
              <p className="text-xs text-[#AAA69A]">{t.authSub}</p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3 mt-4">
            <div>
              <label className="block text-xs font-semibold text-[#AAA69A] mb-1">{t.username}</label>
              <input
                type="text"
                value={authUser}
                onChange={(e) => setAuthUser(e.target.value)}
                placeholder="kaguya_dev"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] text-sm focus:outline-none focus:border-[#55C879]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#AAA69A] mb-1">{t.password}</label>
              <input
                type="password"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] text-sm focus:outline-none focus:border-[#55C879]"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#AAA69A] mb-1">{t.confirmPassword}</label>
                <input
                  type="password"
                  value={authPass2}
                  onChange={(e) => setAuthPass2(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] text-sm focus:outline-none focus:border-[#55C879]"
                />
              </div>
            )}

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#55C879] hover:bg-[#47b569] text-[#171714] font-black text-sm tracking-wide transition shadow-[0_0_20px_rgba(85,200,121,0.3)]"
            >
              {authMode === 'login' ? t.login : t.register}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode((m) => (m === 'login' ? 'register' : 'login'));
                setAuthError('');
              }}
              className="text-[#E9C56B] hover:underline font-semibold"
            >
              {authMode === 'login' ? t.switchToReg : t.switchToLogin}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[#AAA69A] hover:text-red-400 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // 7. SCREENS
  // ==========================================================================
  const renderMainMenu = () => (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#22211D] via-[#1c1b18] to-[#171714] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#55C879]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#55C879]/15 border border-[#55C879]/30 text-[#55C879] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> SEASON 2026 • ELO {currentUser?.elo}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F1E8]">BLOCADE</h2>
            <p className="text-sm text-[#AAA69A]">
              {lang === 'ru'
                ? 'Переиграй соперника на 3D-сетке 9×9: перемещай фишку к противоположному краю и перетаскивай горизонтальные или вертикальные стены.'
                : 'Outsmart your rival on a 9×9 volumetric grid: race to the opposite edge while dragging horizontal and vertical walls.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => startNewMatch('bot')}
              className="px-7 py-4 rounded-2xl bg-[#55C879] hover:bg-[#49b86c] text-[#171714] font-black text-base flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(85,200,121,0.35)] transition active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              {t.play}
            </button>
            <button
              onClick={() => {
                sfx.play('click');
                setScreen('online_lobby');
              }}
              className="px-6 py-4 rounded-2xl bg-[#22211D] hover:bg-[#2c2b26] border border-[#E9C56B]/40 text-[#E9C56B] font-extrabold text-base flex items-center justify-center gap-2.5 transition active:scale-95"
            >
              <Globe className="w-5 h-5" />
              {t.onlineMatch}
            </button>
          </div>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => {
            sfx.play('click');
            setScreen('setup_bot');
          }}
          className="p-5 rounded-2xl bg-[#22211D] hover:bg-[#282722] border border-white/10 text-left transition group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#55C879]/15 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Cpu className="w-6 h-6 text-[#55C879]" />
          </div>
          <div className="font-black text-lg text-[#F4F1E8]">{t.playWithBot}</div>
          <div className="text-xs text-[#AAA69A] mt-1">{t.botSub}</div>
        </button>

        <button
          onClick={() => {
            sfx.play('click');
            setScreen('shop');
          }}
          className="p-5 rounded-2xl bg-[#22211D] hover:bg-[#282722] border border-white/10 text-left transition group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#E9C56B]/15 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <ShoppingBag className="w-6 h-6 text-[#E9C56B]" />
          </div>
          <div className="font-black text-lg text-[#F4F1E8]">{t.shop}</div>
          <div className="text-xs text-[#AAA69A] mt-1">
            {lang === 'ru' ? 'Скины фишек, досок, стен и эффектов' : 'Pawn, board, wall & victory skins'}
          </div>
        </button>

        <button
          onClick={() => {
            sfx.play('click');
            setScreen('daily');
          }}
          className="p-5 rounded-2xl bg-[#22211D] hover:bg-[#282722] border border-white/10 text-left transition group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Gift className="w-6 h-6 text-amber-400" />
          </div>
          <div className="font-black text-lg text-[#F4F1E8]">{t.daily}</div>
          <div className="text-xs text-[#AAA69A] mt-1">
            {lang === 'ru' ? 'Ежедневные монеты и задания' : 'Daily login coins & quests'}
          </div>
        </button>
      </div>

      {/* Bottom Quick Nav Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'inventory', label: t.inventory, icon: Backpack },
          { id: 'profile', label: t.profile, icon: User },
          { id: 'leaderboard', label: t.leaderboard, icon: Trophy },
          { id: 'settings', label: t.settings, icon: Settings }
        ].map((nav) => {
          const Icon = nav.icon;
          return (
            <button
              key={nav.id}
              onClick={() => {
                sfx.play('click');
                setScreen(nav.id);
              }}
              className="p-4 rounded-2xl bg-[#22211D] hover:bg-[#2b2a25] border border-white/10 flex items-center gap-3 transition"
            >
              <Icon className="w-5 h-5 text-[#55C879]" />
              <span className="font-bold text-sm text-[#F4F1E8]">{nav.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ==========================================================================
  // GAME ARENA SCREEN (With Bottom Horizontal & Vertical Press-and-Hold Dock)
  // ==========================================================================
  const renderGameScreen = () => {
    const oppProfile =
      gameMode === 'online'
        ? onlineOpponent || { username: 'Rival_Online', elo: 1120, avatar: '⚡' }
        : BOT_PROFILES.find((b) => b.id === botDiff) || BOT_PROFILES[2];

    return (
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col items-center gap-3 sm:gap-4">
        {/* Opponent Bar */}
        <div className="w-full max-w-[440px] rounded-2xl bg-[#22211D] border border-white/10 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{oppProfile.avatar}</span>
            <div>
              <div className="text-sm font-bold text-[#F4F1E8] flex items-center gap-2">
                {oppProfile.name || oppProfile.username}
                {botThinking && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9C56B]/20 text-[#E9C56B] animate-pulse">
                    {t.botThinking}
                  </span>
                )}
              </div>
              <div className="text-xs text-[#AAA69A]">ELO {oppProfile.elo}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#AAA69A] uppercase">{t.wallsLeft}</div>
              <div className="text-sm font-black text-[#E9C56B]">{oppWallsLeft}</div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#171714] border border-white/10 text-xs font-extrabold text-[#F4F1E8]">
              {roundScore[playerSide === 'P1' ? 'P2' : 'P1']} : {roundScore[playerSide]}
            </div>
          </div>
        </div>

        {/* Turn & Timer Status Strip */}
        <div className="w-full max-w-[440px] flex items-center justify-between px-1">
          <div
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
              isPlayerTurn
                ? 'bg-[#55C879]/20 text-[#55C879] border border-[#55C879]/40'
                : 'bg-white/5 text-[#AAA69A] border border-white/10'
            }`}
          >
            {isPlayerTurn ? t.yourTurn : t.oppTurn}
          </div>

          <div className="text-xs text-[#AAA69A] font-semibold">
            {t.round} {currentRound}/{totalRounds}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E9C56B]">
            <Clock className="w-3.5 h-3.5" />
            {turnTimer}s
          </div>
        </div>

        {/* Blocked Path Warning Banner */}
        {statusBanner && (
          <div className="w-full max-w-[440px] px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
            {statusBanner}
          </div>
        )}

        {/* 3D Tactical Grid Board */}
        {renderInteractiveBoard(false)}

        {/* BOTTOM WALL DOCK: Press & Hold Horizontal or Vertical Block to Drag */}
        <div className="w-full max-w-[440px] rounded-2xl bg-[#22211D] border border-white/10 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#AAA69A] flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-[#55C879]" />
              {t.dragWallHint}
            </span>
            <span className="text-xs font-black text-[#55C879]">
              {t.wallsLeft}: {myWallsLeft}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Horizontal Wall Draggable Item */}
            <div
              onMouseDown={(e) => startWallDrag('H', e)}
              onTouchStart={(e) => startWallDrag('H', e)}
              onClick={() => {
                if (!isPlayerTurn || myWallsLeft <= 0) return;
                sfx.play('click');
                setSelectedOrientation((o) => (o === 'H' ? null : 'H'));
              }}
              className={`p-3 rounded-xl border transition cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-2 select-none ${
                selectedOrientation === 'H'
                  ? 'bg-[#55C879]/15 border-[#55C879]'
                  : 'bg-[#171714] border-white/10 hover:border-white/25'
              } ${!isPlayerTurn || myWallsLeft <= 0 ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <div
                className="w-20 h-3 rounded-full"
                style={{ background: wallSkin.bg, boxShadow: wallSkin.shadow, border: `1px solid ${wallSkin.border}` }}
              />
              <span className="text-[11px] font-extrabold tracking-wider text-[#F4F1E8]">{t.horizontalWall}</span>
            </div>

            {/* Vertical Wall Draggable Item */}
            <div
              onMouseDown={(e) => startWallDrag('V', e)}
              onTouchStart={(e) => startWallDrag('V', e)}
              onClick={() => {
                if (!isPlayerTurn || myWallsLeft <= 0) return;
                sfx.play('click');
                setSelectedOrientation((o) => (o === 'V' ? null : 'V'));
              }}
              className={`p-3 rounded-xl border transition cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-2 select-none ${
                selectedOrientation === 'V'
                  ? 'bg-[#55C879]/15 border-[#55C879]'
                  : 'bg-[#171714] border-white/10 hover:border-white/25'
              } ${!isPlayerTurn || myWallsLeft <= 0 ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <div
                className="w-3 h-11 rounded-full"
                style={{ background: wallSkin.bg, boxShadow: wallSkin.shadow, border: `1px solid ${wallSkin.border}` }}
              />
              <span className="text-[11px] font-extrabold tracking-wider text-[#F4F1E8]">{t.verticalWall}</span>
            </div>
          </div>
        </div>

        {/* Floating Dragged Wall Ghost under Finger / Cursor */}
        {draggingWall && (
          <div
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: draggingWall.x,
              top: draggingWall.y - 28,
              width: draggingWall.o === 'H' ? '84px' : '11px',
              height: draggingWall.o === 'H' ? '11px' : '84px',
              background: wallSkin.bg,
              boxShadow: '0 8px 25px rgba(0,0,0,0.75)',
              border: `1.5px solid ${wallSkin.border}`
            }}
          />
        )}

        {/* Round / Match Result Overlay */}
        {(roundWinner || matchWinner) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#22211D] border border-white/15 p-6 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E9C56B]/20 border border-[#E9C56B]/40 flex items-center justify-center">
                <Crown className="w-8 h-8 text-[#E9C56B]" />
              </div>

              <h3 className="text-2xl font-black text-[#F4F1E8]">
                {matchWinner
                  ? matchWinner === playerSide
                    ? t.victory
                    : t.defeat
                  : roundWinner === playerSide
                  ? t.roundWin
                  : t.roundLoss}
              </h3>

              {matchWinner && (
                <div className="flex items-center justify-center gap-4 text-sm font-bold">
                  <span className="text-[#E9C56B]">+{matchWinner === playerSide ? 150 : 35} COINS</span>
                  <span className={matchWinner === playerSide ? 'text-[#55C879]' : 'text-red-400'}>
                    {matchWinner === playerSide ? '+24 ELO' : '-16 ELO'}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2.5 pt-2">
                {!matchWinner ? (
                  <button
                    onClick={() => {
                      setCurrentRound((r) => r + 1);
                      resetRoundBoard();
                    }}
                    className="w-full py-3 rounded-xl bg-[#55C879] text-[#171714] font-black text-sm"
                  >
                    {t.nextRound}
                  </button>
                ) : (
                  <button
                    onClick={() => startNewMatch(gameMode, onlineOpponent)}
                    className="w-full py-3 rounded-xl bg-[#55C879] text-[#171714] font-black text-sm"
                  >
                    {t.playAgain}
                  </button>
                )}

                <button
                  onClick={() => setScreen('menu')}
                  className="w-full py-3 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] font-bold text-sm"
                >
                  {t.toMenu}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // BOT SETUP SCREEN
  // ==========================================================================
  const renderBotSetup = () => (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-black text-[#F4F1E8]">{t.playWithBot}</h2>

      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase text-[#AAA69A]">{t.difficulty}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BOT_PROFILES.map((bot) => (
            <button
              key={bot.id}
              onClick={() => {
                sfx.play('click');
                setBotDiff(bot.id);
              }}
              className={`p-4 rounded-2xl border text-left transition ${
                botDiff === bot.id
                  ? 'bg-[#55C879]/15 border-[#55C879]'
                  : 'bg-[#22211D] border-white/10 hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-[#F4F1E8]">
                  {bot.avatar} {bot.id} — {bot.name}
                </span>
                <span className="text-xs font-bold text-[#E9C56B]">ELO {bot.elo}</span>
              </div>
              <p className="text-xs text-[#AAA69A] mt-1">{lang === 'ru' ? bot.descRu : bot.descEn}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#22211D] border border-white/10 space-y-2">
          <div className="text-xs font-bold uppercase text-[#AAA69A]">{t.yourSide}</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'P1', label: t.bottomSide },
              { id: 'P2', label: t.topSide }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setPlayerSide(s.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border ${
                  playerSide === s.id
                    ? 'bg-[#55C879] text-[#171714] border-[#55C879]'
                    : 'bg-[#171714] text-[#F4F1E8] border-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#22211D] border border-white/10 space-y-2">
          <div className="text-xs font-bold uppercase text-[#AAA69A]">{t.roundsCount}</div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 3, 5].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setTotalRounds(cnt)}
                className={`py-2.5 rounded-xl text-xs font-black border ${
                  totalRounds === cnt
                    ? 'bg-[#E9C56B] text-[#171714] border-[#E9C56B]'
                    : 'bg-[#171714] text-[#F4F1E8] border-white/10'
                }`}
              >
                BO{cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => startNewMatch('bot')}
        className="w-full py-4 rounded-2xl bg-[#55C879] hover:bg-[#49b86c] text-[#171714] font-black text-base shadow-[0_0_24px_rgba(85,200,121,0.35)] transition"
      >
        {t.startMatch}
      </button>
    </div>
  );

  // ==========================================================================
  // ONLINE MATCHMAKING LOBBY SCREEN
  // ==========================================================================
  const renderOnlineLobby = () => (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-black text-[#F4F1E8]">{t.onlineMatch}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[#22211D] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#55C879]/15 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#55C879]" />
          </div>
          <h3 className="text-lg font-black text-[#F4F1E8]">{t.quickMatch}</h3>
          <p className="text-xs text-[#AAA69A]">
            {lang === 'ru'
              ? 'Автоматический подбор соперника по рейтингу ELO в реальном времени.'
              : 'Automatic real-time matchmaking based on your ELO rating.'}
          </p>
          <button
            onClick={triggerQuickMatch}
            disabled={onlineSearching}
            className="w-full py-3.5 rounded-xl bg-[#55C879] text-[#171714] font-black text-sm flex items-center justify-center gap-2"
          >
            {onlineSearching ? t.searching : t.quickMatch}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[#22211D] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E9C56B]/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#E9C56B]" />
          </div>
          <h3 className="text-lg font-black text-[#F4F1E8]">{t.createRoom}</h3>

          {!roomCode ? (
            <button
              onClick={generatePrivateRoom}
              className="w-full py-3 rounded-xl bg-[#E9C56B] text-[#171714] font-black text-sm"
            >
              {t.createRoom}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-[#171714] border border-[#E9C56B]/40 flex items-center justify-between">
              <span className="font-mono font-black text-base text-[#E9C56B] tracking-widest">{roomCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}?room=${roomCode}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#22211D] text-xs font-bold text-[#F4F1E8] flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#55C879]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? t.copied : t.inviteLink}
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder={t.roomCode}
              className="flex-1 px-3 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-xs font-mono text-[#F4F1E8]"
            />
            <button
              onClick={() => {
                if (joinCodeInput.length >= 4) {
                  startNewMatch('online', { username: `Host_${joinCodeInput}`, elo: 1210, avatar: '🛡️' });
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-extrabold text-[#F4F1E8]"
            >
              {t.joinRoom}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================================================
  // SHOP & LIVE PREVIEW SCREEN
  // ==========================================================================
  const renderShopOrInventory = (onlyOwned = false) => {
    const items = CATALOG[shopTab].filter((it) => !onlyOwned || currentUser?.ownedSkins.includes(it.id));

    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#F4F1E8]">{onlyOwned ? t.inventory : t.shop}</h2>
            <div className="flex gap-1.5 bg-[#22211D] p-1 rounded-xl border border-white/10">
              {['pawn', 'board', 'wall', 'effect'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    sfx.play('click');
                    setShopTab(tab);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition ${
                    shopTab === tab ? 'bg-[#55C879] text-[#171714]' : 'text-[#AAA69A] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const owned = currentUser?.ownedSkins.includes(item.id);
              const equipped = currentUser?.equipped[shopTab] === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setPreviewLoadout({ ...(currentUser?.equipped || {}), [shopTab]: item.id })}
                  onMouseLeave={() => setPreviewLoadout(null)}
                  className="p-4 rounded-2xl bg-[#22211D] border border-white/10 hover:border-[#55C879]/50 transition flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-wider text-[#E9C56B]">{item.rarity}</span>
                      <div className="font-bold text-base text-[#F4F1E8]">{item.name}</div>
                    </div>

                    {shopTab === 'pawn' && (
                      <div className="w-10 h-10 rounded-full" style={{ background: item.gradient, boxShadow: `0 0 12px ${item.glow}` }} />
                    )}
                    {shopTab === 'board' && (
                      <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: item.cellBg }} />
                    )}
                    {shopTab === 'wall' && (
                      <div className="w-12 h-3 rounded-full" style={{ background: item.bg, boxShadow: item.shadow }} />
                    )}
                    {shopTab === 'effect' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}30` }}>
                        <Sparkles className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuyOrEquip(shopTab, item)}
                    disabled={equipped}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition ${
                      equipped
                        ? 'bg-white/10 text-[#55C879]'
                        : owned
                        ? 'bg-[#55C879] text-[#171714]'
                        : 'bg-[#E9C56B] text-[#171714]'
                    }`}
                  >
                    {equipped ? t.equipped : owned ? t.equip : `${t.buy} • ${item.price}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Live Board Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-black tracking-wider text-[#AAA69A] uppercase">{t.livePreview}</div>
          {renderInteractiveBoard(true)}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // PROFILE SCREEN
  // ==========================================================================
  const renderProfile = () => {
    if (!currentUser) return null;
    const totalGames = currentUser.wins + currentUser.losses;
    const winRate = totalGames > 0 ? Math.round((currentUser.wins / totalGames) * 100) : 0;

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="p-6 rounded-3xl bg-[#22211D] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#171714] border border-[#55C879]/40 flex items-center justify-center text-3xl">
              {currentUser.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#F4F1E8]">{currentUser.username}</h2>
              <div className="text-xs text-[#AAA69A]">
                LVL {currentUser.level} • ELO <span className="text-[#55C879] font-bold">{currentUser.elo}</span>
              </div>
              <div className="text-[11px] text-[#AAA69A] mt-0.5">
                {t.regDate}: {currentUser.createdAt}
              </div>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-xs font-bold text-[#E9C56B]"
          >
            {t.login} / {t.register}
          </button>
        </div>

        {/* Avatar Picker */}
        <div className="p-5 rounded-2xl bg-[#22211D] border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase text-[#AAA69A]">Avatar</div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => {
                  setEditAvatar(av);
                  updateCurrentUser({ avatar: av });
                  sfx.play('click');
                }}
                className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border ${
                  currentUser.avatar === av ? 'bg-[#55C879]/20 border-[#55C879]' : 'bg-[#171714] border-white/10'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t.wins, val: currentUser.wins, color: '#55C879' },
            { label: t.losses, val: currentUser.losses, color: '#F87171' },
            { label: t.winRate, val: `${winRate}%`, color: '#E9C56B' },
            { label: t.matches, val: totalGames, color: '#F4F1E8' }
          ].map((st) => (
            <div key={st.label} className="p-4 rounded-2xl bg-[#22211D] border border-white/10">
              <div className="text-xs text-[#AAA69A]">{st.label}</div>
              <div className="text-2xl font-black mt-1" style={{ color: st.color }}>
                {st.val}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // LEADERBOARD, DAILY REWARDS & SETTINGS
  // ==========================================================================
  const renderLeaderboard = () => {
    const rows = [
      { rank: 1, name: 'Kaguya_Sama', elo: 2140, wins: 184, lvl: 28, avatar: '👑' },
      { rank: 2, name: 'ApexStrategist', elo: 1985, wins: 152, lvl: 24, avatar: '🐉' },
      { rank: 3, name: 'NeonWallMaster', elo: 1820, wins: 129, lvl: 21, avatar: '⚡' },
      {
        rank: 4,
        name: currentUser?.username || 'You',
        elo: currentUser?.elo || 1000,
        wins: currentUser?.wins || 0,
        lvl: currentUser?.level || 1,
        avatar: currentUser?.avatar || '♟️',
        isMe: true
      }
    ].sort((a, b) => b.elo - a.elo);

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#F4F1E8]">{t.leaderboard}</h2>
          <div className="flex gap-1.5 bg-[#22211D] p-1 rounded-xl border border-white/10">
            {['GLOBAL', 'WEEKLY', 'FRIENDS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setLbTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold ${
                  lbTab === tab ? 'bg-[#E9C56B] text-[#171714]' : 'text-[#AAA69A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div
              key={r.name}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                r.isMe ? 'bg-[#55C879]/10 border-[#55C879]/50' : 'bg-[#22211D] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-black text-sm text-[#E9C56B]">#{i + 1}</span>
                <span className="text-2xl">{r.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-[#F4F1E8]">{r.name}</div>
                  <div className="text-[11px] text-[#AAA69A]">
                    LVL {r.lvl} • {r.wins} {t.wins}
                  </div>
                </div>
              </div>
              <div className="font-black text-sm text-[#55C879]">ELO {r.elo}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDaily = () => {
    const today = new Date().toISOString().slice(0, 10);
    const claimedToday = currentUser?.lastClaimDate === today;

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-5">
        <h2 className="text-2xl font-black text-[#F4F1E8]">{t.daily}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[100, 150, 250, 500].map((reward, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#22211D] border border-white/10 text-center space-y-2">
              <div className="text-xs font-bold text-[#AAA69A]">DAY {idx + 1}</div>
              <Coins className="w-7 h-7 text-[#E9C56B] mx-auto" />
              <div className="font-black text-base text-[#E9C56B]">+{reward}</div>
              {idx === 0 && (
                <button
                  disabled={claimedToday}
                  onClick={() => {
                    sfx.play('win');
                    updateCurrentUser((u) => ({
                      ...u,
                      coins: u.coins + reward,
                      lastClaimDate: today
                    }));
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-black ${
                    claimedToday ? 'bg-white/10 text-[#AAA69A]' : 'bg-[#55C879] text-[#171714]'
                  }`}
                >
                  {claimedToday ? t.claimed : t.claim}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl font-black text-[#F4F1E8]">{t.settings}</h2>

      <div className="p-4 rounded-2xl bg-[#22211D] border border-white/10 flex items-center justify-between">
        <span className="font-bold text-sm text-[#F4F1E8]">{t.language}</span>
        <div className="flex gap-2">
          {['ru', 'en'].map((code) => (
            <button
              key={code}
              onClick={() => {
                setLang(code);
                sfx.play('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                lang === code ? 'bg-[#55C879] text-[#171714]' : 'bg-[#171714] text-[#AAA69A]'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#22211D] border border-white/10 flex items-center justify-between">
        <span className="font-bold text-sm text-[#F4F1E8]">{t.soundEffects}</span>
        <button
          onClick={() => setSoundEnabled((s) => !s)}
          className={`px-4 py-2 rounded-xl text-xs font-black ${
            soundEnabled ? 'bg-[#55C879] text-[#171714]' : 'bg-[#171714] text-[#AAA69A]'
          }`}
        >
          {soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-[#22211D] border border-white/10 flex items-center justify-between">
        <span className="font-bold text-sm text-[#F4F1E8]">{t.animations}</span>
        <button
          onClick={() => setAnimEnabled((a) => !a)}
          className={`px-4 py-2 rounded-xl text-xs font-black ${
            animEnabled ? 'bg-[#55C879] text-[#171714]' : 'bg-[#171714] text-[#AAA69A]'
          }`}
        >
          {animEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#171714] text-[#F4F1E8] flex flex-col">
      {renderTopBar()}
      {renderAuthModal()}

      <main className="flex-1">
        {screen === 'menu' && renderMainMenu()}
        {screen === 'setup_bot' && renderBotSetup()}
        {screen === 'online_lobby' && renderOnlineLobby()}
        {screen === 'game' && renderGameScreen()}
        {screen === 'shop' && renderShopOrInventory(false)}
        {screen === 'inventory' && renderShopOrInventory(true)}
        {screen === 'profile' && renderProfile()}
        {screen === 'leaderboard' && renderLeaderboard()}
        {screen === 'daily' && renderDaily()}
        {screen === 'settings' && renderSettings()}
      </main>
    </div>
  );
}
