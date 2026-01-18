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
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]
