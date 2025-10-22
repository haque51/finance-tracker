#!/bin/bash

# Backend Connection Test Script
# Tests if backend is accessible and working

echo "🔍 Testing Backend Connection..."
echo "================================"
echo ""

# Get API URL from .env or use default
API_URL="${REACT_APP_API_URL:-http://localhost:5000}"

echo "📍 Testing: $API_URL"
echo ""

# Test 1: Basic connectivity
echo "Test 1: Basic Connectivity"
echo "--------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Server is reachable (HTTP $HTTP_CODE)"
else
    echo "❌ Server is not reachable"
    echo "💡 Make sure backend is running on $API_URL"
    exit 1
fi

echo ""

# Test 2: Register endpoint
echo "Test 2: Register Endpoint"
echo "-------------------------"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser_'$(date +%s)'@example.com",
    "password": "Test123456",
    "baseCurrency": "USD"
  }' 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "token\|success"; then
    echo "✅ Register endpoint working"
    echo "Response: $REGISTER_RESPONSE" | head -c 200
else
    echo "⚠️  Register endpoint response:"
    echo "$REGISTER_RESPONSE"
fi

echo ""
echo ""

# Test 3: Login endpoint
echo "Test 3: Login Endpoint"
echo "----------------------"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devtest@example.com",
    "password": "DevTest123"
  }' 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "token\|success"; then
    echo "✅ Login endpoint working"
    echo "Response: $LOGIN_RESPONSE" | head -c 200
else
    echo "⚠️  Login endpoint response:"
    echo "$LOGIN_RESPONSE"
fi

echo ""
echo ""

# Summary
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server issues detected"
fi

if echo "$REGISTER_RESPONSE" | grep -q "token\|success"; then
    echo "✅ Registration works"
else
    echo "⚠️  Registration needs attention"
fi

if echo "$LOGIN_RESPONSE" | grep -q "token\|success"; then
    echo "✅ Login works"
else
    echo "⚠️  Login needs attention"
fi

echo ""
echo "💡 Recommendations:"
echo "==================="

if [ "$HTTP_CODE" = "403" ]; then
    echo "- CORS issue detected. Backend needs to allow frontend origin"
    echo "- Check backend CORS_ORIGIN in .env: http://localhost:3000"
fi

if echo "$REGISTER_RESPONSE" | grep -q "Access denied"; then
    echo "- Backend is blocking requests"
    echo "- Run backend locally instead of using remote server"
fi

echo "- Read docs/BACKEND_SETUP.md for detailed setup instructions"
echo "- Or use Demo Mode: http://localhost:3000/demo"

echo ""
