import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В разработке фронтенд (порт 5173) обращается к серверу BLOCADE (порт 3001) через прокси,
// поэтому и API, и онлайн-игра (Socket.IO) работают без дополнительной настройки.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true }
    }
  }
});
