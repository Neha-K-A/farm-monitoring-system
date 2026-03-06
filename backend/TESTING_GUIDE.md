# Farm Monitoring System - Testing & Validation Guide

## Quick Start Validation

This guide will help you validate all the new features and endpoints added to the Farm Monitoring System.

### Prerequisites

- Node.js installed
- MongoDB running locally or connection string configured in `.env`
- Backend dependencies installed: `npm install`
- Backend running: `npm run dev`
- Frontend running: `npm run dev` (in frontend folder)

---

## 1. Database Setup with Seed Data

### Option A: Seed Full Database (Recommended for Testing)

Run this command to populate the database with test data including:

- Test farmer user account (farmer@testfarm.com)
- Test farm with 3 crops
- 5 government schemes
- Bank account information
- Sample financial records
- Weather logs

```bash
cd backend
npm run seed-all
```

**Output should show:**

```
✓ Connected to MongoDB
✓ Created user: farmer@testfarm.com
✓ Created farm: Green Valley Farm
✓ Created crop: Wheat
✓ Created crop: Rice
✓ Created crop: Cotton
✓ Created scheme: PM-KISAN
✓ Created scheme: Pradhan Mantri Fasal Bima Yojana
✓ Created bank account ending in ...1126
✓ Created transaction: Wheat seeds and fertilizers
✓ Created 3 weather logs
✅ Database seeding completed successfully!
```

**Test Account Credentials:**

- Email: `farmer@testfarm.com`
- Password: Check console output (or set your own after login)

### Option B: Seed Schemes Only

If you already have data and just want to seed schemes:

```bash
cd backend
npm run seed
```

---

## 2. Testing Authentication

### Register New User

**Endpoint:** POST `/api/v1/auth/register`

Using Postman or curl:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@farm.com",
    "phone": "9876543210",
    "password": "Test@1234",
    "location": {
      "state": "Punjab",
      "district": "Ludhiana"
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Test Farmer", "email": "test@farm.com" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

**Endpoint:** POST `/api/v1/auth/login`

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "Test@1234"
  }'
```

**Save the accessToken** - you'll use this for all protected endpoints.

---

## 3. Testing Government Schemes Feature

### Get All Schemes

**Endpoint:** GET `/api/v1/scheme`

```bash
curl -X GET http://localhost:5000/api/v1/scheme \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "schemeName": "PM-KISAN",
      "department": "Ministry of Agriculture",
      "benefits": "Direct transfer of ₹6,000 annually...",
      "eligibility": "All landholding farmers"
    },
    ...
  ]
}
```

### Get Schemes Recommended for User's Location

**Endpoint:** GET `/api/v1/scheme/relevant`

```bash
curl -X GET http://localhost:5000/api/v1/scheme/relevant \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Specific Scheme Details

**Endpoint:** GET `/api/v1/scheme/:schemeId`

```bash
curl -X GET http://localhost:5000/api/v1/scheme/SCHEME_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Frontend: Schemes Page

1. Login with test account
2. Navigate to Features → Schemes
3. Verify:
   - List of schemes loads without errors
   - Each scheme shows: Name, Department, Benefits, Eligibility
   - Schemes are specific to user's location (Punjab)

---

## 4. Testing Bank Account Management

### Save Bank Account

**Endpoint:** POST `/api/v1/finance/bank-account`

```bash
curl -X POST http://localhost:5000/api/v1/finance/bank-account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "State Bank of India",
    "accountNumber": "1234567890123",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Raj Kumar",
    "accountType": "savings",
    "metadata": {
      "branchName": "Main Branch",
      "state": "Punjab",
      "city": "Ludhiana"
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "bankName": "State Bank of India",
    "accountNumber": "...0123",
    "ifscCode": "SBIN0001234",
    "isActive": true
  }
}
```

### Retrieve Bank Account

**Endpoint:** GET `/api/v1/finance/bank-account`

```bash
curl -X GET http://localhost:5000/api/v1/finance/bank-account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Frontend: Finance Page (Bank Account Section)

1. Navigate to Features → Finance
2. You should see a "Bank Account" section with fields:
   - Bank Name
   - Account Number
   - IFSC Code
   - Account Holder Name
3. Fill in details and click Save
4. Verify account details are displayed

---

## 5. Testing Transaction Timeline/Status

### Create a Transaction

**Endpoint:** POST `/api/v1/finance/transaction`

