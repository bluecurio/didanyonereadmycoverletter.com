FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (Amplify will map this automatically)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
