import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import type { MonthlyReport } from '../../api/reports';

interface MonthlyReportProps {
  data?: MonthlyReport;
  isLoading: boolean;
  year: number;
  month: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const MonthlyReport: React.FC<MonthlyReportProps> = ({ data, isLoading, year, month }) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading monthly report...</p>
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
  const pieData = data.category_breakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  const dailyData = data.daily_breakdown.map(item => ({
    date: new Date(item.date).getDate(),
    income: item.income,
    expenses: item.expenses,
    net: item.net
  }));

  const envelopeData = data.envelope_performance.map(item => ({
    category: item.category,
    budgeted: item.budgeted,
    spent: item.spent,
    remaining: item.remaining,
    percentage: item.percentage
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
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.income)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.summary.transaction_count} transactions</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.expenses)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.category_breakdown.length} categories</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Net Income</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className={`text-2xl font-bold ${data.summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.summary.net)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.summary.net >= 0 ? 'Positive' : 'Negative'} cash flow
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Period</span>
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{data.period.month_name}</p>
          <p className="text-xs text-gray-500 mt-1">{data.period.year}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage?.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trend Line Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Cash Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
              <Line type="monotone" dataKey="net" stroke="#3B82F6" name="Net" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Envelope Performance */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={envelopeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
            <Bar dataKey="spent" fill="#EF4444" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.category_breakdown.map((category, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{category.category}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {formatCurrency(category.amount)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {category.percentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">{category.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Envelope Performance Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Envelope Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Budgeted</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.envelope_performance.map((envelope, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{envelope.category}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {formatCurrency(envelope.budgeted)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                      {formatCurrency(envelope.spent)}
                    </td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${
                      envelope.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(envelope.remaining)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        envelope.percentage <= 80 ? 'bg-green-100 text-green-800' :
                        envelope.percentage <= 100 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {envelope.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
