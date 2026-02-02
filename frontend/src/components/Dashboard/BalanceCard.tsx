import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Balance } from '../../types';

interface BalanceCardProps {
  balance: Balance;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const balanceValue = parseFloat(balance.balance);
  const isPositive = balanceValue >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Balance */}
      <div className="card md:col-span-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Total Balance</p>
            <p className={`text-3xl font-bold mt-2 ${isPositive ? '' : 'text-red-200'}`}>
              ${Math.abs(balanceValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-primary-100 text-sm mt-1">
              {isPositive ? 'Positive' : 'Negative'} Balance
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ${parseFloat(balance.monthly_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-500 text-xs mt-1">This month</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ${parseFloat(balance.monthly_expenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-500 text-xs mt-1">This month</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
