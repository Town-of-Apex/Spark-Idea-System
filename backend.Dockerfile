# Use the official Python image
FROM python:3.13-slim

# Install uv
RUN pip install --no-cache-dir uv

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Copy backend source code
COPY backend/ ./backend/

# Set working directory to the backend folder so imports work correctly
WORKDIR /app/backend

# Add the virtualenv to path
ENV PATH="/app/.venv/bin:$PATH"

# Expose the API port
EXPOSE 8000

# Default command for production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
