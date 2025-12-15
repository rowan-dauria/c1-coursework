# Base stage
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Copy requirements and package
COPY backend/requirements.txt .

# Install dependencies
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r requirements.txt

# Development stage
FROM base AS development
COPY backend/main.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base AS production
# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 --no-create-home appuser

COPY backend/main.py .

# Change ownership of the app directory
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
