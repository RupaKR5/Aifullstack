FROM python:3.12-slim

# Environment
ENV PYTHONUNBUFFERED=1 \
		PYTHONDONTWRITEBYTECODE=1 \
		PIP_NO_CACHE_DIR=1 \
		ENVIRONMENT=production \
		UVICORN_WORKERS=1

WORKDIR /app

# Create a non-root user for running the app
RUN addgroup --system app && adduser --system --ingroup app app

# Install dependencies first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and set ownership to the non-root user
COPY --chown=app:app . .

# Switch to non-root user
USER app

EXPOSE 8000

# Simple HTTP healthcheck using python
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD python -c "import sys,urllib.request as u; sys.exit(0 if u.urlopen('http://127.0.0.1:8000/').getcode()==200 else 1)"

# Start the app; allow overriding workers with `UVICORN_WORKERS` env var
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --no-access-log --workers ${UVICORN_WORKERS}"]
