FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose port from environment variable
EXPOSE ${PORT}

# Start the application
CMD ["node", "build/index.js"]
