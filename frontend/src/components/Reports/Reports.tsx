import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, FileText, PieChart, LineChart } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { formatCurrency } from '../../utils/currency';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';
import ComparisonReport from './ComparisonReport';
import ExportModal from './ExportModal';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'comparison'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { useMonthlyReport, useYearlyReport, useComparisonReport, exportData, isExporting } = useReports();

  const { data: monthlyReport, isLoading: monthlyLoading } = useMonthlyReport(selectedYear, selectedMonth);
  const { data: yearlyReport, isLoading: yearlyLoading } = useYearlyReport(selectedYear);
  const { data: comparisonReport, isLoading: comparisonLoading } = useComparisonReport();

  const handleExport = (format: 'csv' | 'json', startDate?: string, endDate?: string) => {
    exportData(format, startDate, endDate);
    setIsExportModalOpen(false);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6 ml-0 lg:ml-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-50">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Insights</h1>
            <p className="text-gray-600">Analyze your financial trends and patterns</p>
          </div>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="btn-primary flex items-center"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Date Selectors */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {activeTab === 'monthly' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monthly'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Monthly Report</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('yearly')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'yearly'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Yearly Report</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comparison'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Comparison</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Report Content */}
      <div className="min-h-[600px]">
        {activeTab === 'monthly' && (
          <MonthlyReport
            data={monthlyReport}
            isLoading={monthlyLoading}
            year={selectedYear}
            month={selectedMonth}
          />
        )}

        {activeTab === 'yearly' && (
          <YearlyReport
            data={yearlyReport}
            isLoading={yearlyLoading}
            year={selectedYear}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonReport
            data={comparisonReport}
            isLoading={comparisonLoading}
          />
        )}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default Reports;
