import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../../contexts/ToastContext';
import { Search, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    companyName: string;
    email: string;
  };
  plan: {
    name: string;
  };
}

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      showToast('error', 'Erro ao buscar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Empresa', 'Email', 'Plano', 'Valor', 'Status'];
    const rows = payments.map(payment => [
      format(new Date(payment.createdAt), 'dd/MM/yyyy'),
      payment.user.companyName,
      payment.user.email,
      payment.plan.name,
      formatCurrency(payment.amount),
      payment.status
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pagamentos.csv';
    link.click();
  };

  const filteredPayments = payments.filter(payment =>
    payment.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Histórico de Pagamentos</h2>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar pagamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3 text-gray-600">Data</th>
              <th className="pb-3 text-gray-600">Empresa</th>
              <th className="pb-3 text-gray-600">Email</th>
              <th className="pb-3 text-gray-600">Plano</th>
              <th className="pb-3 text-gray-600">Valor</th>
              <th className="pb-3 text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPayments.map(payment => (
              <tr key={payment.id}>
                <td className="py-3">
                  {format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </td>
                <td className="py-3">{payment.company_name}</td>
                <td className="py-3">{payment.email}</td>
                <td className="py-3">{payment.plan_name}</td>
                <td className="py-3">{formatCurrency(payment.amount)}</td>
                <td className="py-3">
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${payment.status === 'succeeded'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {payment.status === 'succeeded' ? 'Aprovado' :
                     payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};