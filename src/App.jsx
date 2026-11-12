// src/App.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  Play, Globe, Cpu, ShoppingBag, Backpack, User, Trophy, Settings,
  Shield, Coins, Crown, Sparkles, Copy, Check, ArrowLeft, Clock,
  Zap, Gift, Users, LogOut, Lock, Languages, Hand, AlertCircle
} from 'lucide-react';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
const socket = io(SOCKET_URL, { autoConnect: false });

const I18N = {
  ru: {
    brandSub: 'ТАКТИЧЕСКАЯ СТРАТЕГИЯ СЕТКИ',
    play: 'ИГРАТЬ', onlineMatch: 'ОНЛАЙН МАТЧ', playWithBot: 'ИГРА С БОТОМ',
    shop: 'МАГАЗИН', inventory: 'ИНВЕНТАРЬ', profile: 'ПРОФИЛЬ', leaderboard: 'РЕЙТИНГ',
    daily: 'НАГРАДЫ', settings: 'НАСТРОЙКИ', login: 'ВОЙТИ', register: 'РЕГИСТРАЦИЯ',
    logout: 'ВЫЙТИ', username: 'Логин', password: 'Пароль', confirmPassword: 'Повторите пароль',
    authTitleLogin: 'ВХОД В АККАУНТ', authTitleReg: 'СОЗДАНИЕ АККАУНТА',
    authSub: 'Личная база данных: прогресс, скины, монеты и ELO сохраняются за вашим логином.',
    switchToReg: 'Нет аккаунта? Зарегистрироваться', switchToLogin: 'Уже есть аккаунт? Войти',
    yourTurn: 'ВАШ ХОД', oppTurn: 'ХОД СОПЕРНИКА', botThinking: 'БОТ ДУМАЕТ...',
    wallsLeft: 'Стен', round: 'Раунд', dragWallHint: 'Удерживайте и перетащите блок на линию сетки или нажмите',
    horizontalWall: 'ГОРИЗОНТАЛЬНАЯ', verticalWall: 'ВЕРТИКАЛЬНАЯ', blockedPathAlert: 'Нельзя полностью перекрыть путь к финишу!',
    victory: 'ПОБЕДА В МАТЧЕ!', defeat: 'ПОРАЖЕНИЕ В МАТЧЕ', quickMatch: 'БЫСТРЫЙ ПОИСК',
    searching: 'Поиск реального соперника...', difficulty: 'Сложность бота', startMatch: 'НАЧАТЬ БОЙ',
    buy: 'КУПИТЬ', equip: 'НАДЕТЬ', equipped: 'НАДЕТО', livePreview: 'ПРЕДПРОСМОТР ДОСКИ'
  },
  en: {
    brandSub: 'TACTICAL GRID STRATEGY',
    play: 'PLAY', onlineMatch: 'ONLINE MATCH', playWithBot: 'PLAY WITH BOT',
    shop: 'SHOP', inventory: 'INVENTORY', profile: 'PROFILE', leaderboard: 'LEADERBOARD',
    daily: 'DAILY REWARDS', settings: 'SETTINGS', login: 'LOGIN', register: 'REGISTER',
    logout: 'LOGOUT', username: 'Username', password: 'Password', confirmPassword: 'Confirm Password',
    authTitleLogin: 'ACCOUNT LOGIN', authTitleReg: 'CREATE ACCOUNT',
    authSub: 'Personal database: coins, skins, inventory & ELO are saved to your username.',
    switchToReg: 'No account? Register now', switchToLogin: 'Already have an account? Login',
    yourTurn: 'YOUR TURN', oppTurn: 'OPPONENT TURN', botThinking: 'BOT THINKING...',
    wallsLeft: 'Walls', round: 'Round', dragWallHint: 'Press & hold a wall block to drag or tap to select',
    horizontalWall: 'HORIZONTAL', verticalWall: 'VERTICAL', blockedPathAlert: 'Cannot completely block all paths to the goal!',
    victory: 'MATCH VICTORY!', defeat: 'MATCH DEFEAT', quickMatch: 'QUICK MATCH',
    searching: 'Searching real opponent...', difficulty: 'Bot Difficulty', startMatch: 'START MATCH',
    buy: 'BUY', equip: 'EQUIP', equipped: 'EQUIPPED', livePreview: 'LIVE BOARD PREVIEW'
  }
};

