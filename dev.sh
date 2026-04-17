#!/bin/bash

# Starts the Spark backend in development mode.
# Uvicorn will automatically reload on any .py, .html, or .css changes.
# Templates and static assets are mounted via docker-compose.dev.yml volumes,
# so HTML/CSS edits are reflected immediately without a rebuild.

echo "--------------------------------------------------------"
echo "✨ Starting Spark Dev Stack"
echo "--------------------------------------------------------"
echo "🚀 [Backend] http://localhost:8000"
echo ""

cd backend && uv run uvicorn main:app --reload --reload-include "*.json" --port 8000
