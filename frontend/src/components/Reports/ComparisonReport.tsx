import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { ComparisonReport } from '../../api/reports';

interface ComparisonReportProps {
  data?: ComparisonReport;
  isLoading: boolean;
}

const ComparisonReport: React.FC<ComparisonReportProps> = ({ data, isLoading }) => {
  const [comparisonType, setComparisonType] = useState<'monthly' | 'yearly'>('monthly');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading comparison report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No comparison data available</p>
      </div>
    );
  }

  // Prepare data for comparison chart
  const comparisonData = [
    {
      metric: 'Income',
      current: data.current_stats.income,
      previous: data.previous_stats.income,
      change: data.changes.income_change
    },
    {
      metric: 'Expenses',
      current: data.current_stats.expenses,
      previous: data.previous_stats.expenses,
      change: data.changes.expenses_change
    },
    {
      metric: 'Net',
      current: data.current_stats.net,
      previous: data.previous_stats.net,
      change: data.changes.net_change
    },
    {
      metric: 'Transactions',
      current: data.current_stats.transaction_count,
      previous: data.previous_stats.transaction_count,
      change: data.changes.transaction_count_change
    }
  ];

  // Prepare category comparison data
  const categoryData = Object.entries(data.category_comparison).map(([category, comparison]) => ({
    category,
    current: comparison.current,
    previous: comparison.previous,
    change: comparison.change
  })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 10);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Comparison Type</p>
              <p className="text-xs text-gray-500">
                {data.period_type === 'monthly' 
                  ? `Comparing ${data.current_period} vs ${data.previous_period}`
                  : `Comparing ${data.current_period} vs ${data.previous_period}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Income</span>
            {getChangeIcon(data.changes.income_change)}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(data.current_stats.income)}</p>
            <p className="text-sm text-gray-500">Previous: {formatCurrency(data.previous_stats.income)}</p>
            <p className={`text-sm font-medium ${getChangeColor(data.changes.income_change)}`}>
              {formatChange(data.changes.income_change)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Expenses</span>
            {getChangeIcon(data.changes.expenses_change)}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(data.current_stats.expenses)}</p>
            <p className="text-sm text-gray-500">Previous: {formatCurrency(data.previous_stats.expenses)}</p>
            <p className={`text-sm font-medium ${getChangeColor(data.changes.expenses_change)}`}>
              {formatChange(data.changes.expenses_change)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Net</span>
            {getChangeIcon(data.changes.net_change)}
          </div>
          <div className="space-y-1">
            <p className={`text-lg font-bold ${data.current_stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.current_stats.net)}
            </p>
            <p className="text-sm text-gray-500">
              Previous: {formatCurrency(data.previous_stats.net)}
            </p>
            <p className={`text-sm font-medium ${getChangeColor(data.changes.net_change)}`}>
              {formatChange(data.changes.net_change)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Transactions</span>
            {getChangeIcon(data.changes.transaction_count_change)}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">{data.current_stats.transaction_count}</p>
            <p className="text-sm text-gray-500">Previous: {data.previous_stats.transaction_count}</p>
            <p className={`text-sm font-medium ${getChangeColor(data.changes.transaction_count_change)}`}>
              {formatChange(data.changes.transaction_count_change)}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'Transactions' ? value : formatCurrency(value as number),
                name === 'current' ? 'Current' : 'Previous'
              ]}
            />
            <Legend />
            <Bar dataKey="current" fill="#3B82F6" name="Current" />
            <Bar dataKey="previous" fill="#9CA3AF" name="Previous" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Comparison */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Changes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Previous</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">% Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((category, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">{category.category}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {formatCurrency(category.current)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {formatCurrency(category.previous)}
                    </td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${getChangeColor(category.change)}`}>
                      {formatCurrency(category.current - category.previous)}
                    </td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${getChangeColor(category.change)}`}>
                      {formatChange(category.change)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Income Trend</h4>
            <p className="text-sm text-gray-600">
              {data.changes.income_change > 0 
                ? `Income increased by ${formatChange(data.changes.income_change)} compared to the previous period.`
                : data.changes.income_change < 0
                ? `Income decreased by ${formatChange(Math.abs(data.changes.income_change))} compared to the previous period.`
                : 'Income remained stable compared to the previous period.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Spending Trend</h4>
            <p className="text-sm text-gray-600">
              {data.changes.expenses_change > 0 
                ? `Expenses increased by ${formatChange(data.changes.expenses_change)} compared to the previous period.`
                : data.changes.expenses_change < 0
                ? `Expenses decreased by ${formatChange(Math.abs(data.changes.expenses_change))} compared to the previous period.`
                : 'Expenses remained stable compared to the previous period.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Net Cash Flow</h4>
            <p className="text-sm text-gray-600">
              {data.changes.net_change > 0 
                ? `Net cash flow improved by ${formatChange(data.changes.net_change)} compared to the previous period.`
                : data.changes.net_change < 0
                ? `Net cash flow declined by ${formatChange(Math.abs(data.changes.net_change))} compared to the previous period.`
                : 'Net cash flow remained stable compared to the previous period.'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Activity Level</h4>
            <p className="text-sm text-gray-600">
              {data.changes.transaction_count_change > 0 
                ? `Transaction activity increased by ${formatChange(data.changes.transaction_count_change)}.`
                : data.changes.transaction_count_change < 0
                ? `Transaction activity decreased by ${formatChange(Math.abs(data.changes.transaction_count_change))}.`
                : 'Transaction activity remained stable.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonReport;
