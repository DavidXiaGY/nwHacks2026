FROM node:20.19.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .nvmrc ./

# Copy Prisma schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies (postinstall removed - prisma generate runs at runtime)
RUN npm install

# Copy rest of application code
COPY . .

# Expose port
EXPOSE 3000

# Generate Prisma Client and run migrations, then start
# Debug: Check DATABASE_URL first, then run Prisma commands
# Handle failed migrations by resolving them automatically
CMD ["sh", "-c", "echo 'Checking DATABASE_URL...' && if [ -z \"$DATABASE_URL\" ]; then echo '❌ ERROR: DATABASE_URL is not set!'; echo 'Please go to Railway → Your Backend Service → Variables → Add DATABASE_URL'; echo 'See DEPLOYMENT.md Step 5 for instructions.'; exit 1; fi && echo '✅ DATABASE_URL is set' && npx prisma generate && (npx prisma migrate deploy || (echo 'Migration failed, attempting to resolve...' && npx prisma migrate resolve --rolled-back 20260118012341_add_password_field && npx prisma migrate deploy)) && npm start"]
