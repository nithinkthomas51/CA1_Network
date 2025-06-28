# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy entire project (client and server)
COPY . .

# Expose the backend port
EXPOSE 3000

# Start the backend
CMD ["node", "server/index.js"]