class SoundFX {
  constructor() { this.enabled = true; this.ctx = null; }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }
  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      if (type === 'click') {
        osc.frequency.setValueAtTime(520, now); osc.frequency.exponentialRampToValueAtTime(760, now + 0.05);
        gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      } else if (type === 'move') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(280, now); osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);
        gain.gain.setValueAtTime(0.11, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      } else if (type === 'wall') {
        osc.type = 'square'; osc.frequency.setValueAtTime(165, now); osc.frequency.exponentialRampToValueAtTime(95, now + 0.13);
        gain.gain.setValueAtTime(0.11, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
          o.connect(g); g.connect(this.ctx.destination);
          o.frequency.setValueAtTime(freq, now + i * 0.08);
          g.gain.setValueAtTime(0.1, now + i * 0.08); g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.26);
        });
        return;
      }
      osc.start(now); osc.stop(now + 0.1);
    } catch (_) {}
  }
}
const sfx = new SoundFX();

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
  if (candidate.r < 0 || candidate.r >= BOARD_SIZE - 1 || candidate.c < 0 || candidate.c >= BOARD_SIZE - 1) return false;
  if (walls.some((w) => wallsConflict(w, candidate))) return false;
  const nextWalls = [...walls, candidate];
  return shortestPathLength(p1Pos, 0, nextWalls) !== Infinity && shortestPathLength(p2Pos, BOARD_SIZE - 1, nextWalls) !== Infinity;
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
          const sr = nr + ddr; const sc = nc + ddc;
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

// УМНЫЙ БОТ
function computeSmartBotAction(botSide, p1Pos, p2Pos, walls, botWallsLeft) {
  const botPos = botSide === 'P1' ? p1Pos : p2Pos;
  const oppPos = botSide === 'P1' ? p2Pos : p1Pos;
  const botGoal = botSide === 'P1' ? 0 : BOARD_SIZE - 1;
  const oppGoal = botSide === 'P1' ? BOARD_SIZE - 1 : 0;

  const validMoves = getValidMoves(botPos, oppPos, walls);
  if (validMoves.length === 0) return null;

  const winMove = validMoves.find((m) => m.r === botGoal);
  if (winMove) return { type: 'move', r: winMove.r, c: winMove.c };

  const curBotDist = shortestPathLength(botPos, botGoal, walls);
  const curOppDist = shortestPathLength(oppPos, oppGoal, walls);

  if (botWallsLeft > 0 && curOppDist <= curBotDist && Math.random() < 0.45) {
    let bestWall = null;
    let bestScore = -999;
    for (let r = Math.max(0, oppPos.r - 1); r <= Math.min(BOARD_SIZE - 2, oppPos.r); r++) {
      for (let c = Math.max(0, oppPos.c - 1); c <= Math.min(BOARD_SIZE - 2, oppPos.c); c++) {
        for (const o of ['H', 'V']) {
          const cand = { r, c, o };
          if (!canPlaceWall(cand, walls, p1Pos, p2Pos)) continue;
          const nextWalls = [...walls, cand];
          const newOppDist = shortestPathLength(oppPos, oppGoal, nextWalls);
          if (newOppDist > curOppDist) {
            const score = newOppDist - curOppDist;
            if (score > bestScore) {
              bestScore = score;
              bestWall = cand;
            }
          }
        }
      }
    }
    if (bestWall) return { type: 'wall', ...bestWall };
  }

  const rankedMoves = validMoves.map((m) => ({ ...m, dist: shortestPathLength(m, botGoal, walls) })).sort((a, b) => a.dist - b.dist);
  return { type: 'move', r: rankedMoves[0].r, c: rankedMoves[0].c };
}

