import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('checkAuth called - token exists:', !!token, 'refresh token exists:', !!refreshToken);
    const authStatus = !!token;
    setIsAuthenticated(authStatus);
    return authStatus;
  };

  useEffect(() => {
    console.log('useAuth useEffect - initial check');
    checkAuth();
    
    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        console.log('Storage change detected, re-checking auth');
        checkAuth();
      }
    };
    
    // Listen for custom auth events
    const handleAuthChange = () => {
      console.log('Auth change event detected, re-checking auth');
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authAPI.login(username, password),
    onSuccess: (data) => {
      console.log('Login success - received tokens:', data);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Force immediate state update
      setIsAuthenticated(true);
      console.log('Set isAuthenticated to true');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authChange'));
      
      toast.success('Login successful!');
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) =>
      authAPI.register(username, email, password),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
    },
    onError: () => {
      toast.error('Registration failed. Please try again.');
    },
  });

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    console.log('Set isAuthenticated to false');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    
    queryClient.clear();
    toast.success('Logged out successfully!');
  };

  return {
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
};
