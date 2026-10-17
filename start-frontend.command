#!/bin/bash
echo "Останавливаю предыдущий процесс на порту 3001 (если есть)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1
cd "$(dirname "$0")/frontend" || exit 1
export PORT=3001
export REACT_APP_API_URL=/api
export BROWSER=none
echo "Запускаю frontend на порту 3001 (проксирует /api на backend:3002)..."
npm start
