# Backend Setup Guide - Lumina Finance

## Current Status

**Remote Backend**: `https://lumina-finance-api-dev.onrender.com`
- Status: ❌ Access Denied (CORS/Authorization issue)
- Response: "Access denied" on all endpoints
- Issue: Server is blocking requests from browser

---

## Solution Options

### Option 1: Run Backend Locally (Recommended)

This is the best option for development and testing.

---

## 🚀 Local Backend Setup

### Step 1: Check if you have the Backend Repository

Do you have access to the backend code? Check if you have it:

```bash
# Look for backend folder
ls -la ~/lumina-finance-backend
# or
ls -la ~/finance-tracker-backend
```

**If you have it:** Skip to Step 3
**If you don't have it:** Continue to Step 2

---

### Step 2: Get the Backend Code

#### Option A: Clone from GitHub
```bash
# Clone the backend repository
git clone https://github.com/haque51/lumina-finance-backend.git
cd lumina-finance-backend
```

#### Option B: Ask for Repository Access
Contact the repository owner or team to get access to the backend code.

#### Option C: Create Your Own Backend
If the backend repository is not available, I can help you create a compatible backend using Express.js and PostgreSQL.

---

### Step 3: Install Backend Dependencies

```bash
cd lumina-finance-backend  # or whatever the folder is called

# Install dependencies
npm install

# or if using yarn
yarn install
```

---

### Step 4: Set Up Database

The backend needs a PostgreSQL database. You have several options:

#### Option A: Use Supabase (Cloud - Easiest)

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Get your database connection string

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Option B: Install PostgreSQL Locally

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**On macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Create Database:**
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE lumina_finance;

# Create user
CREATE USER lumina_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lumina_finance TO lumina_user;

# Exit
\q
```

---

### Step 5: Configure Backend Environment

Create `.env` file in the backend directory:

```bash
cp .env.example .env
# or create manually
nano .env
```

**Backend .env file should contain:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Supabase or Local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/lumina_finance

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-this-too

# JWT Expiration
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Optional: Additional Settings
BCRYPT_ROUNDS=10
```

**Generate JWT Secret:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Step 6: Run Database Migrations

```bash
# Run migrations to create tables
npm run migrate
# or
npx knex migrate:latest

# Optional: Seed database with test data
npm run seed
# or
npx knex seed:run
```

---

### Step 7: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
🚀 Server running on port 5000
✅ Database connected
```

---

### Step 8: Test Backend is Working

Open a new terminal and test:

```bash
# Test health check
curl http://localhost:5000

# Test register endpoint
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "baseCurrency": "USD"
  }'
```

You should get a successful response with user data and token.

---

### Step 9: Update Frontend Configuration

Update frontend `.env` file:

```bash
# In frontend directory: /home/user/finance-tracker/.env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

---

### Step 10: Restart Frontend

```bash
# In frontend directory
npm start
```

Now try to login/register!

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "Port already in use"**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**Error: "Cannot connect to database"**
- Check database is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL in .env
- Check database credentials

**Error: "Module not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure backend `.env` has:
```env
CORS_ORIGIN=http://localhost:3000
```

And backend CORS configuration allows your frontend origin.

### Frontend Can't Connect

1. Check backend is running: `curl http://localhost:5000`
2. Check frontend .env has correct URL
3. Restart frontend after changing .env
4. Check browser console for errors

---

## 📋 Quick Checklist

- [ ] Backend code cloned/downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL database created
- [ ] Backend `.env` file configured
- [ ] Database migrations run
- [ ] Backend server running (`npm run dev`)
- [ ] Backend responding to requests (test with curl)
- [ ] Frontend `.env` updated with `http://localhost:5000`
- [ ] Frontend restarted
- [ ] Can register/login successfully

---

## 🎯 Expected File Structure

```
project/
├── finance-tracker/              # Frontend (this repository)
│   ├── .env
│   ├── package.json
│   └── src/
│
└── lumina-finance-backend/       # Backend (separate repository)
    ├── .env
    ├── package.json
    ├── server.js
    ├── routes/
    ├── controllers/
    ├── models/
    └── migrations/
```

---

## 🆘 Still Not Working?

### Option 1: Create Test Backend
I can help you create a simple Express.js backend that works with this frontend.

### Option 2: Use Demo Mode
While setting up backend, use demo mode:
```
http://localhost:3000/demo
```

### Option 3: Check Backend Repository
Make sure you have access to the correct backend repository. The backend should have these endpoints:
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/auth/me`
- And all other endpoints listed in frontend's `api.config.js`

---

## 📞 Getting Help

**Backend Issues:**
1. Check backend logs for errors
2. Verify database connection
3. Check all environment variables
4. Ensure CORS is configured correctly

**Frontend Issues:**
1. Check browser console
2. Verify API URL in .env
3. Check network tab for failed requests
4. Ensure backend is running and accessible

---

**Do you have the backend repository?** Let me know and I can help you set it up!
