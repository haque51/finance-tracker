# Lumina Finance Tracker

A modern, full-featured personal finance management application built with React.

## Features

### Complete Feature Set
- **Authentication** - Secure user authentication
- **Accounts** - Multi-currency account management
- **Transactions** - Income, expenses, and transfers with filters
- **Categories** - Hierarchical category organization
- **Budgets** - Monthly budget tracking with progress
- **Goals** - Savings goals with progress tracking
- **Recurring** - Automatic recurring transactions
- **Analytics** - Dashboard with charts and insights
- **Multi-Currency** - Support for multiple currencies with exchange rates

## Tech Stack

### Frontend
- **React 18+** - UI framework
- **Context API** - State management
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Features
- **Error Boundary** - Graceful error handling
- **Toast Notifications** - User feedback system
- **Loading States** - Loading indicators throughout
- **Empty States** - Helpful zero-data messages
- **Offline Detection** - Network status monitoring
- **Confirm Dialogs** - Safe destructive actions
- **Dark Mode** - Full dark theme support
- **Responsive Design** - Mobile, tablet, and desktop

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/haque51/finance-tracker.git
   cd finance-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL** (Important!):

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend API URL:
   ```env
   REACT_APP_API_URL=https://your-backend-url.com
   # Or for local development:
   # REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

### ⚠️ Troubleshooting "Failed to Fetch" Errors

If you get **"Failed to fetch"** or **"Unable to connect to server"** errors:

1. **Use Demo Mode**: Try the app without backend → `http://localhost:3000/demo`
2. **Check Backend Status**: Ensure the backend server is running and accessible
3. **Verify API URL**: Make sure `.env` has the correct `REACT_APP_API_URL`
4. **Check CORS**: Backend must allow requests from your frontend origin
5. **See Full Guides**:
   - `docs/DEMO_MODE.md` - Use app without backend
   - `docs/API_TROUBLESHOOTING.md` - Fix connection issues

**🎮 Quick Start with Demo Mode (No Backend Needed):**
```
http://localhost:3000/demo
```

**Quick fix for local development:**
```env
# In .env file
REACT_APP_API_URL=http://localhost:5000
```

Then restart the dev server: `npm start`

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── LoadingSpinner.jsx
│   ├── LoadingOverlay.jsx
│   ├── EmptyState.jsx
│   ├── Toast.jsx
│   ├── ConfirmDialog.jsx
│   └── OfflineBanner.jsx
├── hooks/            # Custom React hooks
│   └── useNetworkStatus.js
├── context/          # React Context
│   └── ToastContext.jsx
└── App.js            # Main app component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Features in Detail

### Error Handling
- **Error Boundary** - Catches and displays errors gracefully
- **Network Detection** - Shows offline banner when disconnected
- **User-Friendly Messages** - Clear, actionable error messages

### User Experience
- **Loading States** - Spinners and overlays during operations
- **Empty States** - Helpful messages when no data exists
- **Toast Notifications** - Success, error, warning, and info toasts
- **Confirm Dialogs** - Prevents accidental deletions
- **Dark Mode** - Full support for dark theme

### Responsive Design
- Mobile-first design
- Works on all screen sizes
- Touch-friendly interface

## Testing

See `docs/TESTING_CHECKLIST.md` for comprehensive testing checklist.

### Manual Testing
1. Test all CRUD operations
2. Verify data persistence
3. Check error handling
4. Test responsive design

## Known Limitations

1. **No Data Export** - Currently no CSV/PDF export (planned)
2. **Single User** - No multi-user collaboration
3. **No Mobile App** - Web-only (mobile-responsive)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Roadmap

### Future Enhancements
- [ ] Receipt scanning and management
- [ ] Bank account integration
- [ ] Bill reminders and automation
- [ ] Investment tracking
- [ ] Tax preparation tools
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics with AI insights
- [ ] Multi-user collaboration
- [ ] Data export (CSV, PDF)

## Acknowledgments

- UI inspired by modern fintech applications
- Icons by Lucide
- Charts by Recharts

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Status:** Production Ready
