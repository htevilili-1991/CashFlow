import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { YearlyReport } from '../../api/reports';

interface YearlyReportProps {
  data?: YearlyReport;
  isLoading: boolean;
  year: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const YearlyReport: React.FC<YearlyReportProps> = ({ data, isLoading, year }) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading yearly report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available for this period</p>
      </div>
    );
  }

  // Prepare data for charts
  const monthlyData = data.monthly_breakdown.map(item => ({
    month: item.month_name.substring(0, 3), // Short month name
    income: item.income,
    expenses: item.expenses,
    net: item.net
  }));

  const topCategoriesData = data.top_categories.map(item => ({
    category: item.category,
    amount: item.total
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Income</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.total_income)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.summary.transaction_count} transactions</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.total_expenses)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.top_categories.length} categories</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Net Income</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className={`text-2xl font-bold ${data.summary.total_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.summary.total_net)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.summary.total_net >= 0 ? 'Positive' : 'Negative'} cash flow
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Period</span>
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{data.period.year}</p>
          <p className="text-xs text-gray-500 mt-1">Full year</p>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" strokeWidth={2} />
            <Line type="monotone" dataKey="net" stroke="#3B82F6" name="Net" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCategoriesData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="amount" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Summary Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Income</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.monthly_breakdown.map((month, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{month.month_name}</td>
                    <td className="px-4 py-2 text-sm text-right text-green-600">
                      {formatCurrency(month.income)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-red-600">
                      {formatCurrency(month.expenses)}
                    </td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${
                      month.net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Trends */}
      {data.category_trends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Trends</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jan</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Feb</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mar</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Apr</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">May</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jun</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jul</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aug</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sep</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Oct</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Nov</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Dec</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.category_trends.slice(0, 10).map((category, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">{category.category}</td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <td key={month} className="px-4 py-2 text-sm text-right text-gray-900">
                        {formatCurrency((category[`month_${month}`] as number) || 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yearly Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Yearly Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Average Monthly Income</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(data.summary.total_income / 12)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Average Monthly Expenses</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(data.summary.total_expenses / 12)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Average Monthly Net</p>
            <p className={`text-xl font-bold ${data.summary.total_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.summary.total_net / 12)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyReport;
