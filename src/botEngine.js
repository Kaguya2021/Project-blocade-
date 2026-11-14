// ============================================================================
// BLOCADE — движок бота.
//
// Бот считает ходы вперёд (alpha-beta, как в шахматах) и оценивает позицию по
// разнице путей до финиша. Поэтому стену он ставит ТОЛЬКО когда она реально
// выгодна: заметно удлиняет путь соперника и почти не мешает ему самому.
// Никакого «рандомного спама стенами» — каждая стена должна окупиться.
//
// Использование:
//   const action = chooseBotAction('HARD', 'P2', p1Pos, p2Pos, walls, p1WallsLeft, p2WallsLeft);
//   // -> { type: 'move', r, c }  или  { type: 'wall', r, c, o }  или  null
//
// Система координат та же, что в игре: P1 стартует снизу (ряд 8) и идёт к ряду 0,
// P2 стартует сверху (ряд 0) и идёт к ряду 8. Стена {r,c,o}: o='H' — горизонтальная
// между рядами r и r+1 (занимает колонки c и c+1), o='V' — вертикальная между
// колонками c и c+1 (занимает ряды r и r+1).
// ============================================================================

const N = 9;
const GOAL = [0, N - 1]; // индекс 0 = P1, 1 = P2
const INF_DIST = 99;
const WIN = 100000;

// Веса оценки позиции
const W_DIST = 10; // цена одного шага в пути
const W_WALL = 14; // цена одной стены «в запасе»: стены не тратятся ради мелочей
const W_TEMPO = 5; // преимущество того, чей ход

const DR = [-1, 1, 0, 0];
const DC = [0, 0, -1, 1];

// ---------------------------------------------------------------------------
// Состояние поиска
// ---------------------------------------------------------------------------
function makeState(p1Pos, p2Pos, walls, p1Walls, p2Walls, turn) {
  const s = {
    hb: new Uint8Array(N * N), // hb[r*9+c] = 1: нельзя пройти между (r,c) и (r+1,c)
    vb: new Uint8Array(N * N), // vb[r*9+c] = 1: нельзя пройти между (r,c) и (r,c+1)
    hw: new Uint8Array((N - 1) * (N - 1)), // поставленные горизонтальные стены
    vw: new Uint8Array((N - 1) * (N - 1)), // поставленные вертикальные стены
    pr: [p1Pos.r, p2Pos.r],
    pc: [p1Pos.c, p2Pos.c],
    wl: [p1Walls, p2Walls],
    turn
  };
  for (const w of walls) setWall(s, w.o, w.r, w.c, 1);
  return s;
}

function setWall(s, o, r, c, v) {
  if (o === 'H') {
    s.hw[r * 8 + c] = v;
    s.hb[r * 9 + c] = v;
    s.hb[r * 9 + c + 1] = v;
  } else {
    s.vw[r * 8 + c] = v;
    s.vb[r * 9 + c] = v;
    s.vb[(r + 1) * 9 + c] = v;
  }
}

// Не пересекается ли стена с уже стоящими (без проверки путей)
function wallFits(s, o, r, c) {
  if (r < 0 || r > 7 || c < 0 || c > 7) return false;
  const i = r * 8 + c;
  if (o === 'H') {
    return !s.hw[i] && !(c > 0 && s.hw[i - 1]) && !(c < 7 && s.hw[i + 1]) && !s.vw[i];
  }
  return !s.vw[i] && !(r > 0 && s.vw[i - 8]) && !(r < 7 && s.vw[i + 8]) && !s.hw[i];
}

// Свободен ли шаг из (r,c) в направлении d (0 вверх, 1 вниз, 2 влево, 3 вправо)
function stepFree(s, r, c, d) {
  switch (d) {
    case 0:
      return r > 0 && !s.hb[(r - 1) * 9 + c];
    case 1:
      return r < 8 && !s.hb[r * 9 + c];
    case 2:
      return c > 0 && !s.vb[r * 9 + c - 1];
    default:
      return c < 8 && !s.vb[r * 9 + c];
  }
}

// ---------------------------------------------------------------------------
// BFS: длина кратчайшего пути до финишного ряда
// ---------------------------------------------------------------------------
const queueBuf = new Int16Array(N * N);
const distBuf = new Int8Array(N * N);
const seenBuf = new Uint32Array(N * N);
const parentBuf = new Int16Array(N * N);
let stamp = 0;

