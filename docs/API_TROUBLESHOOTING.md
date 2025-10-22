# API Connection Troubleshooting Guide

## Common Issue: "Failed to Fetch" Error

If you're seeing a **"Failed to fetch"** or **"Unable to connect to server"** error when trying to login or register, here's how to fix it:

---

## Problem: Backend API Server Not Accessible

### Symptoms:
- ❌ "Failed to fetch" error on login/register
- ❌ "Unable to connect to server" message
- ❌ Network errors in browser console

### Causes:
1. **Backend API server is down or unreachable**
2. **CORS (Cross-Origin Resource Sharing) issues**
3. **Wrong API URL configured**
4. **No internet connection**

---

## Solutions

### Solution 1: Check if Backend Server is Running

The frontend is configured to connect to:
```
https://lumina-finance-api-dev.onrender.com
```

**Check server status:**
```bash
curl -I https://lumina-finance-api-dev.onrender.com
```

If you get a 403 or 404 error, the server might not be configured correctly.

---

### Solution 2: Change API URL (Use Different Backend)

You can change the backend URL by editing the `.env` file:

1. **Open/Create `.env` file** in the project root:
   ```bash
   nano .env
   ```

2. **Change the API URL:**
   ```env
   # For local backend
   REACT_APP_API_URL=http://localhost:5000

   # For different remote backend
   REACT_APP_API_URL=https://your-backend-url.com

   # For production backend
   REACT_APP_API_URL=https://lumina-finance-api.onrender.com
   ```

3. **Restart the development server:**
   ```bash
   npm start
   ```

---

### Solution 3: Run Backend Locally

If you have the backend code, run it locally:

1. **Start backend server** (usually on port 5000 or 3001):
   ```bash
   cd path/to/backend
   npm start
   ```

2. **Update `.env` file:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Restart frontend:**
   ```bash
   npm start
   ```

---

### Solution 4: Check CORS Settings

If the backend is running but you still get errors:

**Backend needs to allow requests from your frontend origin:**

```javascript
// Backend CORS configuration should include:
cors({
  origin: ['http://localhost:3000', 'https://your-frontend.netlify.app'],
  credentials: true
})
```

---

### Solution 5: Use Demo/Mock Mode (Future Enhancement)

For testing without a backend, you can use the standalone `FinanceTrackerApp.js`:

1. **Temporarily modify `src/App.js`:**
   ```javascript
   import FinanceTrackerApp from './FinanceTrackerApp';

   function App() {
     return <FinanceTrackerApp />;
   }
   ```

2. This runs the app with mock data (no backend needed)

---

## Verification Steps

After applying a solution:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Try to login/register**
4. **Check for:**
   - ✅ API configuration log showing correct URL
   - ✅ Network requests going to correct URL
   - ✅ No CORS errors
   - ✅ Successful login/register

---

## API Configuration Reference

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000` |
| `REACT_APP_ENV` | Environment name | `development` |
| `REACT_APP_DEBUG` | Enable debug logging | `true` |

### Available Backend URLs

| Environment | URL | Status |
|-------------|-----|--------|
| Development | `https://lumina-finance-api-dev.onrender.com` | ⚠️ Check availability |
| Production | `https://lumina-finance-api.onrender.com` | ⚠️ Check availability |
| Local | `http://localhost:5000` | Run backend locally |

---

## Test Credentials

Once connected to a working backend, use these test credentials:

```
Email: devtest@example.com
Password: DevTest123
```

Or create a new account via the Register page.

---

## Getting Help

If you still can't connect:

1. **Check backend repository** for setup instructions
2. **Verify backend is deployed and running**
3. **Check backend logs** for errors
4. **Ensure database is connected** on backend
5. **Contact backend team** for API access

---

## Quick Checklist

- [ ] Backend server is running
- [ ] `.env` file exists with correct `REACT_APP_API_URL`
- [ ] Restarted frontend after changing `.env`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows requests going to correct URL
- [ ] Backend accepts requests from frontend origin
- [ ] Test credentials work (if backend has test data)

---

**Last Updated:** October 2025
**Version:** Phase 5 Complete
