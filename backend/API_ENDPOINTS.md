# API Endpoints for Postman Testing

Base URL: http://localhost:5000/api/v1

Notes:

- Protected endpoints require a Bearer access token in `Authorization: Bearer <token>` header (except where indicated).
- File uploads use `multipart/form-data`.

1. Health

---

GET /health-check

- URL: /api/v1/health-check
- Auth: No
- Description: Server health
- Response: { success: true, status: 'ok', timestamp, environment }

2. Auth

---

POST /auth/register

- URL: /api/v1/auth/register
- Auth: No
- Body (application/json):
  {
  "name": "Sunita Devi",
  "phone": "9876543210",
  "email": "sunita@example.com", // optional
  "password": "Farm@2024",
  "language": "hi",
  "location": { "state": "Bihar", "district": "Patna", "village": "X" }
  }
- Response: 201 user + tokens

POST /auth/login

- URL: /api/v1/auth/login
- Auth: No
- Body (application/json):
  {
  "phone": "9876543210",
  "password": "Farm@2024"
  }
- Response: 200 accessToken + refresh cookie

POST /auth/refresh-token

- URL: /api/v1/auth/refresh-token
- Auth: No (uses refresh cookie)
- Body: none
- Response: 200 new access token

POST /auth/logout

- URL: /api/v1/auth/logout
- Auth: Yes (Bearer)
- Body: none
- Response: 200

GET /auth/me

- URL: /api/v1/auth/me
- Auth: Yes
- Response: 200 current user

3. Users

---

GET /users/profile

- URL: /api/v1/users/profile
- Auth: Yes
- Response: 200 user profile

GET /users/women/journal

- URL: /api/v1/users/women/journal
- Auth: No
- Response: 200 array of stories

GET /users/women/tools

- URL: /api/v1/users/women/tools
- Auth: No
- Response: 200 array of tools

4. Farms

---

POST /farms

- URL: /api/v1/farms
- Auth: Yes
- Body (application/json):
  {
  "name": "My Farm",
  "owner": "<userId>",
  "totalArea": 1.5,
  "areaUnit": "acre",
  "location": { "address": "...", "coordinates": {"lat": 12.34, "lng": 56.78} },
  "irrigationSystem": "drip",
  "soilType": "loamy"
  }
- Response: 201 created

GET /farms

- URL: /api/v1/farms
- Auth: Yes
- Query: ?owner=<userId> optional
- Response: 200 array

GET /farms/:farmId

- URL: /api/v1/farms/:farmId
- Auth: Yes
- Response: 200 farm

PUT /farms/:farmId

- URL: /api/v1/farms/:farmId
- Auth: Yes
- Body: partial farm object to update
- Response: 200 updated

DELETE /farms/:farmId

- URL: /api/v1/farms/:farmId
- Auth: Yes
- Response: 200 deleted

5. Crops

---

POST /crops

- URL: /api/v1/crops
- Auth: Yes
- Body (application/json):
  {
  "farm": "<farmId>",
  "owner": "<userId>",
  "cropName": "Tomato",
  "cropType": "vegetable",
  "plantingDate": "2026-02-01",
  "expectedHarvestDate": "2026-04-01",
  "seedQuantity": { "amount": 2, "unit": "kg" },
  "status": "planted"
  }
- Response: 201 created

GET /crops

- URL: /api/v1/crops
- Auth: Yes
- Query: ?farm=<farmId>&owner=<userId>&status=<status>
- Response: 200 array

GET /crops/due-yields

- URL: /api/v1/crops/due-yields
- Auth: Yes
- Response: 200 { within7Days: [], within14Days: [], within30Days: [] }

GET /crops/:cropId

- URL: /api/v1/crops/:cropId
- Auth: Yes
- Response: 200 crop

PUT /crops/:cropId

- URL: /api/v1/crops/:cropId
- Auth: Yes
- Body: partial crop update
- Response: 200 updated

DELETE /crops/:cropId

- URL: /api/v1/crops/:cropId
- Auth: Yes
- Response: 200 deleted

6. Soil

---

POST /soil/:farmId/soil

- URL: /api/v1/soil/:farmId/soil
- Auth: Yes
- Body (application/json):
  {
  "testDate": "2026-03-01",
  "pH": 6.5,
  "nitrogen": 240,
  "phosphorus": 30,
  "potassium": 180,
  "organicMatter": 3.2,
  "moisture": 20,
  "texture": "loamy",
  "labReportUrl": "https://..."
  }
- Response: 201 created

GET /soil/farm/:farmId

- URL: /api/v1/soil/farm/:farmId
- Auth: Yes
- Response: 200 array of soil records

7. Weather

---

GET /weather/current/:farmId

- URL: /api/v1/weather/current/:farmId
- Auth: Yes
- Response: 200 current weather object

