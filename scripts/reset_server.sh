#!/bin/bash
echo "Killing processes on port 3000..."
lsof -t -i:3000 | xargs kill -9
echo "Restarting Dev Server..."
rm -rf .next
npm run dev
