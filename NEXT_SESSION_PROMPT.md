# Prompt for Next Claude Code Session

Copy and paste this entire prompt into your next Claude Code session:

---

## Context: Lumina Finance Project - Phase 5 Polish Complete

I'm continuing work on the **Lumina Finance** web application. The previous session successfully completed Phase 5 (Testing, Bug Fixes & Final Polish) and got authentication working. Now we need to fix the dashboard to show real user data instead of demo data.

### Important: I work in GitHub Codespaces (cloud-based), NOT locally!
- All changes should be committed and pushed to GitHub
- I access the frontend via Netlify deployment
- Backend is deployed to Railway

---

## Current Project Status

### ✅ What's Working

**Backend (Railway):**
- Deployed at: `https://lumina-finance-backend-production.up.railway.app`
- Connected to Supabase PostgreSQL database
- All environment variables configured
- Trust proxy enabled (`app.set('trust proxy', 1)`)
- All API endpoints working with `/api` prefix

**Frontend (Netlify):**
- Deployed and connected to Railway backend
- **User Registration Working** ✅
- **User Login Working** ✅
- Environment variable: `REACT_APP_API_URL=https://lumina-finance-backend-production.up.railway.app`

**Authentication:**
- Users can register and data is saved to Supabase
- Users can login with registered credentials
- JWT tokens generated and stored
- Protected routes working

### ❌ Current Issues (Documented in `docs/FINDINGS_AND_TODO.md`)

**Critical Issues:**
1. Dashboard shows **demo data** for authenticated users instead of real data from backend
2. User profile displays "Demo User" instead of actual logged-in user's name
3. **No logout button** - users cannot log out
4. No personalized welcome message

**Root Cause:**
- Both `/demo` and `/dashboard` routes use the same `FinanceTrackerApp.js` component
- This component has hardcoded `initialState` with demo data (lines 12-72)
- Component doesn't call backend APIs to fetch real user data
- Component doesn't read authenticated user from `AppContext`

---

## Git Branch Information

**Current Branch:** `claude/phase-5-polish-011CULNgn5xNwjVWZsMBxXNX`
**Base Branch:** `dev`

**Recent Commits:**
- `c5c4ba2` - docs: add comprehensive findings and issues document
- `4e77145` - fix: send login credentials as object instead of separate parameters
- `f29dbdd` - fix: improve error handling for malformed JSON responses
- `91dfab6` - fix: add /api prefix to all API endpoints
- `a0c579d` - chore: update API URL to Railway backend

**All changes are committed and pushed.** You may need to merge to `dev` after fixes.

---

## Key Files to Understand

### Backend (deployed to Railway)
- Repository: `haque51/lumina-finance-backend`
- Branch: `dev`
- Main files:
  - `src/app.js` - Express app with trust proxy enabled
  - `src/routes/auth.routes.js` - Auth endpoints
  - `src/services/auth.service.js` - Auth business logic

### Frontend (this repository)

**Authentication Context:**
- `src/context/AppContext.jsx` - Global state management
  - Has `user`, `isAuthenticated` state
  - Has methods: `login()`, `logout()`, `register()`
  - Has methods to load data: `loadAccounts()`, `loadTransactions()`, `loadCategories()`, `loadBudgets()`, `loadGoals()`

**Main App:**
- `src/App.js` - Routing
  - `/login` → `LoginPage`
  - `/register` → `RegisterPage`
  - `/demo` → `FinanceTrackerApp` (demo mode)
  - `/dashboard` → `FinanceTrackerApp` (authenticated - but currently showing demo data!)

**Problem Component:**
- `src/FinanceTrackerApp.js` - The main dashboard UI
  - Lines 12-72: Hardcoded `initialState` with demo data
  - Line 75: `useState(initialState)` - Uses demo data for all users
  - Currently does NOT:
    - Check if user is authenticated
    - Load data from backend
    - Show logged-in user's info
    - Have logout button

**API Configuration:**
- `src/config/api.config.js` - All API endpoints (with `/api` prefix)
- `src/services/authService.js` - Auth API calls
- `src/services/accountService.js` - Account CRUD
- `src/services/transactionService.js` - Transaction CRUD
- (Similar services for categories, budgets, goals, etc.)

---

## What Needs to Be Done

**READ THIS FIRST:** `docs/FINDINGS_AND_TODO.md` - Comprehensive list of all issues and recommended fixes

**Immediate Goals (Phase 1 - Quick Wins):**

