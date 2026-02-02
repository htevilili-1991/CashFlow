import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import TransactionModal from './components/Transactions/TransactionModal';
import type { Balance, Transaction } from './types';

const queryClient = new QueryClient();

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Mock data - replace with actual API calls
  const mockBalance: Balance = {
    total_income: '5000.00',
    total_expenses: '3200.00',
    balance: '1800.00',
    monthly_income: '4500.00',
    monthly_expenses: '2800.00',
  };

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      user: '1',
      date: '2024-01-15',
      description: 'Monthly Salary',
      amount: '4500.00',
      category: 'Salary',
      transaction_type: 'income',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      user: '1',
      date: '2024-01-14',
      description: 'Grocery Shopping',
      amount: '150.00',
      category: 'Food',
      transaction_type: 'expense',
      created_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-14T15:30:00Z',
    },
    {
      id: 3,
      user: '1',
      date: '2024-01-13',
      description: 'Electric Bill',
      amount: '120.00',
      category: 'Bills',
      transaction_type: 'expense',
      created_at: '2024-01-13T09:00:00Z',
      updated_at: '2024-01-13T09:00:00Z',
    },
  ];

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    // Handle delete logic here
    console.log('Delete transaction:', transaction);
  };

  const handleSubmitTransaction = (transaction: Partial<Transaction>) => {
    // Handle submit logic here
    console.log('Submit transaction:', transaction);
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
            balance={mockBalance}
            recentTransactions={mockTransactions}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={mockTransactions}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'categories':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
            <p className="text-gray-600">Categories management coming soon...</p>
          </div>
        );
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeItem={activeItem}
          onNavigate={setActiveItem}
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
    </QueryClientProvider>
  );
}

export default App;
