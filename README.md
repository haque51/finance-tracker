# Lumina Finance - Demo Application

A comprehensive personal finance management application built with React. This is a **single-file demo version** with no backend integration.

## Overview

This branch (`claude/review-session-instructions-011CUNPV8WKfoVSKbG3pFsVm`) contains a simplified, prototype version of Lumina Finance. All functionality is contained in a single React file (`src/App.js`) with hardcoded demo data.

**Key Characteristics:**
- Single-file React application (4,489 lines)
- No authentication or user management
- No backend API integration
- Local state management only
- Demo data that resets on page refresh
- Full-featured UI with all finance management tools

## Features

- **Dashboard** - Financial overview with charts and metrics
- **Accounts** - Manage bank accounts, credit cards, loans
- **Transactions** - Track income and expenses
- **Categories** - Organize spending with categories and subcategories
- **Recurring Transactions** - Set up automated recurring payments
- **Budgets** - Monthly budget tracking by category
- **Goals** - Financial goal setting and progress tracking
- **Debt Payoff** - Debt management with payoff strategies (snowball/avalanche)
- **Insights** - Smart alerts, AI insights, auto-categorization
- **Reports** - Comprehensive financial reports and analytics
- **Settings** - User preferences, data export/import, theme toggle

## Technology Stack

- **React** 18.2.0
- **Recharts** 2.12.0 - Data visualization
- **Lucide React** 0.263.1 - Icon library
- **Tailwind CSS** - Styling
- **Dark Mode** - Theme toggle support

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build

```bash
# Create production build
npm run build
```

## Documentation

For detailed information about the current state of this application, see:

**[docs/CURRENT_STATE.md](docs/CURRENT_STATE.md)** - Comprehensive documentation including:
- Complete feature list
- Architecture overview
- Component structure
- Data models
- Limitations and known issues
- Comparison with dev branch
- Use cases and best practices

## Important Notes

### Data Persistence

⚠️ **Data is NOT persisted!** All data resets when you refresh the page. This is a demo application only.

- Data is stored in React state only
- Refreshing the page resets to demo data
- Use "Export Data" in Settings to save your data as JSON
- Use "Import Data" to restore from a previous export

### Demo Data

The application starts with pre-populated demo data:
- Demo User profile
- 4 sample accounts
- 7 sample transactions
- Categories, budgets, goals, and more

### No Backend

This version has NO backend integration:
- No authentication
- No API calls
- No database
- No multi-user support
- No real-time sync

## Use Cases

This branch is ideal for:

✅ **Demos and Prototypes** - Showcase the UI/UX to stakeholders
✅ **Frontend Development** - Test UI changes without backend complexity
✅ **Learning React** - Study component patterns and state management
✅ **Static Deployment** - Deploy to Netlify, Vercel, or GitHub Pages

This branch is NOT suitable for:

❌ **Production use** - No data persistence or security
❌ **Real financial data** - Data is not saved
❌ **Multi-user scenarios** - Single demo user only

## Project Structure

```
finance-tracker/
├── public/              # Static assets
├── src/
│   ├── App.js           # Main application (4,489 lines)
│   ├── index.js         # React entry point
│   ├── index.css        # Tailwind styles
│   └── tailwind.config.js
├── docs/
│   └── CURRENT_STATE.md # Detailed documentation
├── package.json
└── README.md
```

## Comparison with Dev Branch

The `dev` branch has a completely different architecture with:

- ✅ Authentication system (login/register)
- ✅ Backend API integration (Railway)
- ✅ Database (Supabase PostgreSQL)
- ✅ Modular component structure
- ✅ Data persistence
- ✅ Multi-user support

This branch is a simplified version for demo purposes only.

## Contributing

This is a demo branch. For production development, work on the `dev` branch instead.

## License

Private project - All rights reserved
