FROM node:20.19.0-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
COPY backend/.nvmrc ./backend/

# Copy Prisma schema and config
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/

# Install dependencies (postinstall removed - prisma generate runs at runtime)
WORKDIR /app/backend
RUN npm install

# Copy rest of application code
COPY backend/ .

# Expose port
EXPOSE 3000

# Generate Prisma Client and run migrations, then start
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]