GET /weather/forecast/:farmId

- URL: /api/v1/weather/forecast/:farmId
- Auth: Yes
- Response: 200 { forecast: [] }

GET /weather/history/:farmId

- URL: /api/v1/weather/history/:farmId
- Auth: Yes
- Response: 200 array

8. Water

---

POST /water/log

- URL: /api/v1/water/log
- Auth: Yes
- Body (application/json):
  {
  "farm": "<farmId>",
  "crop": "<cropId>",
  "date": "2026-03-02",
  "waterUsed": 5000, // liters
  "irrigationMethod": "drip",
  "duration": 60,
  "source": "borewell",
  "notes": "Morning irrigation"
  }
- Response: 201 logged

GET /water/farm/:farmId

- URL: /api/v1/water/farm/:farmId
- Auth: Yes
- Response: 200 logs

GET /water/farm/:farmId/stats

- URL: /api/v1/water/farm/:farmId/stats
- Auth: Yes
- Response: 200 stats object

9. Health

---

POST /health/log

- URL: /api/v1/health/log
- Auth: Yes
- Body (application/json):
  {
  "user": "<userId>",
  "date": "2026-03-02",
  "workHours": 9,
  "heatExposure": { "duration": 120, "uvIndex": 8, "temperature": 38 },
  "waterIntake": 1.5, // liters
  "mood": "fatigued",
  "symptoms": ["headache"],
  "menstrualCycle": { "phase": "luteal", "notes": "mild cramps" }
  }
- Response: 201 created (alerts may be returned)

GET /health/logs

- URL: /api/v1/health/logs
- Auth: Yes
- Response: 200 array

GET /health/summary

- URL: /api/v1/health/summary
- Auth: Yes
- Response: 200 summary

GET /health/tips

- URL: /api/v1/health/tips
- Auth: Yes
- Response: 200 tips array

10. Finance

---

POST /finance/transaction

- URL: /api/v1/finance/transaction
- Auth: Yes
- Body (application/json):
  {
  "owner": "<userId>",
  "farm": "<farmId>",
  "crop": "<cropId>",
  "type": "expense", // income|expense|loan|subsidy|repayment
  "amount": 1200,
  "currency": "INR",
  "date": "2026-03-02",
  "description": "Fertilizer purchase"
  }
- Response: 201 recorded

GET /finance/transactions

- URL: /api/v1/finance/transactions
- Auth: Yes
- Response: 200 array

GET /finance/summary

- URL: /api/v1/finance/summary
- Auth: Yes
- Response: 200 summary

GET /finance/market-demand

- URL: /api/v1/finance/market-demand
- Auth: No
- Response: 200 sample demand array

11. Market

---

POST /market/listings

- URL: /api/v1/market/listings
- Auth: Yes
- Body (application/json or multipart if photos):
  {
  "seller": "<userId>",
  "productName": "Tomato",
  "category": "vegetable",
  "quantity": 100,
  "unit": "kg",
  "pricePerUnit": 25,
  "moq": 20,
  "availableFrom": "2026-03-10",
  "isOrganic": true,
  "photos": ["https://..."]
  }
- Response: 201 created

GET /market/listings

- URL: /api/v1/market/listings
- Auth: No
- Response: 200 array

GET /market/my-listings

- URL: /api/v1/market/my-listings
- Auth: Yes
- Response: 200 array

GET /market/listings/:id

- URL: /api/v1/market/listings/:id
- Auth: No
- Response: 200 listing

PUT /market/listings/:id

- URL: /api/v1/market/listings/:id
- Auth: Yes
- Body: partial update
- Response: 200 updated

DELETE /market/listings/:id

- URL: /api/v1/market/listings/:id
- Auth: Yes
- Response: 200 deleted

12. By-products

---

POST /byproducts

- URL: /api/v1/byproducts
- Auth: Yes
- Body:
  {
  "owner": "<userId>",
  "sourceCrop": "wheat",
  "byProductName": "Wheat Straw",
  "quantity": 1000,
  "unit": "kg",
  "pricePerUnit": 2,
  "photos": ["https://..."]
  }
- Response: 201 created

GET /byproducts

- URL: /api/v1/byproducts
- Auth: No
- Response: 200 array

GET /byproducts/suggestions

- URL: /api/v1/byproducts/suggestions
- Auth: No
- Query body: none (optional ?crop=wheat)
- Response: 200 suggestions map

13. Schemes

---

GET /schemes

- URL: /api/v1/schemes
- Auth: No
- Response: 200 array

GET /schemes/relevant

- URL: /api/v1/schemes/relevant
- Auth: Yes
- Response: 200 array

GET /schemes/:id

- URL: /api/v1/schemes/:id
- Auth: No
- Response: 200 scheme

POST /schemes/seed

- URL: /api/v1/schemes/seed
- Auth: Yes (admin)
- Response: 200 seeded

