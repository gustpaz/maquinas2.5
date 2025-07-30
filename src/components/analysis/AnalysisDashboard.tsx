import React, { useState } from 'react';
import MonthlyAnalysis from './MonthlyAnalysis';
import OverallAnalysis from './OverallAnalysis';

const AnalysisDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'overall'>('monthly');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'monthly'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Análise Mensal
        </button>
        <button
          onClick={() => setActiveTab('overall')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'overall'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Análise Geral
        </button>
      </div>

      {/* Content */}
      {activeTab === 'monthly' ? <MonthlyAnalysis /> : <OverallAnalysis />}
    </div>
  );
};

export default AnalysisDashboard;