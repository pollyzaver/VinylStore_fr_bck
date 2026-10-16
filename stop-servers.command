#!/bin/bash
echo "Останавливаю backend (порт 3002)..."
lsof -ti:3002 | xargs kill -9 2>/dev/null
echo "Останавливаю frontend (порт 3001)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1
echo "Готово. Проверка:"
lsof -i:3001 -i:3002 || echo "Порты 3001 и 3002 свободны."
sleep 3