function bfs(s, sr, sc, goalRow, wantParents) {
  stamp++;
  let head = 0;
  let tail = 0;
  const start = sr * 9 + sc;
  queueBuf[tail++] = start;
  seenBuf[start] = stamp;
  distBuf[start] = 0;
  if (wantParents) parentBuf[start] = -1;
  const { hb, vb } = s;

  while (head < tail) {
    const cur = queueBuf[head++];
    const r = (cur / 9) | 0;
    const c = cur - r * 9;
    const d = distBuf[cur];
    if (r === goalRow) return wantParents ? cur : d;
    let n;
    if (r > 0 && !hb[cur - 9]) {
      n = cur - 9;
      if (seenBuf[n] !== stamp) {
        seenBuf[n] = stamp;
        distBuf[n] = d + 1;
        if (wantParents) parentBuf[n] = cur;
        queueBuf[tail++] = n;
      }
    }
    if (r < 8 && !hb[cur]) {
      n = cur + 9;
      if (seenBuf[n] !== stamp) {
        seenBuf[n] = stamp;
        distBuf[n] = d + 1;
        if (wantParents) parentBuf[n] = cur;
        queueBuf[tail++] = n;
      }
    }
    if (c > 0 && !vb[cur - 1]) {
      n = cur - 1;
      if (seenBuf[n] !== stamp) {
        seenBuf[n] = stamp;
        distBuf[n] = d + 1;
        if (wantParents) parentBuf[n] = cur;
        queueBuf[tail++] = n;
      }
    }
    if (c < 8 && !vb[cur]) {
      n = cur + 1;
      if (seenBuf[n] !== stamp) {
        seenBuf[n] = stamp;
        distBuf[n] = d + 1;
        if (wantParents) parentBuf[n] = cur;
        queueBuf[tail++] = n;
      }
    }
  }
  return wantParents ? -1 : INF_DIST;
}

const distOf = (s, side) => bfs(s, s.pr[side], s.pc[side], GOAL[side], false);

// Клетки кратчайшего пути игрока (от старта к финишу)
function shortestPathCells(s, side) {
  const end = bfs(s, s.pr[side], s.pc[side], GOAL[side], true);
  if (end < 0) return [];
  const cells = [];
  for (let cur = end; cur !== -1; cur = parentBuf[cur]) cells.push(cur);
  return cells.reverse();
}

// ---------------------------------------------------------------------------
// Генерация ходов
// ---------------------------------------------------------------------------
function pawnTargets(s, side) {
  const r = s.pr[side];
  const c = s.pc[side];
  const or = s.pr[1 - side];
  const oc = s.pc[1 - side];
  const out = [];
  for (let d = 0; d < 4; d++) {
    if (!stepFree(s, r, c, d)) continue;
    const nr = r + DR[d];
    const nc = c + DC[d];
    if (nr === or && nc === oc) {
      // перепрыгиваем фишку соперника; если за ней стена/край — прыгаем по диагонали
      if (stepFree(s, nr, nc, d)) {
        out.push([nr + DR[d], nc + DC[d]]);
      } else {
        const perp = d < 2 ? [2, 3] : [0, 1];
        for (const p of perp) {
          if (stepFree(s, nr, nc, p)) out.push([nr + DR[p], nc + DC[p]]);
        }
      }
    } else {
      out.push([nr, nc]);
    }
  }
  return out;
}

// Стены-кандидаты: только те, что пересекают кратчайший путь соперника и реально его удлиняют
function wallCandidates(s, side, limit) {
  if (s.wl[side] <= 0) return [];
  const opp = 1 - side;
  const path = shortestPathCells(s, opp);
  if (path.length < 2) return [];
  const baseOpp = path.length - 1;
  const baseMe = distOf(s, side);

  const seen = new Set();
  const raw = [];
  const consider = (o, r, c) => {
    if (r < 0 || r > 7 || c < 0 || c > 7) return;
    const key = (o === 'H' ? 0 : 1) * 64 + r * 8 + c;
    if (seen.has(key)) return;
    seen.add(key);
    raw.push([o, r, c]);
  };
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i];
    const b = path[i + 1];
    const ra = (a / 9) | 0;
    const ca = a - ra * 9;
    const rb = (b / 9) | 0;
    const cb = b - rb * 9;
    if (ca === cb) {
      const rmin = Math.min(ra, rb);
      consider('H', rmin, ca - 1);
      consider('H', rmin, ca);
    } else {
      const cmin = Math.min(ca, cb);
      consider('V', ra - 1, cmin);
      consider('V', ra, cmin);
    }
  }

  const result = [];
  for (const [o, r, c] of raw) {
    if (!wallFits(s, o, r, c)) continue;
    setWall(s, o, r, c, 1);
    const dOpp = distOf(s, opp);
    const dMe = distOf(s, side);
    setWall(s, o, r, c, 0);
    if (dOpp >= INF_DIST || dMe >= INF_DIST) continue; // нельзя полностью перекрывать путь
    const gain = dOpp - baseOpp;
    if (gain <= 0) continue;
    const loss = dMe - baseMe;
    // порядок: на сколько «шагов» стена улучшает разницу путей (минус небольшая цена за расход стены)
    result.push({ t: 1, o, r, c, gain, loss, order: (gain - loss) * W_DIST - W_WALL });
  }
  result.sort((a, b) => b.order - a.order);
  return limit ? result.slice(0, limit) : result;
}

