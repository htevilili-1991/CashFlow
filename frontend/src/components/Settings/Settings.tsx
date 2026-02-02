import React from 'react';
import CategoryList from '../Categories/CategoryList';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application settings and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Category Management Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Category Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add, edit, or delete transaction categories for better organization
            </p>
          </div>
          <div className="p-6">
            <CategoryList />
          </div>
        </div>

        {/* Other Settings Sections (placeholder for future features) */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account preferences and security
            </p>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>Account settings coming soon...</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure notification preferences and alerts
            </p>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>Notification settings coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
