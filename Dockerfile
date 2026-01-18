FROM node:20.19.0-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
COPY backend/.nvmrc ./backend/

# Copy Prisma schema BEFORE installing (needed for postinstall script)
COPY backend/prisma ./backend/prisma

# Install dependencies (this will run postinstall -> prisma generate)
WORKDIR /app/backend
RUN npm install

# Copy rest of application code
COPY backend/ .

# Expose port
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