function generateMoves(s, side, wallLimit) {
  const moves = [];
  const goal = GOAL[side];
  const pr0 = s.pr[side];
  const pc0 = s.pc[side];
  const curDist = distOf(s, side);
  for (const [r, c] of pawnTargets(s, side)) {
    let order;
    if (r === goal) {
      order = 1000;
    } else {
      s.pr[side] = r;
      s.pc[side] = c;
      order = (curDist - distOf(s, side)) * W_DIST; // шаг вперёд = +10, вбок = 0, назад = -10
      s.pr[side] = pr0;
      s.pc[side] = pc0;
    }
    moves.push({ t: 0, r, c, win: r === goal, order });
  }
  moves.sort((a, b) => b.order - a.order);
  if (moves.length && moves[0].win) return [moves[0]]; // выигрыш в один ход — других вариантов не нужно
  for (const w of wallCandidates(s, side, wallLimit)) moves.push(w);
  moves.sort((a, b) => b.order - a.order);
  return moves;
}

// ---------------------------------------------------------------------------
// Оценка и поиск
// ---------------------------------------------------------------------------
// Оценка позиции глазами игрока, чей сейчас ход (negamax)
function evaluate(s, side) {
  const dMe = distOf(s, side);
  const dOpp = distOf(s, 1 - side);
  return (dOpp - dMe) * W_DIST + (s.wl[side] - s.wl[1 - side]) * W_WALL + W_TEMPO;
}

function applyMove(s, side, mv) {
  if (mv.t === 0) {
    mv.pr = s.pr[side];
    mv.pc = s.pc[side];
    s.pr[side] = mv.r;
    s.pc[side] = mv.c;
  } else {
    setWall(s, mv.o, mv.r, mv.c, 1);
    s.wl[side] -= 1;
  }
  s.turn = 1 - side;
}

function undoMove(s, side, mv) {
  if (mv.t === 0) {
    s.pr[side] = mv.pr;
    s.pc[side] = mv.pc;
  } else {
    setWall(s, mv.o, mv.r, mv.c, 0);
    s.wl[side] += 1;
  }
  s.turn = side;
}

