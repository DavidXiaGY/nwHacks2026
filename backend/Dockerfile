FROM node:20.19.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .nvmrc ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
