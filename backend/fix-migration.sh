#!/bin/sh
# Script to fix the failed migration issue
# This migration partially applied - objects exist but migration is marked as failed

echo "Attempting to resolve failed migration..."

# First, try to mark it as applied (since objects seem to exist)
echo "Trying to mark migration as applied..."
npx prisma migrate resolve --applied 20260118012341_add_password_field

# If that works, continue with remaining migrations
if [ $? -eq 0 ]; then
  echo "✅ Migration marked as applied. Running remaining migrations..."
  npx prisma migrate deploy
else
  echo "⚠️ Could not mark as applied. Trying rolled-back approach..."
  npx prisma migrate resolve --rolled-back 20260118012341_add_password_field
  echo "Retrying migrations..."
  npx prisma migrate deploy
fi
