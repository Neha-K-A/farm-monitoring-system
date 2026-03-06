# Farm Monitoring System - Frontend Setup

## Installation

```bash
cd frontend
npm install
```

## Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Development

Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Build

Build for production:

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Route utilities
├── services/           # API service layer
├── utils/              # Utility functions
├── assets/             # Images, fonts, etc
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Features Implemented

### ✅ Core

- Authentication (Login/Signup with JWT)
- Protected routes
- Toast notifications
- Responsive design
- Design system with Tailwind CSS

### ✅ Pages

- Dashboard
- Farm Management (CRUD)
- Crop Management (CRUD)
- Health Tracking
- User Profile

### ⏳ In Progress

- Soil monitoring
- Weather tracking
- Water usage
- Financial records
- Marketplace
- By-products
- Government schemes
- Distributors
- Disease detection
- Recommendations
- Language settings
- Notifications

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v7** - Routing
- **Axios** - HTTP client
- **Lucide Icons** - Icon library
- **Context API** - State management

## Authentication Flow

1. User signs up/logs in
2. Backend returns access token and refresh token
3. Token stored in localStorage
4. Axios interceptor adds token to requests
5. Token refresh on 401 response
6. Logout clears tokens and redirects to login

## API Integration

All API calls go through `/src/services/` layer:

- `authService` - Authentication
- `userService` - User profile
- `farmService` - Farm management
- `cropService` - Crop management
- etc.

Each service uses the configured `apiClient` with interceptors for auth.

## Component Structure

- **Common Components** - Reusable UI (Button, Input, Card, Modal, etc)
- **Layout Components** - Layout structure (Sidebar, Header, MainLayout)
- **Pages** - Feature pages with business logic
- **Hooks** - useAuth, useFetch, useForm, useNotification

## Notes

- No console.log statements in production code
- All async operations handled with proper loading/error states
- Form validation at component level
- Toast notifications for user feedback
- Responsive design mobile-first approach
- Soft design system with rounded corners and gentle transitions
