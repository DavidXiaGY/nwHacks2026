# Fix: API Calls Going to Netlify Instead of Railway Backend

## The Problem

When you try to login or make API calls, you're getting a 404 from Netlify. This means:
- Your frontend is trying to call `/api/auth/login` 
- But `VITE_API_URL` is not set in Netlify
- So it defaults to `/api` (relative URL)
- Which goes to Netlify (your frontend host) instead of Railway (your backend)

## The Solution

You need to set `VITE_API_URL` in Netlify to point to your Railway backend.

### Step-by-Step Fix:

1. **Get Your Railway Backend URL:**
   - Go to Railway → Your backend service
   - Click "Settings" tab
   - Find "Public Domain" or "Generate Domain"
   - Copy the URL (e.g., `https://your-app.up.railway.app`)
   - Make sure it includes `https://` and has NO trailing slash

2. **Set Environment Variable in Netlify:**
   - Go to Netlify → Your site
   - Click "Site configuration" → "Environment variables"
   - Click "Add variable"
   - **Name:** `VITE_API_URL`
   - **Value:** Paste your Railway backend URL (e.g., `https://your-app.up.railway.app`)
   - Click "Save"

3. **Redeploy (IMPORTANT!):**
   - After adding the variable, you MUST redeploy
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for the build to complete

4. **Verify It Works:**
   - After redeploy, try logging in again
   - Check browser console (F12) → Network tab
   - API calls should now go to your Railway URL, not Netlify

## How to Verify

1. **Check the built code:**
   - After redeploy, open your site
   - Open browser console (F12)
   - Type: `console.log(import.meta.env.VITE_API_URL)`
   - It should show your Railway backend URL

2. **Check Network Requests:**
   - Open browser DevTools → Network tab
   - Try to login
   - The API call should go to: `https://your-railway-url.up.railway.app/api/auth/login`
   - NOT to: `https://your-netlify-url.netlify.app/api/auth/login`

## Common Mistakes

❌ **Wrong:** `https://your-app.up.railway.app/` (trailing slash)
✅ **Correct:** `https://your-app.up.railway.app`

❌ **Wrong:** `your-app.up.railway.app` (missing https://)
✅ **Correct:** `https://your-app.up.railway.app`

❌ **Wrong:** Variable name is `API_URL` instead of `VITE_API_URL`
✅ **Correct:** Must be `VITE_API_URL` (Vite requires the `VITE_` prefix)

## After Fixing

Once `VITE_API_URL` is set correctly:
- ✅ Login will work
- ✅ API calls will go to Railway backend
- ✅ All features will work properly

## Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check Railway backend is running:**
   - Go to Railway → Your backend service
   - Check it shows "Online" or "Deployment successful"
   - Test the backend directly: `https://your-railway-url.up.railway.app/api/health`
3. **Check CORS settings:**
   - Make sure `FRONTEND_URL` in Railway is set to your Netlify URL
   - Format: `https://your-netlify-site.netlify.app`
