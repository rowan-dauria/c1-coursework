# Use Python 3.12 as base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# todo add a data directory?

# Set environment variables
# PYTHONUNBUFFERED=1 Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Copy requirements file
COPY backend/requirements.txt .

# Copy package to /opt (outside /app) so it persists despite volume mounts
COPY fiveD_NN_package/ /opt/fiveD_NN_package/

# Install Python dependencies
# todo: install fivedreg from pypi before adding to gitlab repo
# todo: remove SETUPTOOLS env var and python installing fivedreg from editable source
# Set version for setuptools-scm since .git directory is not available in Docker build
ENV SETUPTOOLS_SCM_PRETEND_VERSION_FOR_FIVEDREG=0.0.4.dev5
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r requirements.txt && \
    python -m pip install --no-cache-dir -e /opt/fiveD_NN_package

# Copy application code
COPY backend/main.py .

# Specify which port the application will run on
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

