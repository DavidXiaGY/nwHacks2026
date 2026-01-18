#!/bin/sh
# Force resolve the failed migration by cleaning up the migration state

echo "Force resolving failed migration..."

# Try to mark as applied first (since objects exist)
echo "Attempting to mark as applied..."
npx prisma migrate resolve --applied 20260118012341_add_password_field

# Wait a moment
sleep 1

# Now try to deploy
echo "Running migrations..."
npx prisma migrate deploy

# If that still fails, try rolled-back approach
if [ $? -ne 0 ]; then
  echo "Still failing, trying rolled-back approach..."
  npx prisma migrate resolve --rolled-back 20260118012341_add_password_field
  sleep 1
  npx prisma migrate deploy
fi
