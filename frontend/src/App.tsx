import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import CategoryList from './components/Categories/CategoryList';
import AuthGuard from './components/Auth/AuthGuard';
import Layout from './components/Layout/Layout';
import { useTransactions } from './hooks/useTransactions';
import type { Transaction } from './types';

const queryClient = new QueryClient();

function AppContent() {
  const { transactions, balance, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  
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
    setTransactionModalOpen(false);
    setEditingTransaction(null);
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

  return (
    <Layout
      activeItem={activeItem}
      onNavigate={setActiveItem}
      transactionModalOpen={transactionModalOpen}
      setTransactionModalOpen={setTransactionModalOpen}
      editingTransaction={editingTransaction}
      setEditingTransaction={setEditingTransaction}
      onSubmitTransaction={handleSubmitTransaction}
    >
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </QueryClientProvider>
  );
}

export default App;
