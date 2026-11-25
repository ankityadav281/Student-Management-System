import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole || (r === 'admin' && (user?.role === 'Academic Coordinator' || user?.is_staff)));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