1. **Add Logout Button**
   - Add to header in `FinanceTrackerApp.js`
   - Call `logout()` from `AppContext`
   - Redirect to `/login` after logout

2. **Fix User Profile Display**
   - Read `user` from `AppContext` instead of hardcoded `initialState`
   - Show actual user's name and email
   - Only use demo data when in `/demo` route

3. **Add Welcome Message**
   - Display "Welcome back, [User Name]!" on dashboard
   - Personalize based on logged-in user

**Next Goals (Phase 2 - Data Integration):**

4. **Load Real Data from Backend**
   - Detect if user is authenticated
   - Call `loadAccounts()`, `loadTransactions()`, `loadCategories()`, etc. from `AppContext`
   - Show loading states while fetching
   - Show empty states for new users with no data
   - Handle errors gracefully

5. **Separate Demo and Authenticated Modes**
   - Make `FinanceTrackerApp` detect which mode it's in
   - Demo mode: Use hardcoded data, no backend calls
   - Authenticated mode: Load from backend

---

## Technical Context

### State Management
- Global state is in `AppContext` (`src/context/AppContext.jsx`)
- `FinanceTrackerApp` currently has its own local state (the problem!)
- Should use `AppContext` as single source of truth for authenticated users

### API Integration
The `AppContext` already has these methods ready to use:
```javascript
const {
  user,              // Current logged-in user
  isAuthenticated,   // Boolean
  loadAccounts,      // () => Promise - Fetches accounts from backend
  loadTransactions,  // (filters) => Promise
  loadCategories,    // () => Promise
  loadBudgets,       // (month, year) => Promise
  loadGoals,         // (status) => Promise
  logout,            // () => Promise - Logs out and clears tokens
} = useApp();
```

These methods are already implemented and working - just need to call them!

### Demo Data
Currently in `FinanceTrackerApp.js` lines 12-72. Consider extracting to:
- `src/data/demoData.js` (cleaner organization)

---

## Environment Setup

**Frontend Environment Variables (Netlify):**
```
REACT_APP_API_URL=https://lumina-finance-backend-production.up.railway.app
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

**Backend Environment Variables (Railway):**
```
NODE_ENV=production
SUPABASE_URL=https://dyfuxvfdhlccxmjhcemh.supabase.co
SUPABASE_ANON_KEY=<configured>
SUPABASE_SERVICE_KEY=<configured>
JWT_SECRET=<configured>
FRONTEND_URL=*
```

---

## Testing Instructions

After making changes:

1. **Commit and push** to `claude/phase-5-polish-011CULNgn5xNwjVWZsMBxXNX` branch
2. **Merge to `dev`** branch via GitHub PR
3. **Netlify auto-deploys** from `dev` branch (wait 2-3 minutes)
4. **Test on Netlify URL** (I'll provide the URL)
5. **Check Railway logs** if there are backend issues

**To test:**
- Register a new user
- Login with that user
- Should see: User's name (not "Demo User"), logout button, welcome message
- Dashboard should show empty states (not demo data)
- Create an account → Should save to backend and appear in dashboard

---

## Important Notes

1. **I don't run anything locally** - Everything is cloud-based (Codespaces, Netlify, Railway)
2. **Demo Mode should still work** - `/demo` route should show demo data without authentication
3. **Don't break authentication** - Registration and login are working, keep them working!
4. **Use the existing AppContext methods** - They're already implemented, just need to be called
5. **Read `docs/FINDINGS_AND_TODO.md` first** - It has detailed analysis of every issue

---

## What to Start With

**Recommended approach:**

1. **Read** `docs/FINDINGS_AND_TODO.md` to understand all issues
2. **Start with Phase 1 Quick Wins:**
   - Add logout button
   - Fix user profile to show real user
   - Add welcome message
3. **Test** after each change
4. **Then move to Phase 2:** Data integration

---

## Questions to Ask Me

Before starting, ask me:
1. What's my Netlify URL? (so you can test)
2. Do I want to start with Phase 1 or go straight to Phase 2?
3. Any specific concerns about the fixes?

---

## Success Criteria

After this session, the dashboard should:
- ✅ Show the logged-in user's actual name (not "Demo User")
- ✅ Have a working logout button
- ✅ Display a personalized welcome message
- ✅ Load real data from the backend for authenticated users
- ✅ Show empty states for new users (not demo data)
- ✅ Demo mode (`/demo`) still works with demo data

---

**Let's fix the dashboard and complete the authenticated user experience!** 🚀
