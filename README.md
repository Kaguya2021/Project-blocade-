# BLOCADE — Full Tactical Board Strategy Game

## Структура проекта
- `src/App.jsx` — клиент (React): меню, игра с ботом, онлайн-матчи, магазин скинов, награды, рейтинг, вход/регистрация.
- `src/botEngine.js` — движок бота (alpha-beta поиск, 5 уровней сложности).
- `server/index.js` — Node.js + Express + Socket.IO: аккаунты, магазин, награды, рейтинг (Neon PostgreSQL), подбор соперника и онлайн-матчи.
- `server/game.js` — правила игры, цены скинов, формулы ELO (проверка ходов делает сервер).

## Переменные окружения сервера
| Переменная     | Обязательна | Описание |
|----------------|-------------|----------|
| `DATABASE_URL` | да          | Строка подключения Neon PostgreSQL |
| `AUTH_SECRET`  | нет         | Секрет подписи токенов входа (если не задан — вычисляется из `DATABASE_URL`) |
| `PORT`         | нет         | Порт сервера (по умолчанию 3001) |

Для фронтенда, если он лежит отдельно от сервера: `VITE_SERVER_URL=https://адрес-сервера` (при сборке).

Таблица `blocade_users` создаётся и обновляется сервером автоматически при запуске
(старые аккаунты сохраняются, старые пароли автоматически переводятся на безопасный хеш при первом входе).

## Запуск для разработки
```bash
# терминал 1 — сервер
cd server
npm install
DATABASE_URL="postgres://..." npm start      # Windows PowerShell: $env:DATABASE_URL="postgres://..."; npm start

# терминал 2 — фронтенд
npm install
npm run dev                                   # http://localhost:5173 (запросы идут на сервер :3001 через прокси)
```

## Продакшен (один сервис отдаёт и сайт, и API)
```bash
npm install && npm run build          # собирает фронтенд в dist/
cd server && npm install
DATABASE_URL="postgres://..." node index.js
```
