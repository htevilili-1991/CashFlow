import React from 'react';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Balance, Transaction } from '../../types';
import BalanceCard from './BalanceCard';

interface DashboardProps {
  balance: Balance;
  recentTransactions: Transaction[];
  onAddTransaction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  balance, 
  recentTransactions, 
  onAddTransaction 
}) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <button
          onClick={onAddTransaction}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Balance Cards */}
      <BalanceCard balance={balance} />

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.slice(0, 5).map((transaction) => {
            const isIncome = transaction.transaction_type === 'income';
            const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon className={`w-5 h-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })}
          
          {recentTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet. Start by adding your first transaction!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
