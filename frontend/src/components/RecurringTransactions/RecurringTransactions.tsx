import React, { useState } from 'react';
import { Repeat, Plus, Calendar, AlertCircle, Play, Clock } from 'lucide-react';
import RecurringTransactionCard from './RecurringTransactionCard';
import RecurringTransactionModal from './RecurringTransactionModal';
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions';
import { formatCurrency } from '../../utils/currency';
import type { RecurringTransaction } from '../../api/recurringTransactions';

const RecurringTransactions: React.FC = () => {
  const {
    recurringTransactions,
    upcomingTransactions,
    overdueTransactions,
    isLoading,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    createTransaction,
    skipNext,
    processOverdue,
    isProcessingOverdue,
  } = useRecurringTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);

  const handleCreateTransaction = (transactionData: any) => {
    createRecurringTransaction(transactionData);
  };

  const handleUpdateTransaction = (transactionId: number, updates: any) => {
    updateRecurringTransaction({ id: transactionId, data: updates });
  };

  const handleDeleteTransaction = (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      deleteRecurringTransaction(transactionId);
    }
  };

  const handleCreateNow = (transactionId: number) => {
    createTransaction(transactionId);
  };

  const handleSkipNext = (transactionId: number) => {
    skipNext(transactionId);
  };

  const handleProcessOverdue = () => {
    if (window.confirm(`Process ${overdueTransactions.length} overdue transactions?`)) {
      processOverdue();
    }
  };

  const openEditModal = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Calculate statistics
  const activeTransactions = recurringTransactions.filter((t: RecurringTransaction) => t.status === 'active');
  const monthlyIncome = activeTransactions
    .filter((t: RecurringTransaction) => t.transaction_type === 'income' && t.frequency === 'monthly')
    .reduce((sum: number, t: RecurringTransaction) => sum + t.amount, 0);
  const monthlyExpenses = activeTransactions
    .filter((t: RecurringTransaction) => t.transaction_type === 'expense' && t.frequency === 'monthly')
    .reduce((sum: number, t: RecurringTransaction) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading recurring transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 ml-0 lg:ml-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Repeat className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recurring Transactions</h1>
            <p className="text-gray-600">Manage your recurring income and expenses automatically</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <Play className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{activeTransactions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Income</span>
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Expenses</span>
            <Calendar className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Net Monthly</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className={`text-xl font-bold ${
            monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(monthlyIncome - monthlyExpenses)}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueTransactions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-900">
                  {overdueTransactions.length} Overdue Transaction{overdueTransactions.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-red-700">
                  These transactions are past due and need attention
                </p>
              </div>
            </div>
            <button
              onClick={handleProcessOverdue}
              disabled={isProcessingOverdue}
              className="btn-primary flex items-center"
            >
              {isProcessingOverdue ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Process All
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Transactions */}
      {upcomingTransactions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming (Next 30 Days)</h3>
          <div className="space-y-3">
            {upcomingTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.next_occurrence).toLocaleDateString()} • {transaction.frequency_display}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${
                    transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Recurring Transactions */}
      <div className="space-y-4">
        {recurringTransactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Repeat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring transactions yet</h3>
            <p className="text-gray-600 mb-4">
              Set up recurring income and expenses to automate your financial tracking
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Recurring Transaction
            </button>
          </div>
        ) : (
          recurringTransactions.map((transaction) => (
            <RecurringTransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={openEditModal}
              onDelete={handleDeleteTransaction}
              onCreateNow={handleCreateNow}
              onSkipNext={handleSkipNext}
            />
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <RecurringTransactionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
          editingTransaction={editingTransaction}
        />
      )}
    </div>
  );
};

export default RecurringTransactions;
