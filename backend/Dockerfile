# Use Python 3.12 as base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# todo add a data directory?

# Set environment variables
# PYTHONUNBUFFERED=1 Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r requirements.txt && \
    python -m pip install --no-cache-dir --extra-index-url https://test.pypi.org/simple/ dummy-package-rd

# Copy application code
COPY . .

# Specify which port the application will run on
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

