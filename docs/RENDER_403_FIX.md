# Render 403 "Access Denied" Diagnostic Guide

## Problem
Your Render backend at `https://lumina-finance-api-dev.onrender.com` returns **HTTP 403 "Access denied"** before requests reach your application.

This is a **Render platform-level block**, not your code.

---

## ✅ Checklist: Things to Check in Render Dashboard

### 1. Service Status
Open: https://dashboard.render.com/ → Find: `lumina-finance-api-dev`

**Check the status badge at the top:**

- ❌ **"Suspended"**: Free tier services auto-suspend. Click "Resume Service"
- ❌ **"Failed"**: Deployment failed. Click on service → "Logs" to see error
- ❌ **"Build Failed"**: Click "Manual Deploy" → "Clear build cache & deploy"
- ✅ **"Live"**: Service is running (but might have other issues)

**If status is NOT "Live":**
1. Click the service name
2. Look for a "Resume" or "Deploy" button
3. Wait 2-3 minutes for it to start

---

### 2. Check for Payment/Billing Issues

**Free Tier Limitations:**
- Render free tier can be suspended if you hit limits
- Check: Dashboard → Account Settings → Billing
- Look for any warnings or required actions

**Common free tier issues:**
- Too many free services
- Bandwidth exceeded
- Build minutes exceeded

---

### 3. IP Allowlist (Unlikely but check)

**Navigate to:** Your service → Settings → scroll down

**Look for:**
- "IP Allowlist"
- "Network Security"
- "Firewall Rules"
- "Access Control"

**If found:**
- Disable it for testing, OR
- Add `0.0.0.0/0` to allow all IPs (development only)

---

### 4. Service Authentication/Authorization

**Check if there's:**
- HTTP Basic Auth enabled on the service
- API keys required at Render level
- Private service (not publicly accessible)

**To fix:**
- Go to: Service → Settings
- Look for "Authentication" or "Private Service" toggle
- Make sure it's set to "Public" or authentication is disabled

---

### 5. Check Service Logs

**This is the most important!**

1. Go to: Service → **Logs** tab
2. Look at the most recent logs
3. **What to look for:**

**If you see:**
```
🚀 Server running on port 5000
📍 Environment: production
```
✅ Your app is running! The 403 is from Render, not your app.

**If you see:**
```
Error: Missing required environment variable
Error: Cannot connect to database
```
❌ Your app isn't starting. Need to fix environment variables.

**If you see nothing or old logs:**
❌ Service isn't actually running. Need to deploy.

---

### 6. Environment Variables

**Go to:** Service → Environment

**Required variables (check all are set):**
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://dyfuxvfdhlccxmjhcemh.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...  (your key)
SUPABASE_SERVICE_KEY=eyJhbGci...  (your key)
JWT_SECRET=any_random_string_at_least_32_characters_long
FRONTEND_URL=*
```

**CRITICAL:** After adding/changing environment variables:
1. Click "Save Changes"
2. Service will auto-redeploy (wait 3-5 minutes)
3. Check logs to ensure it starts successfully

---

### 7. Service Region & Settings

**Check:** Service → Settings

**Important settings:**
- **Start Command**: Should be `npm start` or `node src/server.js`
- **Build Command**: Should be `npm install` or `npm ci`
- **Branch**: Should be your main branch (probably `main` or `master`)
- **Auto-Deploy**: Can be On or Off (doesn't affect 403)

---

### 8. Try Force Redeploy

Sometimes Render needs a fresh deployment:

1. Go to: Service → Manual Deploy (top right)
2. Click: **"Clear build cache & deploy"**
3. Wait 3-5 minutes
4. Check logs for successful startup
5. Test again: `curl https://lumina-finance-api-dev.onrender.com`

---

## 🔍 What the Logs Should Show

**Successful startup:**
```
Oct 21 04:30:45 PM  ==> Starting service with 'npm start'
Oct 21 04:30:48 PM  > lumina-finance-backend@1.0.0 start
Oct 21 04:30:48 PM  > node src/server.js
Oct 21 04:30:49 PM  🚀 Server running on port 10000
Oct 21 04:30:49 PM  📍 Environment: production
Oct 21 04:30:49 PM  ✅ Database connected successfully
```

