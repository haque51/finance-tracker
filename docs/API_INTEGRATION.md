# API Integration Guide

## Phase 1: Setup Complete ✅

### Overview
This document outlines the API integration infrastructure for Lumina Finance frontend-backend connection.

### Files Created

#### Configuration
- **src/config/api.config.js**
  - API base configuration
  - All endpoint definitions
  - Timeout and header settings

#### Utilities
- **src/utils/tokenManager.js**
  - Token storage and retrieval
  - User data management
  - Token refresh functionality

- **src/utils/errorHandler.js**
  - Error message extraction
  - User-friendly error handling
  - Console logging for debugging

#### Base Service
- **src/services/api.js**
  - Axios instance with interceptors
  - Automatic token attachment
  - Automatic token refresh on 401
  - Error handling

#### Service Placeholders (9 files)
Created in `src/services/`:
1. authService.js - Authentication (Phase 2)
2. accountService.js - Account CRUD (Phase 3)
3. transactionService.js - Transaction CRUD (Phase 3)
4. categoryService.js - Category CRUD (Phase 3)
5. budgetService.js - Budget operations (Phase 4)
6. goalService.js - Goal tracking (Phase 4)
7. recurringService.js - Recurring transactions (Phase 4)
8. analyticsService.js - Analytics data (Phase 4)
9. currencyService.js - Currency operations (Phase 4)

### Environment Configuration

#### Local Development (.env)
```bash
REACT_APP_API_URL=https://lumina-finance-api-dev.onrender.com
REACT_APP_ENV=development
```

#### Netlify Environment Variables

**Production (main branch):**
- `REACT_APP_API_URL=https://lumina-finance-api.onrender.com`
- `REACT_APP_ENV=production`

**Development (dev branch):**
- `REACT_APP_API_URL=https://lumina-finance-api-dev.onrender.com`
- `REACT_APP_ENV=development`

**Validation (val branch):**
- `REACT_APP_API_URL=https://lumina-finance-api-val.onrender.com`
- `REACT_APP_ENV=validation`

### Backend API Details

**Endpoints:**
- Production: https://lumina-finance-api.onrender.com
- Development: https://lumina-finance-api-dev.onrender.com
- Validation: https://lumina-finance-api-val.onrender.com

**Test Credentials:**
- Email: devtest@example.com
- Password: DevTest123

**Response Format:**
```javascript
// Success Response
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}

// Error Response
{
  "status": "error",
  "error": "Error message description"
}
```

**Authentication:**
- Access Token: Valid for 7 days
- Refresh Token: Valid for 30 days
- Storage: localStorage
- Header: `Authorization: Bearer <token>`

### How to Use

#### Basic API Call
```javascript
import api from './services/api';

// GET request
const response = await api.get('/api/accounts');
console.log(response.data);

// POST request
const response = await api.post('/api/accounts', {
  name: 'Checking Account',
  type: 'checking',
  balance: 1000
});
```

#### Using Token Manager
```javascript
import { setTokens, getAccessToken, clearTokens } from './utils/tokenManager';

// Store tokens after login
setTokens(accessToken, refreshToken);

// Get current token
const token = getAccessToken();

// Clear tokens on logout
clearTokens();
```

#### Error Handling
```javascript
import { handleApiError, getErrorMessage } from './utils/errorHandler';

try {
  const response = await api.get('/api/accounts');
} catch (error) {
  // Option 1: Use built-in handler
  handleApiError(error);

  // Option 2: Get message only
  const errorMsg = getErrorMessage(error);
  console.error(errorMsg);
}
```

### Testing the Setup

#### Health Check Test
```javascript
import api from './services/api';

// Test health endpoint (no auth required)
api.get('/health')
  .then(response => {
    console.log('✅ API Connection Successful:', response.data);
  })
  .catch(error => {
    console.error('❌ API Connection Failed:', error);
  });
```

#### Token Manager Test
```javascript
import { setTokens, getAccessToken } from './utils/tokenManager';

// Test token storage
setTokens('test-access-token', 'test-refresh-token');
console.log('Token stored:', getAccessToken());
```

### Architecture

#### Request Flow
1. Component makes API call using service method
2. API interceptor adds Authorization header
3. Request sent to backend
4. Response interceptor checks for 401
5. If 401, automatically refreshes token and retries
6. Returns response or error to component

#### Token Refresh Flow
1. API call returns 401 Unauthorized
2. Interceptor catches 401
3. Calls refresh endpoint with refresh_token
4. Backend returns new access_token and refresh_token
5. Stores new tokens in localStorage
6. Retries original request with new token
7. If refresh fails, redirects to login

### Next Steps

#### Phase 2: Authentication Integration
- Implement login functionality
- Implement registration
- Implement logout
- Add password management
- Create authentication context/hook

#### Phase 3: Core CRUD Integration
- Implement account operations
- Implement transaction operations
- Implement category operations
- Add pagination and filtering
- Error handling improvements

#### Phase 4: Additional Modules
- Budget management
- Goal tracking
- Recurring transactions
- Analytics dashboard
- Currency conversion

#### Phase 5: Testing & Optimization
- Unit tests for services
- Integration tests
- Error handling improvements
- Performance optimization
- Security audit

### Important Notes

1. **Security**
   - Never commit .env file to git
   - Tokens stored in localStorage (vulnerable to XSS)
   - Always use HTTPS in production
   - Implement CSRF protection if needed

2. **Error Handling**
   - All API errors should be caught and handled
   - Use getErrorMessage() for user-friendly messages
   - Log errors for debugging

3. **CORS**
   - Backend already configured for Netlify domains
   - No additional CORS setup needed in frontend

4. **Testing**
   - Use test credentials: devtest@example.com / DevTest123
   - Test on development environment first
   - Validate before pushing to production

### Troubleshooting

**Issue: Network Error**
- Check REACT_APP_API_URL is set correctly
- Verify backend is running
- Check browser console for CORS errors

**Issue: 401 Unauthorized**
- Token may be expired
- Check token is stored in localStorage
- Verify Authorization header is being sent

**Issue: Token Refresh Loop**
- Refresh token may be expired
- Clear localStorage and login again
- Check refresh endpoint is not returning 401

### Support

For issues or questions:
1. Check browser console for error details
2. Verify environment variables are set
3. Test with health endpoint first
4. Review backend API documentation

---

**Status:** Phase 1 Complete ✅
**Last Updated:** October 21, 2025
**Next Phase:** Authentication Integration (Phase 2)
