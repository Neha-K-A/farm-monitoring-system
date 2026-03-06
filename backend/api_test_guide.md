# Farm Monitoring System - API Testing Guide (Postman)

This document provides a comprehensive list of all backend API endpoints, their methods, and sample request bodies for testing.

**Base URL:** `http://localhost:5004/api/v1`

---

## 1. Authentication (`/auth`)

### Signup
*   **POST** `/auth/signup`
*   **Body:**
    ```json
    {
      "name": "Aruna Sharma",
      "phone": "9876543210",
      "email": "aruna@example.com",
      "password": "StrongPassword123!",
      "role": "farmer"
    }
    ```

### Login
*   **POST** `/auth/login`
*   **Body:**
    ```json
    {
      "phone": "9876543210",
      "password": "StrongPassword123!"
    }
    ```
    *Note: You can also login with `email` instead of `phone`.*

### Refresh Token
*   **POST** `/auth/refresh`
*   **Body:**
    ```json
    {
      "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
    }
    ```

### Logout
*   **POST** `/auth/logout`
*   **Headers:** `Authorization: Bearer <accessToken>`

### Get Current User
*   **GET** `/auth/me`
*   **Headers:** `Authorization: Bearer <accessToken>`

---

## 2. Onboarding (`/onboarding`)

### Complete Onboarding
*   **POST** `/onboarding`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "personal": {
        "gender": "female",
        "languagePreference": "kn",
        "farmingExperienceYears": 8,
        "education": "High School",
        "householdSize": 4,
        "primaryIncomeSources": ["Agriculture", "Dairy"],
        "womenCentricNeeds": ["Small tools", "Safety alerts"],
        "healthConstraints": "Back pain"
      },
      "farm": {
        "name": "Saraswati Farms",
        "location": {
          "village": "Malur",
          "district": "Kolar",
          "state": "Karnataka"
        },
        "totalAreaAcres": 3.5,
        "irrigationType": "Drip",
        "waterSource": "Borewell"
      },
      "soil": {
        "pH": 6.8,
        "nitrogen": 150,
        "phosphorus": 35,
        "potassium": 220,
        "organicCarbon": 0.6,
        "moisturePercent": 25,
        "lastTestedDate": "2024-02-15"
      },
      "crops": [
        {
          "name": "Tomato",
          "variety": "Hybrid",
          "plantedDate": "2024-01-10",
          "expectedYieldDate": "2024-04-15",
          "seedSource": "Local Coop"
        }
      ]
    }
    ```

---

## 3. Farm Management (`/farms`)

### Create Farm
*   **POST** `/farms`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "name": "Apple Garden",
      "location": {
        "village": "Shimla Rural",
        "district": "Shimla",
        "state": "Himachal Pradesh"
      },
      "totalAreaAcres": 2.0,
      "irrigationType": "Manual",
      "waterSource": "River"
    }
    ```

### List Farms
*   **GET** `/farms`
*   **Headers:** `Authorization: Bearer <accessToken>`

### Update Farm
*   **PATCH** `/farms/:id`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "name": "Updated Garden Name",
      "totalAreaAcres": 2.2
    }
    ```

### Update Farm Boundary (GeoJSON)
*   **POST** `/farms/:id/boundary`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "type": "Polygon",
      "coordinates": [[
        [77.5946, 12.9716], [77.5950, 12.9716], 
        [77.5950, 12.9720], [77.5946, 12.9720], [77.5946, 12.9716]
      ]]
    }
    ```

---

## 4. Crop Management (`/crops`)

### Add Crop
*   **POST** `/crops`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "farmId": "YOUR_FARM_ID_HERE",
      "name": "Mango",
      "variety": "Alphonso",
      "plantedDate": "2023-06-15",
      "expectedYieldDate": "2024-05-15"
    }
    ```

### List Crops
*   **GET** `/crops?farmId=...&status=active`
*   **Headers:** `Authorization: Bearer <accessToken>`

### Update Crop Status
*   **PATCH** `/crops/:id`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "status": "harvested",
      "expectedYieldDate": "2024-05-20"
    }
    ```

---

## 5. Finance (`/finance`)

### Add Expense
*   **POST** `/finance/expense`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "farmId": "YOUR_FARM_ID_HERE",
      "cropId": "YOUR_CROP_ID_HERE",
      "categoryOrSource": "Fertilizer",
      "amount": 2500,
      "date": "2024-02-28",
      "note": "Purchased organic compost (NPK mix)"
    }
    ```

### Add Income
*   **POST** `/finance/income`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "farmId": "YOUR_FARM_ID_HERE",
      "categoryOrSource": "Direct Market Sale",
      "amount": 15000,
      "date": "2024-03-01",
      "note": "Sold 200kg tomatoes"
    }
    ```

### Financial Summary
*   **GET** `/finance/summary?farmId=...&from=2024-01-01&to=2024-03-31`
*   **Headers:** `Authorization: Bearer <accessToken>`

---

## 6. Water Usage (`/water`)

### Log Water Usage
*   **POST** `/water/log`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "farmId": "YOUR_FARM_ID_HERE",
      "date": "2024-03-03",
      "litersUsed": 1200,
      "method": "Sprinkler",
      "durationMin": 45,
      "notes": "Evening irrigation cycle"
    }
    ```

### Water Usage Summary
*   **GET** `/water/summary?farmId=...&from=2024-03-01`
*   **Headers:** `Authorization: Bearer <accessToken>`

---

## 7. Women's Health (`/women-health`)

### Log Daily Health activity
*   **POST** `/women-health/log`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "date": "2024-03-03",
      "workHours": 9,
      "heatExposureMin": 180,
      "waterIntakeL": 2.2,
      "symptoms": ["Headache", "Fatigue"],
      "notes": "Heavy weeding in the afternoon"
    }
    ```

### Get Health Advice
*   **GET** `/women-health/advice`
*   **Headers:** `Authorization: Bearer <accessToken>`

---

## 8. Marketplace (`/marketplace`)

### Create Listing
*   **POST** `/marketplace/listings`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Body:**
    ```json
    {
      "product": "Organic Tomatoes",
      "category": "crop",
      "grade": "A",
      "quantity": 500,
      "unit": "kg",
      "pricePerUnit": 40,
      "moq": 10,
      "location": {
        "district": "Kolar",
        "state": "Karnataka"
      },
      "contactPhone": "9876543210"
    }
    ```

### Search Listings
*   **GET** `/marketplace/listings?product=tomato&district=kolar`
*   **Headers:** `Authorization: Bearer <accessToken>`

---

## 9. Weather & Discovery

### Get Current Weather
*   **GET** `/weather/current?lat=12.9716&lon=77.5946`
*   **Headers:** `Authorization: Bearer <accessToken>`

### Get Weather Advice
*   **GET** `/weather/advice?farmId=...`
*   **Headers:** `Authorization: Bearer <accessToken>`

### List Govt Schemes
*   **GET** `/schemes?state=Karnataka`
*   **Headers:** `Authorization: Bearer <accessToken>`

### Find Local Distributors
*   **GET** `/distributors?district=Kolar`
*   **Headers:** `Authorization: Bearer <accessToken>`

---

## 10. ML Detection Integration (`/detection`)

### Analyze Image
*   **POST** `/detection/analyze`
*   **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: multipart/form-data`
*   **Body (form-data):**
    *   `file`: (Attach Image file)
    *   `farmId`: (Optional)
    *   `cropId`: (Optional)