**Failed startup:**
```
Oct 21 04:30:49 PM  Error: Cannot find module 'express'
Oct 21 04:30:49 PM  Error: SUPABASE_URL is not defined
Oct 21 04:30:49 PM  Error: getaddrinfo ENOTFOUND
```

---

## 🚨 Common Issues

### Issue 1: Free Service Suspended
**Symptoms:** Status shows "Suspended", returns 403
**Fix:** Click "Resume Service", wait 2-3 minutes

### Issue 2: Environment Variables Missing
**Symptoms:** Logs show "Error: Missing required environment variable"
**Fix:** Add all required environment variables, save, wait for redeploy

### Issue 3: Port Configuration
**Symptoms:** Logs show "Error: Port already in use" or "EADDRINUSE"
**Fix:**
- Remove `PORT` from environment variables (let Render set it)
- OR set `PORT=10000` (Render's default)

### Issue 4: Build Failed
**Symptoms:** Status shows "Build Failed"
**Fix:**
- Check package.json exists
- Check dependencies are valid
- Try "Clear build cache & deploy"

### Issue 5: Database Connection Failed
**Symptoms:** Logs show "Database connection warning" or Supabase errors
**Fix:**
- Verify Supabase credentials are correct
- Check Supabase project is active
- For now, this won't cause 403 (app will still start)

---

## 🔧 Alternative: Create New Render Service

If nothing works, try creating a fresh Render service:

1. **Delete the old service** (or leave it)
2. **Create new Web Service:**
   - Go to: https://dashboard.render.com/
   - Click: "New +" → "Web Service"
   - Connect: GitHub repo `haque51/lumina-finance-backend`
   - Name: `lumina-finance-api` (or any name)
   - Region: Choose closest to you
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

3. **Add Environment Variables** (before first deploy):
   ```
   NODE_ENV=production
   SUPABASE_URL=https://dyfuxvfdhlccxmjhcemh.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnV4dmZkaGxjY3htamhjZW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjIzMTgsImV4cCI6MjA3NTQzODMxOH0.lA4x2lL-yV7DtQuhy2662VFayzVN1aX1Nu4y6LTji_w
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZnV4dmZkaGxjY3htamhjZW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg2MjMxOCwiZXhwIjoyMDc1NDM4MzE4fQ.hL878T6C5vISWCrdyen3wKgMvxobkaiehUrZkBc8FdM
   JWT_SECRET=super_secret_key_change_this_to_random_string_12345678901234567890
   FRONTEND_URL=*
   ```

4. **Click "Create Web Service"**
5. Wait 3-5 minutes for deployment
6. Test new URL: `curl https://your-new-service.onrender.com`

---

## 📞 Contact Render Support

If all else fails, the 403 might be a Render account issue:

1. Go to: https://render.com/support
2. Or: Dashboard → Help → Contact Support
3. Tell them: "My service returns 403 Access denied at platform level, even though service shows as Live"

---

## 🎯 What to Tell Me

After checking the above, let me know:

1. **Service Status:** What does it show in dashboard? (Live/Suspended/Failed)
2. **Logs:** What do you see in the Logs tab? (Copy the last 10-20 lines)
3. **Environment Variables:** Are all variables set correctly?
4. **After Redeploy:** Did you try "Clear build cache & deploy"? What happened?

Then I can help you troubleshoot further or suggest alternatives (Railway, Fly.io, etc.)

---

## 🔄 Alternative: Use Railway Instead

If Render continues to give issues, Railway is easier to set up:

1. Go to: https://railway.app/
2. Sign in with GitHub
3. Click: "New Project" → "Deploy from GitHub repo"
4. Select: `haque51/lumina-finance-backend`
5. Add environment variables (same as above)
6. Deploy!
7. Get your URL (e.g., `https://lumina-backend.up.railway.app`)

Railway's free tier is more generous and rarely has these access issues.
