FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/app/.venv/bin/:$PATH"

# Copy backend files first
COPY backend/pyproject.toml backend/uv.lock ./
COPY backend/src/ ./src/

# Install dependencies using uv sync (creates venv and installs packages)
RUN uv sync --frozen --no-cache

# Copy config files
COPY backend/.env ./.env

# Set Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