14. Distributors

---

GET /distributors

- URL: /api/v1/distributors
- Auth: No
- Response: 200 array

GET /distributors/nearby

- URL: /api/v1/distributors/nearby
- Auth: Yes
- Query: ?lat=..&lng=..&radius=km
- Response: 200 array

GET /distributors/:id

- URL: /api/v1/distributors/:id
- Auth: No
- Response: 200 distributor

15. Detection (ML pipeline)

---

GET /detection/status

- URL: /api/v1/detection/status
- Auth: No
- Response: 200 { running: false, status: 'ok' }

POST /detection/detect/image

- URL: /api/v1/detection/detect/image
- Auth: Yes
- Content-Type: multipart/form-data
- Form field: file (binary image) (field name depends on controller; default use `image`)
- Body (form fields optional): { "farm": "<farmId>", "crop": "<cropId>" }
- Response: 200 detection metadata (class, confidence, treatmentSuggested)

GET /detection/results

- URL: /api/v1/detection/results
- Auth: Yes
- Query: ?sessionId=..&user=..&farm=..
- Response: 200 array of DetectionLog entries

POST /detection/start

- URL: /api/v1/detection/start
- Auth: Yes
- Body: { "source": "rtsp://..." } optional
- Response: 200 { status: 'started' }

POST /detection/stop

- URL: /api/v1/detection/stop
- Auth: Yes
- Response: 200 { status: 'stopped' }

16. Recommendations

---

GET /recommendations/crop

- URL: /api/v1/recommendations/crop
- Auth: Yes
- Query: ?farmId=&season=
- Response: 200 array

GET /recommendations/irrigation

- URL: /api/v1/recommendations/irrigation
- Auth: Yes
- Response: 200 object

GET /recommendations/organic

- URL: /api/v1/recommendations/organic
- Auth: No
- Response: 200 guide

GET /recommendations/modern-tools

- URL: /api/v1/recommendations/modern-tools
- Auth: No
- Response: 200 array

17. Language

---

GET /language/supported

- URL: /api/v1/language/supported
- Auth: No
- Response: 200 array of { code, name, nativeName }

PUT /language/preference

- URL: /api/v1/language/preference
- Auth: Yes
- Body: { "language": "hi" }
- Response: 200 { language }

GET /language/translate

- URL: /api/v1/language/translate?text=Hello&targetLanguage=hi
- Auth: Yes
- Response: 200 { translatedText, targetLanguage }

18. Notifications

---

GET /notifications

- URL: /api/v1/notifications
- Auth: Yes
- Response: 200 array

GET /notifications/unread-count

- URL: /api/v1/notifications/unread-count
- Auth: Yes
- Response: 200 { count: 0 }

PUT /notifications/:id/read

- URL: /api/v1/notifications/:id/read
- Auth: Yes
- Response: 200

DELETE /notifications/:id

- URL: /api/v1/notifications/:id
- Auth: Yes
- Response: 200

19. Finance - Bank Accounts

---

POST /finance/bank-account

- URL: /api/v1/finance/bank-account
- Auth: Yes
- Body (application/json):
  {
  "bankName": "State Bank of India",
  "accountNumber": "1234567890123",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "Raj Kumar",
  "accountType": "savings", // savings|current
  "metadata": {
  "branchName": "Main Branch",
  "state": "Punjab",
  "city": "Ludhiana"
  }
  }
- Response: 200 bank account created/updated

GET /finance/bank-account

- URL: /api/v1/finance/bank-account
- Auth: Yes
- Response: 200 user's bank account details

20. Finance - Transaction Status

---

PUT /finance/transaction/:transactionId/status

- URL: /api/v1/finance/transaction/{transactionId}/status
- Auth: Yes
- Body (application/json):
  {
  "status": "processing" // initiated|processing|approved|transferred|credited
  }
- Response: 200 updated transaction with timeline

21. AI Assistant

---

POST /ai/query

- URL: /api/v1/ai/query
- Auth: Yes
- Body (application/json):
  {
  "query": "Why are my crop leaves turning yellow?"
  }
- Response: 200 { query, answer, model, source }
- Note: Uses Ollama locally if available, falls back to mock responses

GET /ai/history

- URL: /api/v1/ai/history
- Auth: Yes
- Response: 200 chat history (currently empty, for future implementation)

---

## Postman Tips

- For protected routes: add header `Authorization: Bearer <accessToken>`.
- For `refresh-token`: ensure the `refreshToken` cookie is present (server sets cookie on login).
- For file uploads: use `form-data`, key `image` (or `file`), value: file, set Content-Type automatic.
- Use `POST /auth/login` first to obtain tokens, then test protected endpoints.

If you want, I can also generate a Postman collection JSON export with these endpoints prefilled. Let me know if you want that.
