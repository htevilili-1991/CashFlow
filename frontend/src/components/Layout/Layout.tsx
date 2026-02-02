import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import TransactionModal from '../Transactions/TransactionModal';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import type { Transaction } from '../../types';

interface LayoutProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  children: React.ReactNode;
  transactionModalOpen: boolean;
  setTransactionModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  onSubmitTransaction: (transaction: Partial<Transaction>) => void;
}

const Layout: React.FC<LayoutProps> = ({
  activeItem,
  onNavigate,
  children,
  transactionModalOpen,
  setTransactionModalOpen,
  editingTransaction,
  setEditingTransaction,
  onSubmitTransaction,
}) => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeItem) {
      case 'dashboard':
        return 'Dashboard';
      case 'transactions':
        return 'Transactions';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeItem={activeItem}
        onNavigate={onNavigate}
        onLogout={logout}
      />
      
      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
        />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={onSubmitTransaction}
        editingTransaction={editingTransaction}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

export default Layout;
