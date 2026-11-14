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
import { io } from 'socket.io-client';
import { chooseBotAction } from './botEngine.js';

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
    language: 'Язык интерфейса',
    errNetwork: 'Нет связи с сервером. Проверьте интернет и попробуйте снова',
    errServer: 'Ошибка сервера. Попробуйте чуть позже',
    errTooMany: 'Слишком много попыток входа. Подождите несколько минут',
    errBadChars: 'Логин: 3–20 символов — буквы, цифры, _ . -',
    loggedInAs: 'Вы вошли как',
    loading: 'Загрузка…',
    cancel: 'ОТМЕНА',
    serverOffline: 'Нет соединения с сервером. Переподключаемся…',
    searchingHint: 'Матч начнётся, как только ещё один игрок нажмёт «Быстрый поиск»',
    waitingFriend: 'Ждём друга… отправьте ему код или ссылку',
    roomNotFound: 'Комната не найдена или уже закрыта',
    roomSelf: 'Это ваша собственная комната',
    roomBusy: 'Хозяин комнаты уже в игре',
    oppDisconnected: 'Соперник отключился. Ждём его возвращения…',
    resign: 'СДАТЬСЯ',
    resignConfirm: 'Выйти из матча? Это будет засчитано как поражение.',
    turnSkipped: 'Время хода вышло — ход пропущен',
    reasonResignWin: 'Соперник сдался',
    reasonResignLose: 'Вы сдались',
    reasonTimeoutWin: 'У соперника закончилось время',
    reasonTimeoutLose: 'У вас закончилось время',
    reasonDisconnectWin: 'Соперник отключился',
    reasonDisconnectLose: 'Соединение потеряно',
    notEnoughCoins: 'Недостаточно монет',
    replacedTitle: 'Игра открыта в другой вкладке',
    replacedText: 'Закройте лишние вкладки и нажмите кнопку, чтобы продолжить здесь.',
    reconnect: 'ПРОДОЛЖИТЬ ЗДЕСЬ',
    day: 'ДЕНЬ',
    dailyDone: 'Награда на сегодня получена. Возвращайтесь завтра!',
    dailyStreak: 'Серия дней',
    lbEmpty: 'Пока никого нет — станьте первым!',
    lbLoading: 'Загрузка рейтинга…',
    loadFailed: 'Не удалось загрузить данные'
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
    language: 'Interface Language',
    errNetwork: 'Cannot reach the server. Check your connection and try again',
    errServer: 'Server error. Please try again later',
    errTooMany: 'Too many login attempts. Wait a few minutes',
    errBadChars: 'Username: 3–20 characters — letters, digits, _ . -',
    loggedInAs: 'Signed in as',
    loading: 'Loading…',
    cancel: 'CANCEL',
    serverOffline: 'No connection to the server. Reconnecting…',
    searchingHint: 'The match starts as soon as another player presses "Quick Match"',
    waitingFriend: 'Waiting for your friend… send them the code or link',
    roomNotFound: 'Room not found or already closed',
    roomSelf: 'This is your own room',
    roomBusy: 'The room host is already in a match',
    oppDisconnected: 'Opponent disconnected. Waiting for them to come back…',
    resign: 'RESIGN',
    resignConfirm: 'Leave the match? It will count as a defeat.',
    turnSkipped: 'Time is up — turn skipped',
    reasonResignWin: 'Opponent resigned',
    reasonResignLose: 'You resigned',
    reasonTimeoutWin: 'Opponent ran out of time',
    reasonTimeoutLose: 'You ran out of time',
    reasonDisconnectWin: 'Opponent disconnected',
    reasonDisconnectLose: 'Connection lost',
    notEnoughCoins: 'Not enough coins',
    replacedTitle: 'Game is open in another tab',
    replacedText: 'Close the extra tabs and press the button to continue here.',
    reconnect: 'CONTINUE HERE',
    day: 'DAY',
    dailyDone: 'Today\'s reward is claimed. Come back tomorrow!',
    dailyStreak: 'Day streak',
    lbEmpty: 'Nobody here yet — be the first!',
    lbLoading: 'Loading leaderboard…',
    loadFailed: 'Failed to load data'
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

// ============================================================================
// 5. SERVER API (аккаунты, скины, монеты и ELO хранятся в Neon PostgreSQL)
// ============================================================================
// В разработке (`npm run dev`) запросы идут через прокси Vite на сервер :3001 (см. vite.config.js).
// Если фронтенд лежит отдельно от сервера — задайте переменную VITE_SERVER_URL.
const SERVER_URL = String(import.meta.env?.VITE_SERVER_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'blocade_token_v3';

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage недоступен — просто не запоминаем вход */
  }
}

