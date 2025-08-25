FROM node:18-alpine

WORKDIR /app

# Install dependencies separately to optimize Docker caching
COPY package*.json ./
RUN npm install

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose ports
EXPOSE 3000

# Start the application
CMD ["npm", "start"]