function negamax(s, depth, alpha, beta, ply, ctx) {
  ctx.nodes++;
  if ((ctx.nodes & 15) === 0 && Date.now() > ctx.deadline) ctx.timeUp = true;
  if (ctx.timeUp) return 0;

  const side = s.turn;
  if (depth === 0) return evaluate(s, side);

  const limit = ply === 0 ? ctx.wallLimit : Math.min(ctx.wallLimit, ctx.innerWallLimit);
  const moves = generateMoves(s, side, limit);
  if (moves.length === 0) return evaluate(s, side);

  if (ply === 0 && ctx.pv) {
    const idx = moves.findIndex((m) => m.t === ctx.pv.t && m.r === ctx.pv.r && m.c === ctx.pv.c && m.o === ctx.pv.o);
    if (idx > 0) moves.unshift(moves.splice(idx, 1)[0]);
  }

  let best = -Infinity;
  for (const mv of moves) {
    let score;
    if (mv.t === 0 && mv.win) {
      score = WIN - ply;
    } else {
      applyMove(s, side, mv);
      score = -negamax(s, depth - 1, -beta, -alpha, ply + 1, ctx);
      undoMove(s, side, mv);
    }
    if (ctx.timeUp) return 0;
    if (score > best) {
      best = score;
      if (ply === 0) ctx.best = mv;
    }
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

// Оценка каждого хода на корне (нужна слабым ботам, чтобы иногда выбирать не лучший ход)
function scoreRootMoves(s, side, depth, ctx) {
  const moves = generateMoves(s, side, ctx.wallLimit);
  const scored = [];
  for (const mv of moves) {
    let score;
    if (mv.t === 0 && mv.win) {
      score = WIN;
    } else {
      applyMove(s, side, mv);
      score = -negamax(s, depth - 1, -Infinity, Infinity, 1, ctx);
      undoMove(s, side, mv);
    }
    scored.push({ mv, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

const toAction = (mv) => (mv.t === 0 ? { type: 'move', r: mv.r, c: mv.c } : { type: 'wall', r: mv.r, c: mv.c, o: mv.o });

// ---------------------------------------------------------------------------
// Уровни сложности
// ---------------------------------------------------------------------------
const LEVELS = {
  // Простой бот: идёт к цели, иногда ошибается, стены ставит редко и только в критический момент
  EASY: { type: 'simple' },
  // Считает на 2 хода вперёд, но часто (~30%) выбирает не лучший ход
  NORMAL: { type: 'search', depth: 2, wallLimit: 3, innerWallLimit: 3, mistake: 0.3, timeMs: 400 },
  // 2 хода вперёд, почти без ошибок
  MEDIUM: { type: 'search', depth: 2, wallLimit: 8, innerWallLimit: 6, mistake: 0.05, timeMs: 500 },
  // 3 хода вперёд
  HARD: { type: 'search', depth: 3, wallLimit: 8, innerWallLimit: 5, mistake: 0, timeMs: 700 },
  // Углубляется, пока хватает времени (до 6 ходов вперёд)
  EXPERT: { type: 'search', depth: 6, wallLimit: 10, innerWallLimit: 5, mistake: 0, timeMs: 900, iterative: true }
};

function simpleBot(s, side, level, rng) {
  const targets = pawnTargets(s, side);
  if (targets.length === 0) return null;
  const goal = GOAL[side];
  const win = targets.find(([r]) => r === goal);
  if (win) return { type: 'move', r: win[0], c: win[1] };

  // «Ошибка новичка»: иногда идёт в случайную клетку (но не пятится без причины слишком часто)
  const pr0 = s.pr[side];
  const pc0 = s.pc[side];
  const ranked = targets
    .map(([r, c]) => {
      s.pr[side] = r;
      s.pc[side] = c;
      const d = distOf(s, side);
      s.pr[side] = pr0;
      s.pc[side] = pc0;
      return { r, c, d };
    })
    .sort((a, b) => a.d - b.d);

  // Если соперник вот-вот победит, новичок иногда (50%) пытается поставить стену
  const oppDist = distOf(s, 1 - side);
  if (s.wl[side] > 0 && oppDist <= 2 && rng() < 0.5) {
    const walls = wallCandidates(s, side, 3);
    if (walls.length && walls[0].gain >= 2) return toAction(walls[0]);
  }

  const pick = rng() < 0.7 ? ranked[0] : ranked[Math.floor(rng() * ranked.length)];
  return { type: 'move', r: pick.r, c: pick.c };
}

export function chooseBotAction(difficulty, botSide, p1Pos, p2Pos, walls, p1WallsLeft, p2WallsLeft, rng = Math.random) {
  const side = botSide === 'P1' ? 0 : 1;
  const s = makeState(p1Pos, p2Pos, walls, p1WallsLeft, p2WallsLeft, side);
  const level = LEVELS[difficulty] || LEVELS.MEDIUM;

  if (level.type === 'simple') return simpleBot(s, side, level, rng);

  const ctx = {
    nodes: 0,
    timeUp: false,
    // для фиксированной глубины результат не должен обрываться по времени — иначе ход будет случайным
    deadline: level.iterative ? Date.now() + level.timeMs : Infinity,
    wallLimit: level.wallLimit,
    innerWallLimit: level.innerWallLimit,
    best: null,
    pv: null
  };

  // Слабее EXPERT: фиксированная глубина, можем выбрать «неидеальный» ход
  if (!level.iterative) {
    if (level.mistake > 0) {
      const scored = scoreRootMoves(s, side, level.depth, ctx);
      if (scored.length === 0) return null;
      let pick = scored[0];
      if (scored.length > 1 && rng() < level.mistake) {
        // выбираем второй по качеству ход, но только если он не хуже чем на ~1 шаг пути
        if (scored[0].score - scored[1].score <= 14 && scored[1].score > -WIN / 2) pick = scored[1];
      }
      return toAction(pick.mv);
    }
    negamax(s, level.depth, -Infinity, Infinity, 0, ctx);
    return ctx.best ? toAction(ctx.best) : fallbackMove(s, side);
  }

  // EXPERT: итеративное углубление с ограничением по времени
  let bestMove = null;
  for (let depth = 1; depth <= level.depth; depth++) {
    ctx.best = null;
    const score = negamax(s, depth, -Infinity, Infinity, 0, ctx);
    if (ctx.timeUp) break;
    if (ctx.best) {
      bestMove = ctx.best;
      ctx.pv = bestMove;
    }
    if (Math.abs(score) > WIN / 2) break; // найден форсированный выигрыш/проигрыш
  }
  return bestMove ? toAction(bestMove) : fallbackMove(s, side);
}

function fallbackMove(s, side) {
  const targets = pawnTargets(s, side);
  if (targets.length === 0) return null;
  const [r, c] = targets[0];
  return { type: 'move', r, c };
}

export const BOT_LEVELS = Object.keys(LEVELS);
