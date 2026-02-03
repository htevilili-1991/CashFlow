import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Search, AlertTriangle, Wallet, TrendingUp } from 'lucide-react';
import { useEnvelopes } from '../../hooks/useEnvelopes';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { envelopes } = useEnvelopes();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get envelope notifications
  const getEnvelopeNotifications = () => {
    return envelopes.filter(envelope => 
      parseFloat(envelope.remaining_amount) <= 0 || 
      envelope.is_over_budget || 
      envelope.is_near_limit
    );
  };

  const notifications = getEnvelopeNotifications();
  const notificationCount = notifications.length;

  // Categorize notifications
  const criticalNotifications = envelopes.filter(envelope => 
    parseFloat(envelope.remaining_amount) <= 0 || envelope.is_over_budget
  );
  const warningNotifications = envelopes.filter(envelope => 
    envelope.is_near_limit && !envelope.is_over_budget
  );

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-64"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                  criticalNotifications.length > 0 ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Envelope Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {criticalNotifications.length > 0 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs font-medium">{criticalNotifications.length} Critical</span>
                        </div>
                      )}
                      {warningNotifications.length > 0 && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs font-medium">{warningNotifications.length} Warning</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Wallet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No envelope notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {/* Critical Notifications */}
                      {criticalNotifications.map((envelope) => (
                        <div key={envelope.id} className="p-4 hover:bg-red-50 bg-red-50/30">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-red-100">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">{envelope.category_name}</p>
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                  Critical
                                </span>
                              </div>
                              <p className="text-sm text-red-600 mt-1">
                                {envelope.is_over_budget 
                                  ? `Over budget by VT ${Math.abs(parseFloat(envelope.remaining_amount)).toFixed(2)}`
                                  : `Envelope depleted (VT ${parseFloat(envelope.remaining_amount).toFixed(2)} remaining)`
                                }
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {envelope.percentage_used.toFixed(1)}% of VT {parseFloat(envelope.budgeted_amount).toFixed(2)} used
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Warning Notifications */}
                      {warningNotifications.map((envelope) => (
                        <div key={envelope.id} className="p-4 hover:bg-yellow-50 bg-yellow-50/30">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-yellow-100">
                              <TrendingUp className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">{envelope.category_name}</p>
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                                  Warning
                                </span>
                              </div>
                              <p className="text-sm text-yellow-600 mt-1">
                                Near budget limit - Only VT {parseFloat(envelope.remaining_amount).toFixed(2)} remaining
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {envelope.percentage_used.toFixed(1)}% of VT {parseFloat(envelope.budgeted_amount).toFixed(2)} used
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View All Envelopes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