// Возвращает { ok, status, error, data }; сетевые сбои превращаются в error: 'NETWORK'
async function apiRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${SERVER_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    return { ok: false, status: 0, error: 'NETWORK', data: {} };
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* пустой ответ */
  }
  return { ok: res.ok, status: res.status, error: data?.error, data };
}

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Награды за матч с ботом (те же числа, что и на сервере — сервер начисляет сам)
const BOT_WIN_COINS = { EASY: 50, NORMAL: 80, MEDIUM: 110, HARD: 150, EXPERT: 200 };
const BOT_LOSS_COINS = 35;
const DAILY_REWARDS = [100, 150, 250, 500];

// ============================================================================
// 6. MAIN APPLICATION
// ============================================================================
// Логотип в шапке: берём /logo.png (файл лежит в папке public/), если его нет — показываем щит
function LogoMark() {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src="/logo.png"
        alt="BLOCADE"
        onError={() => setFailed(true)}
        className="w-9 h-9 rounded-xl object-cover shadow-[0_0_16px_rgba(85,200,121,0.35)]"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#55C879] to-[#2e8b4c] flex items-center justify-center shadow-[0_0_16px_rgba(85,200,121,0.35)]">
      <Shield className="w-5 h-5 text-[#171714] stroke-[2.5]" />
    </div>
  );
}

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
  const [authBusy, setAuthBusy] = useState(false);
  const [authReady, setAuthReady] = useState(false); // проверили сохранённый вход

  // Navigation & Settings
  const [screen, setScreen] = useState('menu'); // menu | setup_bot | online_lobby | game | shop | inventory | profile | leaderboard | daily | settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animEnabled, setAnimEnabled] = useState(true);

  // Bot Setup
  const [botDiff, setBotDiff] = useState('MEDIUM');
  const [botSide, setBotSide] = useState('P1'); // выбор на экране настройки: P1 = снизу, P2 = сверху
  const [botRounds, setBotRounds] = useState(1);
  const [playerSide, setPlayerSide] = useState('P1'); // сторона в текущем матче: P1 = bottom (row 8 -> 0), P2 = top (row 0 -> 8)
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
  const [onlineError, setOnlineError] = useState(''); // NOT_FOUND | SELF | BUSY | OFFLINE | SERVER
  const [onlineResult, setOnlineResult] = useState(null); // { reason, rewards }
  const [opponentOnline, setOpponentOnline] = useState(true);
  const [awaitingServer, setAwaitingServer] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [pendingRoom, setPendingRoom] = useState(() => {
    try {
      return (new URLSearchParams(window.location.search).get('room') || '').toUpperCase();
    } catch {
      return '';
    }
  });

  // Shop / Inventory / Leaderboard State
  const [shopTab, setShopTab] = useState('pawn');
  const [previewLoadout, setPreviewLoadout] = useState(null);
  const [lbRows, setLbRows] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState(false);
  const [shopBusy, setShopBusy] = useState(false);
  const [shopMsg, setShopMsg] = useState('');
  const [dailyBusy, setDailyBusy] = useState(false);
  const [editAvatar, setEditAvatar] = useState('👑');

  const onlineRef = useRef({ active: false, side: 'P1' }); // идёт ли сейчас онлайн-матч
  const socketRef = useRef(null);
  const wallsCountRef = useRef(0);
  const langRef = useRef('ru');
  langRef.current = lang;

  const applyUser = (u) => {
    if (!u) return;
    setCurrentUser(u);
    if (u.avatar) setEditAvatar(u.avatar);
  };

  // Восстанавливаем вход по сохранённому токену (аккаунт живёт в базе данных, а не в браузере)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getToken()) {
        const r = await apiRequest('/api/me');
        if (cancelled) return;
        if (r.ok) applyUser(r.data.user);
        else if (r.status === 401) setToken('');
        else setAuthError(I18N.ru.errNetwork);
      }
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Применить состояние матча, присланное сервером
  const applySnapshot = (st) => {
    setP1Pos(st.p1Pos);
    setP2Pos(st.p2Pos);
    setWalls(st.walls);
    setP1WallsLeft(st.p1Walls);
    setP2WallsLeft(st.p2Walls);
    setTurn(st.turn);
    setTurnTimer(st.turnTimeLeft);
    setSelectedOrientation(null);
    setHoverWall(null);
    setDraggingWall(null);
    setAwaitingServer(false);
    wallsCountRef.current = st.walls.length;
  };

  // Соединение с сервером (Socket.IO) — пока игрок вошёл в аккаунт
  const isLoggedIn = !!currentUser;
  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const token = getToken();
    if (!token) return undefined;

    const opts = { auth: { token }, transports: ['websocket', 'polling'], reconnectionDelayMax: 4000 };
    const socket = SERVER_URL ? io(SERVER_URL, opts) : io(opts);
    socketRef.current = socket;

    const dropAuth = () => {
      setToken('');
      setCurrentUser(null);
      setScreen('menu');
    };

    socket.on('connect', () => {
      setSocketConnected(true);
      setAwaitingServer(false);
    });
    socket.on('disconnect', () => {
      setSocketConnected(false);
      setOnlineSearching(false);
      setRoomCode('');
    });
    socket.on('connect_error', (err) => {
      setSocketConnected(false);
      if (err?.message === 'AUTH') dropAuth();
    });
    socket.on('auth_error', dropAuth);
    socket.on('replaced', () => setReplaced(true));
    socket.on('server_error', () => {
      setOnlineSearching(false);
      setOnlineError('SERVER');
      setAwaitingServer(false);
    });
    socket.on('queue_status', ({ searching }) => setOnlineSearching(!!searching));
    socket.on('room_created', ({ code }) => {
      setRoomCode(code);
      setOnlineError('');
    });
    socket.on('room_cancelled', () => setRoomCode(''));
    socket.on('room_error', ({ error }) => {
      setOnlineError(error);
      sfx.play('error');
    });

    socket.on('match_start', ({ you, state, players, resumed }) => {
      const oppSide = you === 'P1' ? 'P2' : 'P1';
      onlineRef.current = { active: true, side: you };
      setGameMode('online');
      setPlayerSide(you);
      setTotalRounds(1);
      setCurrentRound(1);
      setRoundScore({ P1: 0, P2: 0 });
      setOnlineOpponent(players[oppSide]);
      setMatchWinner(null);
      setRoundWinner(null);
      setOnlineResult(null);
      setOpponentOnline(true);
      setBotThinking(false);
      setStatusBanner('');
      setOnlineSearching(false);
      setRoomCode('');
      setJoinCodeInput('');
      setOnlineError('');
      applySnapshot(state);
      setScreen('game');
      sfx.play(resumed ? 'click' : 'win');
    });

    socket.on('match_state', ({ state, notice }) => {
      if (!onlineRef.current.active) return;
      sfx.play(state.walls.length !== wallsCountRef.current ? 'wall' : 'move');
      applySnapshot(state);
      if (notice?.type === 'timeout') {
        setStatusBanner(I18N[langRef.current].turnSkipped);
        setTimeout(() => setStatusBanner(''), 2200);
      }
    });

    socket.on('opponent_status', ({ connected }) => setOpponentOnline(!!connected));

    socket.on('action_error', ({ state }) => {
      setAwaitingServer(false);
      sfx.play('error');
      if (state && onlineRef.current.active) applySnapshot(state);
    });

    socket.on('match_end', ({ you, winner, reason, state, rewards, user, saved }) => {
      if (user) applyUser(user);
      if (!onlineRef.current.active) return;
      onlineRef.current.active = false;
      applySnapshot(state);
      setRoundWinner(winner);
      setMatchWinner(winner);
      setRoundScore({ P1: winner === 'P1' ? 1 : 0, P2: winner === 'P2' ? 1 : 0 });
      setOnlineResult({ reason, rewards, saved });
      sfx.play(winner === you ? 'win' : 'error');
    });

    // На сервере нет активного матча (например, он закончился, пока мы были офлайн)
    socket.on('no_match', async () => {
      if (!onlineRef.current.active) return;
      onlineRef.current.active = false;
      const opp = onlineRef.current.side === 'P1' ? 'P2' : 'P1';
      setRoundWinner(opp);
      setMatchWinner(opp);
      setOnlineResult({ reason: 'disconnect', rewards: null, saved: false });
      sfx.play('error');
      const r = await apiRequest('/api/me');
      if (r.ok) applyUser(r.data.user);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      setSocketConnected(false);
    };
  }, [isLoggedIn]);

  // Ссылка-приглашение вида ?room=ABCDE
  useEffect(() => {
    if (!pendingRoom || !isLoggedIn || !socketConnected) return;
    const code = pendingRoom;
    setPendingRoom('');
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {
      /* не критично */
    }
    setScreen('online_lobby');
    socketRef.current?.emit('room_join', { code });
  }, [pendingRoom, isLoggedIn, socketConnected]);

  // Рейтинг загружается из базы при открытии экрана
  useEffect(() => {
    if (screen !== 'leaderboard') return undefined;
    let cancelled = false;
    setLbLoading(true);
    setLbError(false);
    apiRequest('/api/leaderboard').then((r) => {
      if (cancelled) return;
      setLbLoading(false);
      if (r.ok) setLbRows(r.data.rows || []);
      else setLbError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [screen]);

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
  const authErrorText = (code) =>
    ({
      USER_EXISTS: t.errUserExists,
      BAD_CREDENTIALS: t.errWrongCreds,
      INVALID_USERNAME: t.errBadChars,
      INVALID_PASSWORD: t.errShortPass,
      TOO_MANY_ATTEMPTS: t.errTooMany,
      NETWORK: t.errNetwork
    }[code] || t.errServer);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authBusy) return;
    setAuthError('');
    const cleanUser = authUser.trim();

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
    if (authMode === 'register' && authPass !== authPass2) {
      setAuthError(t.errPassMatch);
      sfx.play('error');
      return;
    }

    setAuthBusy(true);
    const r = await apiRequest(authMode === 'register' ? '/api/register' : '/api/login', {
      method: 'POST',
      body: { username: cleanUser, password: authPass }
    });
    setAuthBusy(false);

    if (!r.ok) {
      setAuthError(authErrorText(r.error));
      sfx.play('error');
      return;
    }
    setToken(r.data.token);
    applyUser(r.data.user);
    setReplaced(false);
    setAuthModalOpen(false);
    setAuthUser('');
    setAuthPass('');
    setAuthPass2('');
    setScreen('menu');
    sfx.play(authMode === 'register' ? 'win' : 'click');
  };

  const handleLogout = () => {
    if (onlineRef.current.active) {
      socketRef.current?.emit('resign');
      onlineRef.current.active = false;
    }
    setToken('');
    setCurrentUser(null);
    setScreen('menu');
    setAuthMode('login');
    setAuthError('');
    setAuthModalOpen(false);
    sfx.play('click');
  };

  const handleAvatarChange = async (av) => {
    sfx.play('click');
    setEditAvatar(av);
    const r = await apiRequest('/api/profile/avatar', { method: 'POST', body: { avatar: av } });
    if (r.ok) applyUser(r.data.user);
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
    setBotThinking(false);
    setAwaitingServer(false);
  };

  // Матч с ботом (онлайн-матчи запускает сервер — см. событие match_start)
  const startNewMatch = () => {
    sfx.play('click');
    onlineRef.current.active = false;
    setGameMode('bot');
    setOnlineOpponent(null);
    setOnlineResult(null);
    setPlayerSide(botSide);
    setTotalRounds(botRounds);
    setRoundScore({ P1: 0, P2: 0 });
    setCurrentRound(1);
    setMatchWinner(null);
    resetRoundBoard();
    setScreen('game');
  };

  // Таймер хода. В онлайне время присылает сервер, здесь только плавный отсчёт для показа.
  useEffect(() => {
    if (screen !== 'game' || matchWinner || roundWinner) return undefined;
    const interval = setInterval(() => setTurnTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [screen, matchWinner, roundWinner, turn]);

  // Матч с ботом: если игрок не успел походить — ход переходит боту
  useEffect(() => {
    if (gameMode !== 'bot' || screen !== 'game' || matchWinner || roundWinner) return;
    if (turnTimer > 0 || turn !== playerSide) return;
    setStatusBanner(t.turnSkipped);
    setTimeout(() => setStatusBanner(''), 2200);
    setTurn(playerSide === 'P1' ? 'P2' : 'P1');
    setTurnTimer(30);
  }, [turnTimer]);

  // Результат матча с ботом уходит на сервер: монеты, опыт и статистика сохраняются в базе
  const reportBotResult = async (result) => {
    const r = await apiRequest('/api/match/bot-result', { method: 'POST', body: { result, difficulty: botDiff } });
    if (r.ok) applyUser(r.data.user);
    else await apiRequest('/api/me').then((me) => me.ok && applyUser(me.data.user));
  };

  // Конец раунда / матча с ботом
  const concludeRound = (winnerSide) => {
    setRoundWinner(winnerSide);
    const nextScore = { ...roundScore, [winnerSide]: roundScore[winnerSide] + 1 };
    setRoundScore(nextScore);

    const winsNeeded = Math.ceil(totalRounds / 2);
    const isPlayerWin = winnerSide === playerSide;
    sfx.play(isPlayerWin ? 'win' : 'error');

    if (nextScore[winnerSide] >= winsNeeded) {
      setMatchWinner(winnerSide);
      reportBotResult(isPlayerWin ? 'win' : 'loss');
    }
  };

  // Ход бота: человекоподобная пауза, затем решение движка (src/botEngine.js)
  useEffect(() => {
    if (gameMode !== 'bot' || screen !== 'game' || matchWinner || roundWinner) return undefined;
    const botSideNow = playerSide === 'P1' ? 'P2' : 'P1';
    if (turn !== botSideNow) return undefined;

    setBotThinking(true);
    const delay = 650 + Math.random() * 950;
    const timer = setTimeout(() => {
      const botWalls = botSideNow === 'P1' ? p1WallsLeft : p2WallsLeft;
      const botPos = botSideNow === 'P1' ? p1Pos : p2Pos;
      const oppPosNow = botSideNow === 'P1' ? p2Pos : p1Pos;
      const goalRow = botSideNow === 'P1' ? 0 : BOARD_SIZE - 1;
      const legalMoves = getValidMoves(botPos, oppPosNow, walls);

      let action = null;
      try {
        action = chooseBotAction(botDiff, botSideNow, p1Pos, p2Pos, walls, p1WallsLeft, p2WallsLeft);
      } catch (err) {
        console.error('Bot error:', err);
      }
      // Страховка: движок не должен выдавать нелегальные ходы, но если вдруг — идём кратчайшим путём
      const valid =
        action &&
        (action.type === 'wall'
          ? botWalls > 0 && canPlaceWall({ r: action.r, c: action.c, o: action.o }, walls, p1Pos, p2Pos)
          : legalMoves.some((m) => m.r === action.r && m.c === action.c));
      if (!valid) {
        const best = legalMoves
          .map((m) => ({ ...m, d: m.r === goalRow ? -1 : shortestPathLength(m, goalRow, walls) }))
          .sort((a, b) => a.d - b.d)[0];
        action = best ? { type: 'move', r: best.r, c: best.c } : null;
      }

      if (action?.type === 'move') {
        if (botSideNow === 'P1') setP1Pos({ r: action.r, c: action.c });
        else setP2Pos({ r: action.r, c: action.c });
        sfx.play('move');
        if (action.r === goalRow) {
          setBotThinking(false);
          concludeRound(botSideNow);
          return;
        }
      } else if (action?.type === 'wall') {
        setWalls((prev) => [...prev, { r: action.r, c: action.c, o: action.o }]);
        if (botSideNow === 'P1') setP1WallsLeft((w) => w - 1);
        else setP2WallsLeft((w) => w - 1);
        sfx.play('wall');
      }

      setBotThinking(false);
      setTurn(playerSide);
      setTurnTimer(30);
    }, delay);

    return () => {
      clearTimeout(timer);
      setBotThinking(false);
    };
  }, [turn, screen, matchWinner, roundWinner, playerSide, gameMode, botDiff, p1Pos, p2Pos, walls, p1WallsLeft, p2WallsLeft]);

  // ==========================================================================
  // PLAYER MOVES & WALL PLACEMENT (Click + Press-and-Hold Drag)
  // ==========================================================================
  const isPlayerTurn =
    screen === 'game' && !matchWinner && !roundWinner && turn === playerSide && !botThinking && !awaitingServer;
  // В онлайне игрок всегда видит свою фишку внизу: для стороны P2 доска повёрнута на 180°
  const flipBoard = gameMode === 'online' && playerSide === 'P2';

  // Отправка действия на сервер (онлайн): состояние обновится, когда сервер подтвердит ход
  const sendOnline = (event, payload) => {
    const sock = socketRef.current;
    if (!sock || !sock.connected) {
      sfx.play('error');
      setStatusBanner(t.serverOffline);
      setTimeout(() => setStatusBanner(''), 2200);
      return;
    }
    setAwaitingServer(true);
    sock.emit(event, payload);
    setTimeout(() => setAwaitingServer(false), 4000);
  };
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

    if (gameMode === 'online') {
      setSelectedOrientation(null);
      setHoverWall(null);
      sendOnline('move', { r, c });
      return;
    }

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

    if (gameMode === 'online') {
      setSelectedOrientation(null);
      setHoverWall(null);
      sendOnline('wall', { r, c, o });
      return true;
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
    let relX = clientX - rect.left;
    let relY = clientY - rect.top;
    if (flipBoard) {
      relX = rect.width - relX;
      relY = rect.height - relY;
    }

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
  // ONLINE MATCHMAKING (настоящий: через сервер Socket.IO)
  // ==========================================================================
  const startOnlineSearch = () => {
    sfx.play('click');
    setOnlineError('');
    const sock = socketRef.current;
    if (!sock || !sock.connected) {
      setOnlineError('OFFLINE');
      sfx.play('error');
      return;
    }
    setOnlineSearching(true);
    setScreen('online_lobby');
    sock.emit('queue_join');
  };

  const cancelOnlineWaiting = () => {
    const sock = socketRef.current;
    if (sock) {
      sock.emit('queue_leave');
      sock.emit('room_cancel');
    }
    setOnlineSearching(false);
    setRoomCode('');
  };

  const createPrivateRoom = () => {
    sfx.play('click');
    setOnlineError('');
    const sock = socketRef.current;
    if (!sock || !sock.connected) {
      setOnlineError('OFFLINE');
      return;
    }
    sock.emit('room_create');
  };

  const joinPrivateRoom = () => {
    const code = joinCodeInput.trim();
    if (code.length < 4) return;
    sfx.play('click');
    setOnlineError('');
    const sock = socketRef.current;
    if (!sock || !sock.connected) {
      setOnlineError('OFFLINE');
      return;
    }
    sock.emit('room_join', { code });
  };

  // Переход между экранами: из онлайн-матча — только с подтверждением (это сдача),
  // из лобби — отменяем поиск соперника
  const navigate = (target) => {
    if (screen === 'game' && gameMode === 'online' && onlineRef.current.active && target !== 'game') {
      if (!window.confirm(t.resignConfirm)) return;
      onlineRef.current.active = false;
      socketRef.current?.emit('resign');
    }
    if (screen === 'online_lobby' && target !== 'online_lobby') cancelOnlineWaiting();
    sfx.play('click');
    setPreviewLoadout(null);
    setScreen(target);
  };

  // ==========================================================================
  // SHOP & INVENTORY HELPERS (покупки и экипировка сохраняются в базе)
  // ==========================================================================
  const flashShopMsg = (msg) => {
    setShopMsg(msg);
    setTimeout(() => setShopMsg(''), 2500);
  };

  const handleBuyOrEquip = async (category, item) => {
    if (!currentUser || shopBusy) return;
    const owned = currentUser.ownedSkins.includes(item.id);
    if (!owned && currentUser.coins < item.price) {
      sfx.play('error');
      flashShopMsg(t.notEnoughCoins);
      return;
    }
    setShopBusy(true);
    const r = await apiRequest(owned ? '/api/shop/equip' : '/api/shop/buy', {
      method: 'POST',
      body: { category, itemId: item.id }
    });
    setShopBusy(false);
    if (r.ok) {
      applyUser(r.data.user);
      sfx.play(owned ? 'click' : 'win');
      setPreviewLoadout(null);
    } else {
      sfx.play('error');
      if (r.data?.user) applyUser(r.data.user);
      flashShopMsg(r.error === 'NOT_ENOUGH_COINS' ? t.notEnoughCoins : r.error === 'NETWORK' ? t.errNetwork : t.errServer);
    }
  };

  const claimDaily = async () => {
    if (dailyBusy) return;
    setDailyBusy(true);
    const r = await apiRequest('/api/daily/claim', { method: 'POST', body: { date: localDateStr() } });
    setDailyBusy(false);
    if (r.ok) {
      applyUser(r.data.user);
      sfx.play('win');
    } else {
      sfx.play('error');
      if (r.data?.user) applyUser(r.data.user);
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
      <div className="w-full max-w-[440px] mx-auto" style={!isPreview && flipBoard ? { transform: 'rotate(180deg)' } : undefined}>
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
            onClick={() => navigate('menu')}
            className="p-2 rounded-xl bg-[#22211D] hover:bg-[#2c2b26] border border-white/10 text-[#F4F1E8] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => navigate('menu')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogoMark />
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
    if (!authReady) return null;

    // Уже вошли: карточка аккаунта с кнопкой «Выйти»
    if (currentUser) {
      if (!authModalOpen) return null;
      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#22211D] border border-white/10 p-6 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-[#AAA69A] hover:text-white text-sm font-bold"
            >
              ✕
            </button>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#171714] border border-[#55C879]/40 flex items-center justify-center text-3xl">
              {currentUser.avatar}
            </div>
            <div>
              <div className="text-xs text-[#AAA69A]">{t.loggedInAs}</div>
              <div className="text-xl font-black text-[#F4F1E8]">{currentUser.username}</div>
              <div className="text-xs text-[#55C879] font-bold mt-0.5">
                ELO {currentUser.elo} • LVL {currentUser.level}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] hover:text-red-300 font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>
      );
    }

    // Не вошли: форма входа / регистрации (закрыть нельзя — аккаунт нужен для игры)
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#22211D] border border-white/10 p-6 shadow-2xl relative">
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
                autoComplete="username"
                autoCapitalize="none"
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
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
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
                  autoComplete="new-password"
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
              disabled={authBusy}
              className="w-full py-3 rounded-xl bg-[#55C879] hover:bg-[#47b569] disabled:opacity-60 text-[#171714] font-black text-sm tracking-wide transition shadow-[0_0_20px_rgba(85,200,121,0.3)]"
            >
              {authBusy ? '…' : authMode === 'login' ? t.login : t.register}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-white/10 text-xs">
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
              onClick={() => startNewMatch()}
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

        {/* Opponent disconnected (online) */}
        {gameMode === 'online' && !opponentOnline && !matchWinner && (
          <div className="w-full max-w-[440px] px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-bold text-center animate-pulse">
            {t.oppDisconnected}
          </div>
        )}

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

        {/* Resign (online) */}
        {gameMode === 'online' && !matchWinner && (
          <button
            onClick={() => navigate('menu')}
            className="px-4 py-2 rounded-xl bg-[#22211D] border border-white/10 text-xs font-bold text-[#AAA69A] hover:text-red-300 transition"
          >
            {t.resign}
          </button>
        )}

        {/* Round / Match Result Overlay */}
        {(roundWinner || matchWinner) && (() => {
          const iWon = (matchWinner || roundWinner) === playerSide;
          const accent = iWon ? effectSkin.color : '#E9C56B';
          const reasonKey = {
            resign: iWon ? 'reasonResignWin' : 'reasonResignLose',
            timeout: iWon ? 'reasonTimeoutWin' : 'reasonTimeoutLose',
            disconnect: iWon ? 'reasonDisconnectWin' : 'reasonDisconnectLose'
          }[onlineResult?.reason];
          const rewards = onlineResult?.rewards;
          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-3xl bg-[#22211D] border border-white/15 p-6 text-center space-y-4 shadow-2xl">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border"
                  style={{ backgroundColor: `${accent}20`, borderColor: `${accent}66`, boxShadow: iWon ? `0 0 28px ${accent}55` : 'none' }}
                >
                  <Crown className="w-8 h-8" style={{ color: accent }} />
                </div>

                <h3 className="text-2xl font-black text-[#F4F1E8]">
                  {matchWinner ? (iWon ? t.victory : t.defeat) : iWon ? t.roundWin : t.roundLoss}
                </h3>

                {matchWinner && gameMode === 'bot' && (
                  <div className="flex items-center justify-center gap-4 text-sm font-bold">
                    <span className="text-[#E9C56B]">
                      +{iWon ? BOT_WIN_COINS[botDiff] : BOT_LOSS_COINS} COINS
                    </span>
                  </div>
                )}

                {matchWinner && gameMode === 'online' && (
                  <div className="space-y-1.5">
                    {reasonKey && <div className="text-xs text-[#AAA69A]">{t[reasonKey]}</div>}
                    {rewards && (
                      <div className="flex items-center justify-center gap-4 text-sm font-bold">
                        {rewards.coins > 0 && <span className="text-[#E9C56B]">+{rewards.coins} COINS</span>}
                        <span className={rewards.eloDelta >= 0 ? 'text-[#55C879]' : 'text-red-400'}>
                          {rewards.eloDelta >= 0 ? '+' : ''}
                          {rewards.eloDelta} ELO
                        </span>
                      </div>
                    )}
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
                      onClick={() => (gameMode === 'online' ? startOnlineSearch() : startNewMatch())}
                      className="w-full py-3 rounded-xl bg-[#55C879] text-[#171714] font-black text-sm"
                    >
                      {t.playAgain}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('menu')}
                    className="w-full py-3 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] font-bold text-sm"
                  >
                    {t.toMenu}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
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
                onClick={() => setBotSide(s.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border ${
                  botSide === s.id
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
                onClick={() => setBotRounds(cnt)}
                className={`py-2.5 rounded-xl text-xs font-black border ${
                  botRounds === cnt
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
        onClick={() => startNewMatch()}
        className="w-full py-4 rounded-2xl bg-[#55C879] hover:bg-[#49b86c] text-[#171714] font-black text-base shadow-[0_0_24px_rgba(85,200,121,0.35)] transition"
      >
        {t.startMatch}
      </button>
    </div>
  );

  // ==========================================================================
  // ONLINE MATCHMAKING LOBBY SCREEN
  // ==========================================================================
  const renderOnlineLobby = () => {
    const errText = {
      NOT_FOUND: t.roomNotFound,
      SELF: t.roomSelf,
      BUSY: t.roomBusy,
      OFFLINE: t.serverOffline,
      SERVER: t.errServer
    }[onlineError];

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-black text-[#F4F1E8]">{t.onlineMatch}</h2>

        {!socketConnected && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-bold animate-pulse">
            {t.serverOffline}
          </div>
        )}
        {errText && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errText}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-[#22211D] border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#55C879]/15 flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#55C879]" />
            </div>
            <h3 className="text-lg font-black text-[#F4F1E8]">{t.quickMatch}</h3>
            <p className="text-xs text-[#AAA69A]">
              {lang === 'ru'
                ? 'Нажмите «Начать» — игра стартует, как только второй игрок тоже нажмёт поиск. Соперник подбирается по рейтингу ELO.'
                : 'Press start — the game begins as soon as a second player presses search too. Opponents are matched by ELO.'}
            </p>

            {onlineSearching ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#171714] border border-[#55C879]/40 text-center">
                  <div className="text-sm font-black text-[#55C879] animate-pulse">{t.searching}</div>
                  <div className="text-[11px] text-[#AAA69A] mt-1">{t.searchingHint}</div>
                </div>
                <button
                  onClick={() => {
                    sfx.play('click');
                    cancelOnlineWaiting();
                  }}
                  className="w-full py-3 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] font-bold text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            ) : (
              <button
                onClick={startOnlineSearch}
                disabled={!socketConnected}
                className="w-full py-3.5 rounded-xl bg-[#55C879] disabled:opacity-50 text-[#171714] font-black text-sm flex items-center justify-center gap-2"
              >
                {t.quickMatch}
              </button>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#22211D] border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9C56B]/15 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#E9C56B]" />
            </div>
            <h3 className="text-lg font-black text-[#F4F1E8]">{t.createRoom}</h3>

            {!roomCode ? (
              <button
                onClick={createPrivateRoom}
                disabled={!socketConnected || onlineSearching}
                className="w-full py-3 rounded-xl bg-[#E9C56B] disabled:opacity-50 text-[#171714] font-black text-sm"
              >
                {t.createRoom}
              </button>
            ) : (
              <div className="space-y-2">
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
                <div className="text-[11px] text-[#E9C56B] animate-pulse text-center">{t.waitingFriend}</div>
                <button
                  onClick={() => {
                    sfx.play('click');
                    cancelOnlineWaiting();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#171714] border border-white/10 text-[#F4F1E8] font-bold text-xs"
                >
                  {t.cancel}
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinPrivateRoom()}
                placeholder={t.roomCode}
                maxLength={8}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-xs font-mono text-[#F4F1E8]"
              />
              <button
                onClick={joinPrivateRoom}
                disabled={!socketConnected || joinCodeInput.trim().length < 4}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-xs font-extrabold text-[#F4F1E8]"
              >
                {t.joinRoom}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

          {shopMsg && (
            <div className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold text-center">
              {shopMsg}
            </div>
          )}

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
                    disabled={equipped || shopBusy}
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
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-xs font-bold text-[#E9C56B] hover:text-red-300 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t.logout}
          </button>
        </div>

        {/* Avatar Picker */}
        <div className="p-5 rounded-2xl bg-[#22211D] border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase text-[#AAA69A]">Avatar</div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => handleAvatarChange(av)}
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
  const renderLeaderboard = () => (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-5">
      <h2 className="text-2xl font-black text-[#F4F1E8]">{t.leaderboard}</h2>

      {lbLoading && lbRows.length === 0 && <div className="text-sm text-[#AAA69A]">{t.lbLoading}</div>}
      {lbError && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold">
          {t.loadFailed}
        </div>
      )}
      {!lbLoading && !lbError && lbRows.length === 0 && <div className="text-sm text-[#AAA69A]">{t.lbEmpty}</div>}

      <div className="space-y-2.5">
        {lbRows.map((r, i) => {
          const isMe = r.username.toLowerCase() === currentUser?.username.toLowerCase();
          return (
            <div
              key={r.username}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isMe ? 'bg-[#55C879]/10 border-[#55C879]/50' : 'bg-[#22211D] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 font-black text-sm text-[#E9C56B]">#{i + 1}</span>
                <span className="text-2xl">{r.avatar}</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#F4F1E8] truncate">{r.username}</div>
                  <div className="text-[11px] text-[#AAA69A]">
                    LVL {r.level} • {r.wins} {t.wins}
                  </div>
                </div>
              </div>
              <div className="font-black text-sm text-[#55C879]">ELO {r.elo}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDaily = () => {
    const today = localDateStr();
    const yesterday = localDateStr(-1);
    const last = currentUser?.lastClaimDate || '';
    const claimedToday = last === today;
    const streak = currentUser?.dailyStreak || 0;
    // Какая из 4 карточек сейчас «активная» (её можно забрать или она уже забрана сегодня)
    const activeDay = claimedToday ? ((streak - 1) % 4) + 1 : last === yesterday ? (streak % 4) + 1 : 1;

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#F4F1E8]">{t.daily}</h2>
          {streak > 0 && (
            <span className="text-xs font-bold text-[#E9C56B] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {t.dailyStreak}: {streak}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DAILY_REWARDS.map((reward, idx) => {
            const day = idx + 1;
            const done = day < activeDay || (day === activeDay && claimedToday);
            const current = day === activeDay;
            return (
              <div
                key={day}
                className={`p-4 rounded-2xl border text-center space-y-2 ${
                  current && !claimedToday ? 'bg-[#55C879]/10 border-[#55C879]/50' : 'bg-[#22211D] border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-[#AAA69A]">
                  {t.day} {day}
                </div>
                <Coins className="w-7 h-7 text-[#E9C56B] mx-auto" />
                <div className="font-black text-base text-[#E9C56B]">+{reward}</div>
                {done ? (
                  <div className="w-full py-2 rounded-xl bg-white/10 text-[#55C879] text-xs font-black flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t.claimed}
                  </div>
                ) : current ? (
                  <button
                    disabled={dailyBusy}
                    onClick={claimDaily}
                    className="w-full py-2 rounded-xl bg-[#55C879] disabled:opacity-60 text-[#171714] text-xs font-black"
                  >
                    {t.claim}
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-[#171714] text-[#AAA69A] text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 inline" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {claimedToday && <div className="text-xs text-[#AAA69A] text-center">{t.dailyDone}</div>}
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

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#171714] text-[#AAA69A] flex items-center justify-center text-sm font-bold tracking-widest">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171714] text-[#F4F1E8] flex flex-col">
      {renderTopBar()}
      {renderAuthModal()}

      {replaced && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#22211D] border border-white/10 p-6 text-center space-y-3">
            <h3 className="text-lg font-black text-[#F4F1E8]">{t.replacedTitle}</h3>
            <p className="text-xs text-[#AAA69A]">{t.replacedText}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-[#55C879] text-[#171714] font-black text-sm"
            >
              {t.reconnect}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {currentUser && screen === 'menu' && renderMainMenu()}
        {currentUser && screen === 'setup_bot' && renderBotSetup()}
        {currentUser && screen === 'online_lobby' && renderOnlineLobby()}
        {currentUser && screen === 'game' && renderGameScreen()}
        {currentUser && screen === 'shop' && renderShopOrInventory(false)}
        {currentUser && screen === 'inventory' && renderShopOrInventory(true)}
        {currentUser && screen === 'profile' && renderProfile()}
        {currentUser && screen === 'leaderboard' && renderLeaderboard()}
        {currentUser && screen === 'daily' && renderDaily()}
        {currentUser && screen === 'settings' && renderSettings()}
      </main>
    </div>
  );
}
