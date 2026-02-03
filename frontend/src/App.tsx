import React, { useState } from 'react';
import AuthGuard from './components/Auth/AuthGuard';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import TransactionModal from './components/Transactions/TransactionModal';
import Envelopes from './components/Envelopes/Envelopes';
import Settings from './components/Settings/Settings';
import Goals from './components/Goals/Goals';
import { useTransactions } from './hooks/useTransactions';
import type { Transaction } from './types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

  const getPageTitle = () => {
    switch (activeItem) {
      case 'dashboard':
        return 'Dashboard';
      case 'transactions':
        return 'Transactions';
      case 'envelopes':
        return 'Envelopes';
      case 'goals':
        return 'Savings Goals';
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
      case 'envelopes':
        return <Envelopes />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings />;
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