```bash
curl -X POST http://localhost:5000/api/v1/finance/transaction \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subsidy",
    "amount": 6000,
    "description": "PM-KISAN subsidy received",
    "category": "Government Support",
    "date": "2024-12-20"
  }'
```

**Save the transaction ID from response**

### Update Transaction Status (Simulate Processing Flow)

**Endpoint:** PUT `/api/v1/finance/transaction/:transactionId/status`

Update through processing states:

```bash
# Step 1: Initiate → Processing
curl -X PUT http://localhost:5000/api/v1/finance/transaction/TRANS_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'

# Step 2: Processing → Approved
curl -X PUT http://localhost:5000/api/v1/finance/transaction/TRANS_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Step 3: Approved → Transferred
curl -X PUT http://localhost:5000/api/v1/finance/transaction/TRANS_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "transferred"}'

# Step 4: Transferred → Credited
curl -X PUT http://localhost:5000/api/v1/finance/transaction/TRANS_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "credited"}'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "credited",
    "timeline": {
      "initiated": "2024-12-20T...",
      "processing": "2024-12-20T...",
      "approved": "2024-12-20T...",
      "transferred": "2024-12-20T...",
      "credited": "2024-12-20T..."
    }
  }
}
```

---

## 6. Testing AI Assistant

### Check Ollama Status (Optional - for advanced setup)

If you have Ollama running locally, verify:

```bash
# This should respond with the model status if Ollama is running
curl http://localhost:11434/api/tags
```

If Ollama is not running, the endpoint will gracefully fall back to mock responses.

### Query AI for Agricultural Advice

**Endpoint:** POST `/api/v1/ai/query`

#### Example 1: Yellow Leaf Problem

```bash
curl -X POST http://localhost:5000/api/v1/ai/query \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Why are my crop leaves turning yellow?"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "query": "Why are my crop leaves turning yellow?",
    "answer": "Yellowing leaves on crops can be caused by several factors:\n\n1. **Nutrient Deficiency** - Lack of nitrogen...",
    "model": "mock",
    "source": "mock"
  }
}
```

#### Example 2: Pest Management

```bash
curl -X POST http://localhost:5000/api/v1/ai/query \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I manage pests in my cotton field?"
  }'
```

#### Example 3: Water Management

```bash
curl -X POST http://localhost:5000/api/v1/ai/query \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the best irrigation method for wheat?"
  }'
```

#### Example 4: Government Subsidies

```bash
curl -X POST http://localhost:5000/api/v1/ai/query \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What government schemes can help me buy a solar pump?"
  }'
```

### Test Frontend: AI Assistant Page (If Created)

1. Create a new page in frontend: `src/pages/Features/AIAssistant/AIAssistantPage.jsx`
2. Use the `aiService` to send queries
3. Display responses in a chat-like interface

---

## 7. Testing Weather Simulation

### Get Mock Weather Data (Public)

**Endpoint:** GET `/api/v1/weather/mock`

```bash
curl http://localhost:5000/api/v1/weather/mock
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "current": {
      "temperature": 28,
      "humidity": 68,
      "windSpeed": 14,
      "condition": "Partly Cloudy",
      "plantingRecommendation": "Ideal temperature for most crops."
    },
    "forecast": [
      {
        "date": "2024-12-21T...",
        "condition": "Sunny",
        "maxTemp": 32,
        "minTemp": 20,
        "rainChance": 5
      },
      ...
    ]
  }
}
```

### Get Current Weather for Farm

**Endpoint:** GET `/api/v1/weather/current/:farmId`

