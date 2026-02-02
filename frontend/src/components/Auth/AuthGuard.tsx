import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Login from './Login';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  console.log('AuthGuard render - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
};

export default AuthGuard;
