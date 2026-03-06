import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Loader from '../components/Common/Loader.jsx';

const ProtectedRoute = ({ component: Component }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return isAuthenticated ? Component : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
