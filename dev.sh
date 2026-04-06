#!/bin/bash

# This script starts both the backend and frontend in development mode.
# Both services will automatically reload when you save changes to your code.

# Clean up background processes when the script exits (including on Ctrl-C)
trap "kill 0" EXIT

echo "--------------------------------------------------------"
echo "✨ Starting Spark Idea System Dev Stack"
echo "--------------------------------------------------------"

# 1. Start Backend (FastAPI)
# Note: --reload is enabled so Python changes refresh the server automatically
echo "🚀 [Backend] starting on http://localhost:8000"
(cd backend && uv run uvicorn main:app --reload --port 8000) &

# 2. Start Frontend (Next.js)
# Note: 'next dev' has hot-reloading (HMR) built-in
echo "💻 [Frontend] starting on http://localhost:3000"
(cd frontend && npm run dev) &

# Keep the script running to stay attached to background processes
wait
