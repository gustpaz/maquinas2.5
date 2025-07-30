import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Machine } from '../../types/machine';
import { calculateMachinePerformance } from '../../utils/calculations/performance';
import { Button } from '../ui/Button';
import { FileDown } from 'lucide-react';

interface PDFReportProps {
  machines: Machine[];
  month: number;
  year: number;
}

export const PDFReport: React.FC<PDFReportProps> = ({ machines, month, year }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const performance = calculateMachinePerformance(machines);
    
    // Título
    doc.setFontSize(20);
    doc.text(
      `Relatório Mensal - ${format(new Date(year, month), 'MMMM/yyyy', { locale: ptBR })}`,
      20,
      20
    );

    // Resumo
    doc.setFontSize(12);
    const totalRevenue = performance.reduce((acc, m) => acc + m.totalRevenue, 0);
    const totalCosts = performance.reduce((acc, m) => acc + m.totalCosts, 0);
    const totalProfit = totalRevenue - totalCosts;

    doc.text(`Receita Total: R$ ${totalRevenue.toFixed(2)}`, 20, 40);
    doc.text(`Custos Totais: R$ ${totalCosts.toFixed(2)}`, 20, 50);
    doc.text(`Lucro Total: R$ ${totalProfit.toFixed(2)}`, 20, 60);

    // Tabela de Máquinas
    const tableData = performance.map(machine => [
      machine.name,
      `R$ ${machine.totalRevenue.toFixed(2)}`,
      `R$ ${machine.totalCosts.toFixed(2)}`,
      `R$ ${machine.profit.toFixed(2)}`,
      `${machine.profitMargin.toFixed(2)}%`,
      machine.status === 'active' ? 'Ativa' :
      machine.status === 'maintenance' ? 'Manutenção' :
      'Inativa'
    ]);

    (doc as any).autoTable({
      startY: 70,
      head: [['Máquina', 'Receita', 'Custos', 'Lucro', 'Margem', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Salvar PDF
    doc.save(`relatorio-${format(new Date(year, month), 'MM-yyyy')}.pdf`);
  };

  return (
    <Button
      onClick={generatePDF}
      icon={FileDown}
      className="w-full md:w-auto"
    >
      Gerar Relatório PDF
    </Button>
  );
};