export default function App() {
  const [lang, setLang] = useState('ru');
  const t = I18N[lang];

  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');

  const [screen, setScreen] = useState('menu');
  const [gameMode, setGameMode] = useState('bot');
  const [playerSide, setPlayerSide] = useState('P1'); // Игрок всегда P1 (внизу, идет к ряду 0)

  // Исправлено: P1 всегда внизу (строка 8), бот/соперник P2 всегда вверху (строка 0)
  const [p1Pos, setP1Pos] = useState({ r: 8, c: 4 });
  const [p2Pos, setP2Pos] = useState({ r: 0, c: 4 });
  const [p1WallsLeft, setP1WallsLeft] = useState(INITIAL_WALLS);
  const [p2WallsLeft, setP2WallsLeft] = useState(INITIAL_WALLS);
  const [walls, setWalls] = useState([]);
  const [turn, setTurn] = useState('P1');
  const [botThinking, setBotThinking] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null);
  const [onlineRoomCode, setOnlineRoomCode] = useState(null);

  const [selectedOrientation, setSelectedOrientation] = useState(null);

  useEffect(() => {
    socket.connect();
    socket.on('match_started', ({ room }) => {
      setGameMode('online');
      setOnlineRoomCode(room.code);
      setP1Pos(room.p1.pos);
      setP2Pos(room.p2.pos);
      setWalls(room.walls || []);
      setTurn(room.turn);
      setScreen('game');
    });

    socket.on('state_updated', (data) => {
      setP1Pos(data.p1Pos);
      setP2Pos(data.p2Pos);
      setWalls(data.walls);
      setTurn(data.turn);
      setP1WallsLeft(data.p1Walls);
      setP2WallsLeft(data.p2Walls);
    });

    return () => socket.disconnect();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${SOCKET_URL}/api/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUser, password: authPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      sfx.play('win');
    } catch (err) {
      setAuthError(err.message);
      sfx.play('error');
    }
  };

  const startBotMatch = () => {
    sfx.play('click');
    setGameMode('bot');
    setPlayerSide('P1');
    setP1Pos({ r: 8, c: 4 }); // Ваша фишка внизу
    setP2Pos({ r: 0, c: 4 }); // Бот вверху
    setP1WallsLeft(INITIAL_WALLS);
    setP2WallsLeft(INITIAL_WALLS);
    setWalls([]);
    setTurn('P1');
    setMatchWinner(null);
    setScreen('game');
  };

  const startQuickMatch = () => {
    sfx.play('click');
    socket.emit('quick_match', { user: currentUser });
  };

  const isPlayerTurn = screen === 'game' && !matchWinner && (gameMode === 'bot' ? turn === 'P1' && !botThinking : true);
  const myPos = p1Pos;
  const oppPos = p2Pos;
  const myWalls = p1WallsLeft;

  const validMoveTargets = useMemo(() => {
    if (!isPlayerTurn) return [];
    return getValidMoves(myPos, oppPos, walls);
  }, [isPlayerTurn, myPos, oppPos, walls]);

  const handleCellClick = (r, c) => {
    if (!isPlayerTurn || !validMoveTargets.some((m) => m.r === r && m.c === c)) return;

    const newP1 = { r, c };
    const nextTurn = 'P2';
    sfx.play('move');

    if (gameMode === 'online') {
      socket.emit('make_move', { code: onlineRoomCode, p1Pos: newP1, p2Pos, walls, turn: nextTurn, p1Walls: p1WallsLeft, p2Walls: p2WallsLeft });
    } else {
      setP1Pos(newP1);
      setTurn(nextTurn);
      if (r === 0) setMatchWinner('P1'); // Победа, если дошли до ряда 0 (верх)
    }
  };

  // Bot execution effect (Бот играет за P2)
  useEffect(() => {
    if (gameMode !== 'bot' || screen !== 'game' || matchWinner) return;
    if (turn !== 'P2') return;

    setBotThinking(true);
    const timer = setTimeout(() => {
      const action = computeSmartBotAction('P2', p1Pos, p2Pos, walls, p2WallsLeft);

      if (action) {
        if (action.type === 'move') {
          setP2Pos({ r: action.r, c: action.c });
          sfx.play('move');
          if (action.r === BOARD_SIZE - 1) setMatchWinner('P2'); // Бот дошел до низа
        } else if (action.type === 'wall') {
          setWalls((prev) => [...prev, { r: action.r, c: action.c, o: action.o }]);
          setP2WallsLeft((w) => w - 1);
          sfx.play('wall');
        }
      }
      setBotThinking(false);
      setTurn('P1');
    }, 600);

    return () => clearTimeout(timer);
  }, [turn, screen, gameMode, p1Pos, p2Pos, walls]);

  return (
    <div className="min-h-screen bg-[#171714] text-[#F4F1E8] flex flex-col">
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#22211D] border border-white/10 p-6 shadow-2xl">
            <h2 className="text-lg font-black text-[#F4F1E8] mb-1">
              {authMode === 'login' ? t.authTitleLogin : t.authTitleReg}
            </h2>
            <p className="text-xs text-[#AAA69A] mb-4">{t.authSub}</p>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <input
                type="text"
                placeholder={t.username}
                value={authUser}
                onChange={(e) => setAuthUser(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-sm text-white"
              />
              <input
                type="password"
                placeholder={t.password}
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171714] border border-white/10 text-sm text-white"
              />
              {authError && <div className="text-red-400 text-xs">{authError}</div>}
              <button type="submit" className="w-full py-3 rounded-xl bg-[#55C879] text-[#171714] font-black text-sm">
                {authMode === 'login' ? t.login : t.register}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="mt-3 text-xs text-[#E9C56B]"
            >
              {authMode === 'login' ? t.switchToReg : t.switchToLogin}
            </button>
          </div>
        </div>
      )}

      <header className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#55C879] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#171714]" />
          </div>
          <span className="font-black text-xl">BLOCADE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-[#22211D] border border-[#E9C56B]/30 flex items-center gap-1">
            <Coins className="w-4 h-4 text-[#E9C56B]" />
            <span className="text-sm font-bold text-[#E9C56B]">{currentUser?.coins ?? 1250}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {screen === 'menu' && (
          <div className="space-y-4 text-center max-w-sm w-full">
            <button
              onClick={startBotMatch}
              className="w-full py-4 rounded-2xl bg-[#55C879] text-[#171714] font-black text-base shadow-lg"
            >
              {t.play} (vs AI)
            </button>
            <button
              onClick={startQuickMatch}
              className="w-full py-4 rounded-2xl bg-[#22211D] border border-[#E9C56B]/40 text-[#E9C56B] font-extrabold text-base"
            >
              {t.onlineMatch}
            </button>
          </div>
        )}

        {screen === 'game' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm font-bold text-[#55C879]">
              {matchWinner ? `Победитель: ${matchWinner === 'P1' ? 'Игрок' : 'Соперник'}` : isPlayerTurn ? t.yourTurn : t.botThinking}
            </div>

            <div className="relative aspect-square w-full max-w-[400px] bg-[#2A251D] p-3 rounded-2xl shadow-2xl">
              <div className="relative w-full h-full grid grid-cols-9 grid-rows-9 gap-1.5 bg-[#191713] p-1 rounded-xl">
                {Array.from({ length: 81 }).map((_, idx) => {
                  const r = Math.floor(idx / 9);
                  const c = idx % 9;
                  const isValid = validMoveTargets.some((m) => m.r === r && m.c === c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`relative rounded flex items-center justify-center ${isValid ? 'ring-2 ring-[#55C879] cursor-pointer bg-[#55C879]/20' : 'bg-[#363026]'}`}
                    >
                      {/* P1 (Ваша фишка) всегда зеленая внизу */}
                      {p1Pos.r === r && p1Pos.c === c && (
                        <div className="w-3/4 h-3/4 rounded-full bg-[#55C879] shadow-[0_0_12px_#55C879]" />
                      )}
                      {/* P2 (Бот/Соперник) всегда оранжевая вверху */}
                      {p2Pos.r === r && p2Pos.c === c && (
                        <div className="w-3/4 h-3/4 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedOrientation('H')}
                className="px-4 py-2 rounded-xl bg-[#22211D] border border-white/10 text-xs font-bold"
              >
                {t.horizontalWall} ({myWalls})
              </button>
              <button
                onClick={() => setSelectedOrientation('V')}
                className="px-4 py-2 rounded-xl bg-[#22211D] border border-white/10 text-xs font-bold"
              >
                {t.verticalWall} ({myWalls})
              </button>
            </div>

            <button
              onClick={() => setScreen('menu')}
              className="mt-2 px-6 py-2 rounded-xl bg-white/10 text-xs font-bold"
            >
              В меню
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
