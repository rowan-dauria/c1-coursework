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

# Command to run the Next.js development server
CMD ["npm", "run", "dev"] #! change to start for production