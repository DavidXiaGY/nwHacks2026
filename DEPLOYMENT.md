# Deployment Guide

This guide will help you deploy your full-stack application using **Railway** (backend + database) and **Vercel** (frontend).

## Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Deploy Backend to Railway

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Railway**:
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**:
   - In your Railway project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` environment variable

4. **Configure Backend Service**:
   - Railway should auto-detect your backend folder
   - If not, click "+ New" → "GitHub Repo" → select your repo
   - Set the **Root Directory** to `backend`
   - Railway will auto-detect Node.js and run `npm install` and `npm start`

5. **Set Environment Variables** (CRITICAL STEP):
   
   **⚠️ DATABASE_URL MUST be set or migrations will fail!**
   
   Go to your backend service → "Variables" tab
   
   **Option A: Link PostgreSQL Service (Recommended - Automatic)**
   - Click "New Variable" or "Add Variable"
   - Look for a "Reference" or "Link Service" option
   - Select your PostgreSQL service from the dropdown
   - Railway will automatically create `DATABASE_URL` with the correct connection string
   - This is the easiest method!
   
   **Option B: Manual Setup**
   - Go to your PostgreSQL service → "Variables" tab
   - Find and copy the `DATABASE_URL` value (it's a long connection string)
   - Go back to your backend service → "Variables" tab
   - Click "New Variable"
   - Name: `DATABASE_URL`
   - Value: Paste the connection string you copied
   - Click "Add"
   
   **Add Other Required Variables:**
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32` (or use any random string)
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` - You'll add this after frontend deploys (e.g., `https://your-app.vercel.app`)
   - `PORT` - Railway sets this automatically, don't override it
   
   **Verify DATABASE_URL is Set:**
   - After adding, you should see `DATABASE_URL` in your backend service variables list
   - It should look like: `postgresql://user:password@host:port/database`

6. **Run Database Migrations**:
   
   **✅ Automatic (Recommended):** Migrations are already configured to run automatically! The `railway.json` and `nixpacks.toml` files include migration commands in the start script, so migrations will run automatically on each deployment. No manual action needed!
   
   **Manual Option (if needed):** If you need to run migrations manually:
   - Go to your **backend application service** (NOT the Postgres database service)
   - Click on the service name in your Railway project
   - Go to "Deployments" tab → Click on the latest deployment
   - Click "View Logs" → Look for the three dots (⋯) menu → "Open Shell"
   - Run:
     ```bash
     npx prisma migrate deploy
     ```
   - Note: The shell option is only available for application services, not database services

7. **Get Your Backend URL** (after successful deployment):
   
   **⚠️ Important:** Your backend must be successfully deployed first! If you see "Build failed" on your service, fix that first (see Troubleshooting below).
   
   **To find the URL:**
   - On the Railway dashboard, **click on your backend service card** (the one with your project name, e.g., "nwHacks2026" - NOT the Postgres service)
   - This will take you to the service details page
   - Click on the **"Settings"** tab
   - Scroll down to the **"Networking"** or **"Domains"** section
   - You'll see a **"Public Domain"** field or a **"Generate Domain"** button
   - If no domain is shown, click **"Generate Domain"** to create one
   - Copy the URL (it will look like: `https://your-app-name.up.railway.app`)
   - **Important:** Make sure to copy the full URL including `https://` - you'll need this for the frontend's `VITE_API_URL` environment variable
   
   **Alternative:** The URL might also be visible on the service's main page under "Public Domain" or in the "Variables" tab as `RAILWAY_PUBLIC_DOMAIN`

## Step 2: Deploy Frontend to Netlify

1. **Go to Netlify**:
   - Visit [netlify.com](https://netlify.com)
   - Sign up or log in
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository

2. **Configure Build Settings**:
   - Netlify should auto-detect the settings from `netlify.toml`
   - If not, manually set:
     - **Base directory**: `frontend`
     - **Build command**: `npm install && npm run build`
     - **Publish directory**: `frontend/dist`

3. **Set Environment Variables** (CRITICAL - Without this, API calls will fail!):
   - Go to "Site configuration" → "Environment variables"
   - Click "Add variable"
   - **Name:** `VITE_API_URL`
   - **Value:** Your Railway backend URL (e.g., `https://your-app.up.railway.app`)
   - **Important:** 
     - ✅ Must include `https://`
     - ✅ NO trailing slash (don't end with `/`)
     - ✅ Should look like: `https://your-backend-name.up.railway.app`
   - Click "Save"
   - **After adding, you MUST redeploy** for the variable to take effect:
     - Go to "Deploys" tab
     - Click "Trigger deploy" → "Deploy site"

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your frontend
   - You'll get a URL like: `https://your-app-name.netlify.app`
   - You can also set a custom domain in "Domain settings"

## Alternative: Deploy Frontend to Vercel

If you prefer Vercel instead:

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Frontend**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   - Go to "Settings" → "Environment Variables"
   - Add: `VITE_API_URL` = your Railway backend URL (e.g., `https://your-app.up.railway.app`)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like: `https://your-app.vercel.app`

## Step 3: Update CORS in Backend

The backend CORS is already configured! You just need to:
1. In Railway, go to your backend service → "Variables"
2. Add: `FRONTEND_URL` = your frontend URL:
   - If using Netlify: `https://your-app-name.netlify.app`
   - If using Vercel: `https://your-app.vercel.app`
3. Railway will automatically redeploy when you add the variable

## Step 4: Update Frontend API Calls

The frontend is already configured to use `VITE_API_URL` environment variable. Make sure:
- All API calls use the `VITE_API_URL` variable (see `frontend/src/config.js`)
- The hardcoded `localhost:3000` in `InteractiveMap.jsx` has been updated

## Quick Deploy Commands

### Railway (Backend)
- Railway auto-deploys on git push
- To manually redeploy: Railway dashboard → Service → "Redeploy"

### Netlify (Frontend)
- Netlify auto-deploys on git push
- To manually redeploy: Netlify dashboard → Site → "Deploys" → "Trigger deploy"

### Vercel (Frontend - Alternative)
- Vercel auto-deploys on git push
- To manually redeploy: Vercel dashboard → Project → "Redeploy"

## Troubleshooting

### Backend Issues
- **Database connection errors**: Check `DATABASE_URL` is set correctly
- **Migration errors**: Run `npx prisma migrate deploy` in Railway shell
- **Port errors**: Railway sets `PORT` automatically, don't override it
- **Node.js version errors**: The project requires Node.js 20.19+ (configured via `.nvmrc` and `package.json` engines). Railway should auto-detect this, but if issues persist, check Railway service settings.

### Frontend Issues
- **API calls failing**: Check `VITE_API_URL` is set correctly in Netlify/Vercel environment variables
- **CORS errors**: Make sure `FRONTEND_URL` is set in Railway and CORS is configured
- **Build errors**: Check Netlify/Vercel build logs for missing dependencies
- **404 errors on routes**: Make sure `netlify.toml` has the SPA redirect rule (already configured)

## Alternative: Deploy Everything to Railway

If you prefer one platform:
1. Deploy backend to Railway (same as above)
2. Deploy frontend as a static site on Railway:
   - Add a new service
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Start Command: `npx serve -s dist -p $PORT`

## Environment Variables Summary

### Backend (Railway)
- `DATABASE_URL` (auto-set by Railway)
- `JWT_SECRET` (generate with: `openssl rand -base64 32`)
- `FRONTEND_URL` (your Vercel URL)
- `NODE_ENV=production`

### Frontend (Netlify or Vercel)
- `VITE_API_URL` (your Railway backend URL, e.g., `https://your-app.up.railway.app`)
