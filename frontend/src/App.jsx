import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import Toast from './components/Common/Toast.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// Public Pages
import HomePage from './pages/Public/HomePage.jsx';
import ServicesPage from './pages/Public/ServicesPage.jsx';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage.jsx';
import SignupPage from './pages/Auth/SignupPage.jsx';

// Dashboard
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';

// Feature Pages
import FarmListPage from './pages/Features/Farm/FarmListPage.jsx';
import CropListPage from './pages/Features/Crop/CropListPage.jsx';
import SoilPage from './pages/Features/Soil/SoilPage.jsx';
import WaterPage from './pages/Features/Water/WaterPage.jsx';
import WeatherPage from './pages/Features/Weather/WeatherPage.jsx';
import HealthPage from './pages/Features/Health/HealthPage.jsx';
import FinancePage from './pages/Features/Finance/FinancePage.jsx';
import MarketPage from './pages/Features/Market/MarketPage.jsx';
import ByProductPage from './pages/Features/ByProduct/ByProductPage.jsx';
import SchemePage from './pages/Features/Scheme/SchemePage.jsx';
import DistributorPage from './pages/Features/Distributor/DistributorPage.jsx';
import DetectionPage from './pages/Features/Detection/DetectionPage.jsx';
import NotificationPage from './pages/Features/Notification/NotificationPage.jsx';
import RecommendationPage from './pages/Features/Recommendation/RecommendationPage.jsx';
import LanguagePage from './pages/Features/Language/LanguagePage.jsx';
import ProfilePage from './pages/Features/User/ProfilePage.jsx';
import VisionMonitoring from './pages/Features/Vision/VisionMonitoring.jsx';
import AnalyticsPage from './pages/Features/Analytics/AnalyticsPage.jsx';
import SensorsPage from './pages/Features/Sensors/SensorsPage.jsx';
import AIAssistantPage from './pages/Features/AIAssistant/AIAssistantPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <LanguageProvider>
            <Toast />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute component={<DashboardPage />} />}
              />

              {/* Feature Routes */}
              <Route
                path="/farm"
                element={<ProtectedRoute component={<FarmListPage />} />}
              />
              <Route
                path="/crop"
                element={<ProtectedRoute component={<CropListPage />} />}
              />
              <Route
                path="/soil"
                element={<ProtectedRoute component={<SoilPage />} />}
              />
              <Route
                path="/water"
                element={<ProtectedRoute component={<WaterPage />} />}
              />
              <Route
                path="/weather"
                element={<ProtectedRoute component={<WeatherPage />} />}
              />
              <Route
                path="/health"
                element={<ProtectedRoute component={<HealthPage />} />}
              />
              <Route
                path="/finance"
                element={<ProtectedRoute component={<FinancePage />} />}
              />
              <Route
                path="/ai-assistant"
                element={<ProtectedRoute component={<AIAssistantPage />} />}
              />
              <Route
                path="/market"
                element={<ProtectedRoute component={<MarketPage />} />}
              />
              <Route
                path="/byproduct"
                element={<ProtectedRoute component={<ByProductPage />} />}
              />
              <Route
                path="/scheme"
                element={<ProtectedRoute component={<SchemePage />} />}
              />
              <Route
                path="/distributor"
                element={<ProtectedRoute component={<DistributorPage />} />}
              />
              <Route
                path="/detection"
                element={<ProtectedRoute component={<DetectionPage />} />}
              />
              <Route
                path="/vision"
                element={<ProtectedRoute component={<VisionMonitoring />} />}
              />
              <Route
                path="/notification"
                element={<ProtectedRoute component={<NotificationPage />} />}
              />
              <Route
                path="/recommendation"
                element={<ProtectedRoute component={<RecommendationPage />} />}
              />
              <Route
                path="/analytics"
                element={<ProtectedRoute component={<AnalyticsPage />} />}
              />
              <Route
                path="/sensors"
                element={<ProtectedRoute component={<SensorsPage />} />}
              />
              <Route
                path="/language"
                element={<ProtectedRoute component={<LanguagePage />} />}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute component={<ProfilePage />} />}
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LanguageProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