```bash
# First get a farm ID:
curl -X GET http://localhost:5000/api/v1/farm \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Then get weather for that farm:
curl -X GET http://localhost:5000/api/v1/weather/current/FARM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 8. Full End-to-End Validation Checklist

### Backend Tests

- [ ] Backend starts without errors: `npm run dev`
- [ ] Database connected: Check console output
- [ ] All routes mounted correctly: Check `server.js` imports
- [ ] Scheme routes working: GET `/api/v1/scheme`
- [ ] Finance routes working: POST `/api/v1/finance/transaction`, GET `/api/v1/finance/summary`
- [ ] Bank account routes working: POST/GET `/api/v1/finance/bank-account`
- [ ] AI routes working: POST `/api/v1/ai/query`
- [ ] Weather routes working: GET `/api/v1/weather/mock`
- [ ] No console errors or warnings

### Database Tests

- [ ] Seed script runs successfully: `npm run seed-all`
- [ ] Test user created: Check MongoDB for farmer@testfarm.com
- [ ] Test farm created: Check MongoDB
- [ ] Schemes populated: `db.govschemes.count()` > 0
- [ ] Bank account created: Check MongoDB
- [ ] Financial records created: Check MongoDB

### Frontend Tests (After Creating UI Components)

- [ ] Dashboard loads and displays correctly
- [ ] Farms page loads: Displays test farm "Green Valley Farm"
- [ ] Crops page loads: Shows 3 test crops
- [ ] Finance page loads:
  - [ ] Bank account section appears
  - [ ] Can save/update bank details
  - [ ] Transactions list shows test transactions
- [ ] Schemes page loads:
  - [ ] List of schemes displays
  - [ ] Shows relevant schemes for Punjab
  - [ ] No console errors
- [ ] Weather page loads: Displays mock weather data
- [ ] AI Assistant page (once created):
  - [ ] Can send queries
  - [ ] Gets responses
  - [ ] Shows mock advice when Ollama not available

### API Response Format Tests

Verify all endpoints return consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "descriptive message"
}
```

Verify error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "error description",
  "errors": []
}
```

---

## 9. Performance & Load Testing

### Test Multiple Queries

```bash
# Test concurrent AI queries
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/v1/ai/query \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"Test query $i\"}" &
done
wait
```

### Monitor Backend Console

Check for:

- [ ] No memory leaks
- [ ] No uncaught exceptions
- [ ] Proper error handling
- [ ] No hanging requests

---

## 10. Troubleshooting

### Issue: Database connection fails

**Solution:**

```bash
# Check MongoDB is running
mongod --version

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### Issue: AI endpoint returns 503

**Solution:** This is expected if Ollama is not running. The endpoint will gracefully fall back to mock responses.

### Issue: Bank account not saving

**Solution:**

- Check user is authenticated (valid token)
- Verify all required fields in request: bankName, accountNumber, ifscCode, accountHolderName
- Check MongoDB has BankAccount collection

### Issue: Schemes page shows error

**Solution:**

- Verify `schemeService.getSchemes()` method exists in frontend service
- Check `/api/v1/scheme` endpoint returns data
- Check user has valid JWT token

### Issue: Transaction status not updating

**Solution:**

- Verify valid transactionId exists
- Check valid status value: 'initiated', 'processing', 'approved', 'transferred', 'credited'
- Ensure user owns the transaction

---

## 11. Final Validation

Run this quick validation script:

```bash
#!/bin/bash

echo "🔍 Farm Monitoring System - Validation Check"
echo "==========================================="

# Check backend running
echo "❓ Checking backend on port 5000..."
if curl -s http://localhost:5000/api/v1/health-check > /dev/null; then
  echo "✓ Backend is running"
else
  echo "✗ Backend not responding"
  exit 1
fi

# Check database
echo "❓ Checking database..."
# Add your MongoDB check here

# Check routes
echo "❓ Checking routes..."
curl -s http://localhost:5000/api/v1/scheme -H "Authorization: Bearer test" > /dev/null && echo "✓ Schemes route exists"
curl -s http://localhost:5000/api/v1/finance/summary -H "Authorization: Bearer test" > /dev/null && echo "✓ Finance summary route exists"
curl -s http://localhost:5000/api/v1/ai/query -H "Authorization: Bearer test" > /dev/null && echo "✓ AI route exists"

echo ""
echo "✅ Validation complete!"
```

---

## Next Steps

1. **Frontend Components**: Create UI pages for new features:
   - Bank Account Management page
   - Transaction Timeline visualization
   - AI Assistant Chat page

2. **Ollama Integration** (Optional):
   - Install Ollama: https://ollama.ai
   - Pull model: `ollama pull mistral` or `ollama pull llama3`
   - Set in `.env`: `OLLAMA_URL=http://localhost:11434`

3. **Production Deployment**:
   - Update API endpoints for production URLs
   - Implement proper error logging
   - Add request rate limiting
   - Implement database backups

---

## Support

For issues or questions:

1. Check console output and browser dev tools
2. Review this guide's troubleshooting section
3. Check database directly: `mongosh` or MongoDB Compass
4. Review API_ENDPOINTS.md for endpoint specifications
