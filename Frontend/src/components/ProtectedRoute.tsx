import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();

    return currentUser ? <>{children}</> : <Navigate to="/landing" />;
};

export default ProtectedRoute;
