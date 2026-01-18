# How to Set DATABASE_URL in Railway

## ⚠️ CRITICAL: This must be done or your backend will not work!

## Method 1: Link PostgreSQL Service (Easiest - Recommended)

1. **In Railway Dashboard:**
   - Go to your **backend service** (click on it, not the Postgres service)
   - Click on the **"Variables"** tab
   - Click **"New Variable"** or **"Add Variable"** button

2. **Link the Database:**
   - Look for a button/option that says **"Reference"**, **"Link Service"**, or **"Connect Service"**
   - OR look for a dropdown that shows your PostgreSQL service
   - Select your **PostgreSQL service** from the list
   - Railway will automatically create `DATABASE_URL` with the connection string
   - Click **"Add"** or **"Save"**

3. **Verify:**
   - You should now see `DATABASE_URL` in your variables list
   - It should show as a reference/link to your PostgreSQL service

## Method 2: Manual Copy-Paste

1. **Get the Connection String:**
   - Go to your **PostgreSQL service** in Railway
   - Click on the **"Variables"** tab
   - Find `DATABASE_URL` in the list
   - Click on it to reveal the value (it's a long connection string)
   - Copy the entire value

2. **Add to Backend Service:**
   - Go to your **backend service** in Railway
   - Click on the **"Variables"** tab
   - Click **"New Variable"**
   - Name: `DATABASE_URL`
   - Value: Paste the connection string you copied
   - Click **"Add"**

3. **Verify:**
   - You should see `DATABASE_URL` in your backend service variables
   - The value should start with `postgresql://`

## Method 3: Railway CLI (Advanced)

If you have Railway CLI installed:

```bash
railway variables set DATABASE_URL=$(railway variables get DATABASE_URL --service <postgres-service-id>)
```

## Troubleshooting

**Can't find "Reference" option?**
- Make sure both services are in the same Railway project
- Try Method 2 (manual copy-paste) instead

**Still getting errors?**
- Make sure you're adding the variable to the **backend service**, not the Postgres service
- Check that the variable name is exactly `DATABASE_URL` (case-sensitive)
- After adding, Railway should automatically redeploy - check the deploy logs

**How to verify it's set:**
- Go to backend service → Variables tab
- You should see `DATABASE_URL` in the list
- If it shows as a reference, that's perfect!
- If it shows the full connection string, that's also fine

## After Setting DATABASE_URL

Railway will automatically redeploy your service. Check the deploy logs - you should see:
- ✅ `DATABASE_URL is set`
- ✅ Prisma migrations running successfully
- ✅ Server starting

If you still see errors, check the deploy logs for the exact error message.
