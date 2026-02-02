import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import TransactionModal from './components/Transactions/TransactionModal';
import CategoryList from './components/Categories/CategoryList';
import Login from './components/Auth/Login';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import type { Transaction } from './types';

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const { transactions, balance, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  
  console.log('AppContent render - isAuthenticated:', isAuthenticated);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
  };

  const handleSubmitTransaction = (transaction: Partial<Transaction>) => {
    if (editingTransaction) {
      updateTransaction({ id: editingTransaction.id, transaction });
    } else {
      createTransaction(transaction);
    }
  };

  const getPageTitle = () => {
    switch (activeItem) {
      case 'dashboard':
        return 'Dashboard';
      case 'transactions':
        return 'Transactions';
      case 'categories':
        return 'Categories';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <Dashboard
            balance={balance || {
              total_income: '0.00',
              total_expenses: '0.00',
              balance: '0.00',
              monthly_income: '0.00',
              monthly_expenses: '0.00',
            }}
            recentTransactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'categories':
        return <CategoryList />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeItem={activeItem}
        onNavigate={setActiveItem}
        onLogout={logout}
      />
      
      <div className="lg:pl-64">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
        />
        
        <main>
          {renderContent()}
        </main>
      </div>

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        onSubmit={handleSubmitTransaction}
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
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
