import React from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrencyWithSign } from '../../utils/currency';
import type { Balance, Transaction } from '../../types';
import BalanceCard from './BalanceCard';
import { useEnvelopes } from '../../hooks/useEnvelopes';

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
  const { envelopes, summary } = useEnvelopes();
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

      {/* Envelope Status */}
      {summary && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Envelope Status</h3>
            <div className="flex items-center space-x-2">
              {summary.over_budget_count > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{summary.over_budget_count} Over Budget</span>
                </div>
              )}
              {summary.near_limit_count > 0 && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{summary.near_limit_count} Near Limit</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Budgeted</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrencyWithSign(summary.total_budgeted, true)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrencyWithSign(summary.total_spent, false)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className={`text-xl font-bold ${
                parseFloat(summary.total_remaining) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrencyWithSign(summary.total_remaining, parseFloat(summary.total_remaining) >= 0)}
              </p>
            </div>
          </div>

          {envelopes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Top Envelopes</h4>
              {envelopes.slice(0, 3).map((envelope) => (
                <div key={envelope.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {envelope.is_over_budget ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : envelope.is_near_limit ? (
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Wallet className="w-4 h-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{envelope.category_name}</p>
                      <p className="text-xs text-gray-600">
                        {envelope.percentage_used.toFixed(1)}% used
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      envelope.is_over_budget 
                        ? 'text-red-600' 
                        : envelope.is_near_limit 
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {formatCurrencyWithSign(envelope.remaining_amount, parseFloat(envelope.remaining_amount) >= 0)}
                    </p>
                    <p className="text-xs text-gray-600">
                      of {formatCurrencyWithSign(envelope.budgeted_amount, true)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                  {formatCurrencyWithSign(transaction.amount, isIncome)}
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
