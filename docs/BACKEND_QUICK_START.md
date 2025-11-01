# Quick Start: Running Backend Locally

## 🎯 Current Situation

**Problem:**
- Remote backend (`https://lumina-finance-api-dev.onrender.com`) is blocking requests
- Getting "Access denied" or "Failed to fetch" errors
- Cannot login or register

**Solution:**
Run the backend server locally on your machine

---

## 🚀 Option 1: Do You Have Backend Repository?

### Check if you have it:
```bash
# Common locations
ls ~/lumina-finance-backend
ls ~/finance-tracker-backend
ls ~/backend
```

### If YES:
Jump to **"Running Existing Backend"** section below

### If NO:
You need to either:
1. Clone the backend repository (if you have access)
2. Ask repository owner for access
3. I can help create a minimal working backend

---

## 📥 Cloning Backend Repository

If you have access to the GitHub repository:

```bash
# Go to your projects directory
cd ~

# Clone backend repository
git clone https://github.com/YOUR-USERNAME/lumina-finance-backend.git

# Or if it's under haque51:
git clone https://github.com/haque51/lumina-finance-backend.git

# Enter directory
cd lumina-finance-backend
```

---

## 🔧 Running Existing Backend

### Step 1: Install Dependencies
```bash
cd lumina-finance-backend  # or whatever the folder name is

npm install
```

### Step 2: Set Up Database

**Option A: Use Supabase (Recommended - No Local Install)**

1. Go to https://supabase.com (free account)
2. Create new project
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

**Option B: Install PostgreSQL Locally**

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install postgresql

# macOS
brew install postgresql && brew services start postgresql

# Create database
sudo -u postgres createdb lumina_finance
```

### Step 3: Configure Environment

Create `.env` file in backend directory:

```bash
# Copy example if it exists
cp .env.example .env

# Or create new one
nano .env
```

**Add this to .env:**
```env
PORT=5000
NODE_ENV=development

# Use Supabase URL or local PostgreSQL
DATABASE_URL=postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres

# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=another-random-secret-key-here

# Frontend URL (IMPORTANT!)
CORS_ORIGIN=http://localhost:3000

JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Step 4: Run Migrations

```bash
# Create database tables
npm run migrate

# Or if using knex directly
npx knex migrate:latest

# Optional: Add test data
npm run seed
```

### Step 5: Start Backend

```bash
# Development mode (auto-reload)
npm run dev

# Or standard start
npm start
```

**You should see:**
```
✅ Server running on http://localhost:5000
✅ Database connected
```

### Step 6: Update Frontend

In frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

Then restart frontend:
```bash
npm start
```

---

## 🧪 Test It's Working

```bash
# Test server
curl http://localhost:5000

# Test register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "baseCurrency": "USD"
  }'
```

You should get a JSON response with user data and token!

---

## ❌ Don't Have Backend Repository?

### Option A: Request Access

Contact:
- Repository owner
- Team lead
- Check project documentation

### Option B: Create Minimal Backend

I can help you create a simple Express.js backend that works with this frontend. Let me know!

### Option C: Use Demo Mode (Temporary)

While setting up backend:
```
http://localhost:3000/demo
```

---

## 🔍 Verify Everything is Working

1. **Backend Running:**
   ```bash
   curl http://localhost:5000
   # Should return: {"status":"ok"} or similar
   ```

2. **Frontend Connected:**
   - Open browser console (F12)
   - Should see: "API_BASE_URL: http://localhost:5000"

3. **Register New User:**
   - Go to http://localhost:3000/register
   - Create account
   - Should redirect to dashboard

4. **Login:**
   - Use your credentials
   - Should login successfully

---

## 🆘 Common Issues

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 5000 already in use"
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>

# Or use different port in backend .env: PORT=5001
```

### "Database connection failed"
- Check DATABASE_URL is correct
- Verify database is running (if local PostgreSQL)
- Test connection: `psql $DATABASE_URL`

### "CORS error in browser"
- Check backend `.env` has: `CORS_ORIGIN=http://localhost:3000`
- Restart backend after changing .env
- Clear browser cache

---

## 📊 Status Checklist

- [ ] Backend repository cloned/accessed
- [ ] Dependencies installed (`npm install`)
- [ ] Database set up (Supabase or local PostgreSQL)
- [ ] `.env` file configured with DATABASE_URL
- [ ] `.env` has CORS_ORIGIN=http://localhost:3000
- [ ] Migrations run (`npm run migrate`)
- [ ] Backend running on port 5000
- [ ] Frontend `.env` has REACT_APP_API_URL=http://localhost:5000
- [ ] Frontend restarted
- [ ] Can register and login successfully

---

## 🎉 Next Steps After Setup

Once backend is working:
1. Create your account
2. Start adding accounts and transactions
3. Explore all features with real data
4. Your data will be saved in database

---

**Need Help?** Let me know:
1. Do you have access to backend repository?
2. What error messages do you see?
3. Which step are you stuck on?
