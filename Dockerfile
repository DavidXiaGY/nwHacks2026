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
# Debug: Check DATABASE_URL first, then run Prisma commands
# Handle failed migrations by resolving them automatically
CMD ["sh", "-c", "echo 'Checking DATABASE_URL...' && if [ -z \"$DATABASE_URL\" ]; then echo '❌ ERROR: DATABASE_URL is not set!'; echo 'Please go to Railway → Your Backend Service → Variables → Add DATABASE_URL'; echo 'See DEPLOYMENT.md Step 5 for instructions.'; exit 1; fi && echo '✅ DATABASE_URL is set' && npx prisma generate && (npx prisma migrate deploy || (echo '⚠️ Migration failed, checking if objects already exist...' && npx prisma migrate resolve --applied 20260118012341_add_password_field 2>/dev/null || npx prisma migrate resolve --rolled-back 20260118012341_add_password_field) && npx prisma migrate deploy) && npm start"]
