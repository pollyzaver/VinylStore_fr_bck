#!/bin/bash
echo "Останавливаю предыдущий процесс на порту 3002 (если есть)..."
lsof -ti:3002 | xargs kill -9 2>/dev/null
sleep 1
cd "$(dirname "$0")/backend" || exit 1
export PORT=3002
echo "Запускаю backend на порту 3002..."
node app.js
