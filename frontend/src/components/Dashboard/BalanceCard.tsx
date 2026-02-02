import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { Balance } from '../../types';

interface BalanceCardProps {
  balance: Balance;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Balance */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Total Balance</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(balance.balance)}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(balance.monthly_income)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <ArrowUpRight className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(balance.monthly_expenses)}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <ArrowDownRight className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
