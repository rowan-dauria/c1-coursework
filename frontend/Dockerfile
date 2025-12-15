# Use Node.js LTS version as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Set environment variables
#! change to production for production
ENV NODE_ENV=development

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port 3000 (default Next.js port)
EXPOSE 3000

# Health check configuration
# Checks if the Next.js server is responding to HTTP requests
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Command to run the Next.js development server
CMD ["npm", "run", "dev"] #! change to start for production