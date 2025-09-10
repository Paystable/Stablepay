# Simple build for Google Cloud Run
FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]