FROM node:20.19.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .nvmrc ./

# Copy Prisma schema BEFORE installing (needed for postinstall script)
COPY prisma ./prisma

# Install dependencies (this will run postinstall -> prisma generate)
RUN npm install

# Copy rest of application code
COPY . .

# Expose port
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
