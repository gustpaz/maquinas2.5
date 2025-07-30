import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { useMachineStore } from '../store/useMachineStore';
import { useAuth } from '../contexts/AuthContext';
import { MonthSelector } from './ui/MonthSelector';
import { StatCard } from './ui/StatCard';
import { RecentMachinesTable } from './tables/RecentMachinesTable';
import { AdvancedDashboard } from './dashboard/AdvancedDashboard';
import { calculateTotalsByMonth } from '../utils/calculations/totals';
import { formatCurrency } from '../utils/format';

const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { machines, fetchMachines } = useMachineStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMachines();
    }
  }, [user]);

  const { costs, revenues, profit } = calculateTotalsByMonth(machines, selectedMonth);
  const activeMachines = machines.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento Total"
          value={formatCurrency(revenues)}
          icon={<DollarSign className="text-green-600" size={24} />}
          color="green"
        />
        <StatCard
          title="Custos Totais"
          value={formatCurrency(costs)}
          icon={<TrendingDown className="text-red-600" size={24} />}
          color="red"
        />
        <StatCard
          title="Lucro Total"
          value={formatCurrency(profit)}
          icon={<TrendingUp className="text-blue-600" size={24} />}
          color="blue"
        />
        <StatCard
          title="Máquinas Ativas"
          value={activeMachines.toString()}
          icon={<Activity className="text-purple-600" size={24} />}
          color="purple"
        />
      </div>

      <AdvancedDashboard machines={machines} />
      
      <RecentMachinesTable machines={machines.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;