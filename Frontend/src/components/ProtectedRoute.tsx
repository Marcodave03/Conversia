import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWallet();

  return wallet.status === 'connected' ? <>{children}</> : <Navigate to="/landing" />;
};

export default ProtectedRoute;
