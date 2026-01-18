#!/bin/sh
# Script to resolve failed migrations in production

echo "Checking for failed migrations..."

# Resolve the failed migration by marking it as rolled back
# This allows Prisma to retry the migration
npx prisma migrate resolve --rolled-back 20260118012341_add_password_field

echo "Failed migration resolved. Retrying migrations..."
npx prisma migrate deploy
