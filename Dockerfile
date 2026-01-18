FROM node:20.19.0-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
COPY backend/.nvmrc ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm install

# Copy Prisma schema
COPY backend/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
