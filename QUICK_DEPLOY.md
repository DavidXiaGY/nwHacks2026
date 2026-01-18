# Quick Deployment Checklist

## 🚀 Fastest Way to Deploy

### Option 1: Railway + Vercel (Recommended - ~10 minutes)

1. **Backend (Railway)**:
   - Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
   - Add PostgreSQL database (Railway auto-creates `DATABASE_URL`)
   - Set Root Directory: `backend`
   - Add environment variables:
     - `JWT_SECRET` (generate: `openssl rand -base64 32`)
     - `FRONTEND_URL` (you'll add this after frontend deploys)
   - Railway auto-deploys!

2. **Frontend (Vercel)**:
   - Go to [vercel.com](https://vercel.com) → Add New Project → Import GitHub repo
   - Set Root Directory: `frontend`
   - Add environment variable:
     - `VITE_API_URL` = your Railway backend URL
   - Deploy!

3. **Update Backend**:
   - Add `FRONTEND_URL` = your Vercel URL in Railway
   - Done! ✅

### Option 2: Everything on Railway (~5 minutes)

1. **Railway Project**:
   - Deploy backend (same as above)
   - Add new service for frontend:
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Start Command: `npx serve -s dist -p $PORT`
   - Set `FRONTEND_URL` to your Railway frontend URL

## 📋 Environment Variables Checklist

### Railway (Backend)
- ✅ `DATABASE_URL` (auto-set)
- ✅ `JWT_SECRET`
- ✅ `FRONTEND_URL`
- ✅ `NODE_ENV=production`

### Vercel (Frontend)
- ✅ `VITE_API_URL`

## 🔧 Common Issues

**CORS Errors?**
- Make sure `FRONTEND_URL` in Railway matches your frontend URL exactly

**API Calls Failing?**
- Check `VITE_API_URL` in Vercel matches your Railway backend URL
- Make sure it includes `https://` and no trailing slash

**Database Errors?**
- Run migrations: Railway shell → `cd backend && npx prisma migrate deploy`

## 🎯 One-Command Deploy (After Setup)

Both platforms auto-deploy on git push! Just:
```bash
git push origin main
```
