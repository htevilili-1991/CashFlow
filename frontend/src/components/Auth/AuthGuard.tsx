import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Login from './Login';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('AuthGuard useEffect - isAuthenticated changed to:', isAuthenticated);
  }, [isAuthenticated]);

  console.log('AuthGuard render - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('AuthGuard: Showing Login component');
    return <Login />;
  }

  console.log('AuthGuard: Showing protected content');
  return <>{children}</>;
};

export default AuthGuard;
