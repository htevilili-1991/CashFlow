import React from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Receipt, 
  Settings, 
  LogOut,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activeItem, onNavigate, onLogout, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'envelopes', label: 'Envelopes', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out
        lg:relative lg:inset-0 lg:translate-x-0 lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">CashFlow</h1>}
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className={`${isCollapsed ? 'px-2' : 'p-4'} space-y-1`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onToggle();
                }}
                className={`
                  sidebar-item w-full flex items-center ${isCollapsed ? 'justify-center' : ''}
                  ${activeItem === item.id ? 'active' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && item.label}
              </button>
            );
          })}
          
          <div className={`pt-4 ${isCollapsed ? 'border-t border-gray-200' : 'mt-4 border-t border-gray-200'}`}>
            <button 
              onClick={onLogout}
              className={`
                sidebar-item w-full flex items-center text-red-600 hover:bg-red-50
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && 'Logout'}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
