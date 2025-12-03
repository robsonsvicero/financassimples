import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, CreditCard } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCreditCard, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MONTH_NAMES } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  transactions: Transaction[];
  cards: CreditCard[];
}

interface InvoiceGroup {
  id: string;
  type: 'invoice';
  cardName: string;
  dueDate: string;
  amount: number;
}

type DisplayItem = Transaction | InvoiceGroup;

const Reports: React.FC<ReportsProps> = ({ transactions, cards }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const selectedMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentDate]);

  const displayItems = useMemo(() => {
    // Filtra transações pelo mês selecionado
    const filtered = transactions.filter(t => {
      // Para transações de crédito, usa dueDate; para outras, usa date
      if (t.paymentMethod === 'CREDIT' && t.type === 'EXPENSE' && t.dueDate) {
        return t.dueDate.startsWith(selectedMonth);
      }
      return t.date.startsWith(selectedMonth);
    });

    // Separa transações de crédito e outras transações
    const creditTransactions = filtered.filter(
      t => t.paymentMethod === 'CREDIT' && t.type === 'EXPENSE' && t.creditCardId && t.dueDate
    );
    const otherTransactions = filtered.filter(
      t => !(t.paymentMethod === 'CREDIT' && t.type === 'EXPENSE' && t.creditCardId && t.dueDate)
    );

    // Agrupa transações de crédito por cartão e data de vencimento
    const invoiceMap = new Map<string, InvoiceGroup>();
    
    creditTransactions.forEach(transaction => {
      const key = `${transaction.creditCardId}-${transaction.dueDate}`;
      
      if (!invoiceMap.has(key)) {
        const card = cards.find(c => c.id === transaction.creditCardId);
        invoiceMap.set(key, {
          id: key,
          type: 'invoice',
          cardName: card?.name || 'Cartão removido',
          dueDate: transaction.dueDate!,
          amount: 0
        });
      }
      
      const invoice = invoiceMap.get(key)!;
      invoice.amount += transaction.amount;
    });

    // Combina faturas e outras transações
    const items: DisplayItem[] = [
      ...Array.from(invoiceMap.values()),
      ...otherTransactions
    ];

    // Ordena por data (dueDate para faturas, date para outras)
    items.sort((a, b) => {
      const dateA = 'dueDate' in a ? a.dueDate : a.date;
      const dateB = 'dueDate' in b ? b.dueDate : b.date;
      if (!dateA || !dateB) return 0;
      return dateB.localeCompare(dateA); // Mais recente primeiro
    });

    return items;
  }, [transactions, selectedMonth, cards]);

  const totalIn = useMemo(() => {
    return displayItems
      .filter(item => !('type' in item && item.type === 'invoice') && (item as Transaction).type === TransactionType.INCOME)
      .reduce((acc, item) => acc + (item as Transaction).amount, 0);
  }, [displayItems]);

  const totalOut = useMemo(() => {
    return displayItems.reduce((acc, item) => {
      if ('type' in item && item.type === 'invoice') {
        return acc + item.amount;
      }
      if ((item as Transaction).type === TransactionType.EXPENSE) {
        return acc + (item as Transaction).amount;
      }
      return acc;
    }, 0);
  }, [displayItems]);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Período
    doc.setFontSize(12);
    const monthName = MONTH_NAMES[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    doc.text(`Período: ${monthName} ${year}`, 14, 32);
    
    // Resumo
    doc.setFontSize(10);
    doc.text(`Entradas: R$ ${totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 42);
    doc.text(`Saídas: R$ ${totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 48);
    doc.text(`Resultado: R$ ${(totalIn - totalOut).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 54);
    
    // Tabela de transações
    const tableData = displayItems.map(item => {
      if ('type' in item && item.type === 'invoice') {
        return [
          item.dueDate.split('-').reverse().join('/'),
          item.cardName,
          'Fatura Cartão',
          `R$ ${item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          '-'
        ];
      } else {
        const transaction = item as Transaction;
        return [
          transaction.date.split('-').reverse().join('/'),
          transaction.description,
          transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa',
          transaction.type === TransactionType.INCOME 
            ? `R$ ${transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : '-',
          transaction.type === TransactionType.EXPENSE
            ? `R$ ${transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : '-'
        ];
      }
    });
    
    autoTable(doc, {
      startY: 60,
      head: [['Data', 'Descrição', 'Tipo', 'Entrada', 'Saída']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] }
    });
    
    // Salvar
    doc.save(`relatorio-${selectedMonth}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
            <p className="text-gray-500">Extrato detalhado por período</p>
          </div>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-300/50">
             <FontAwesomeIcon icon={faDownload} />
             Exportar PDF
          </button>
       </div>

       <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
             <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Período</label>
               <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                 <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0">
                   <FontAwesomeIcon icon={faChevronLeft} />
                 </button>
                 <div className="px-2 sm:px-4 py-1 text-center min-w-[120px] sm:min-w-[140px] font-medium text-gray-700 text-sm sm:text-base">
                   {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                 </div>
                 <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0">
                   <FontAwesomeIcon icon={faChevronRight} />
                 </button>
               </div>
             </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
             {/* Header like Bank Statement */}
             <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <FontAwesomeIcon icon={faCreditCard} className="text-violet-600" />
                     Extrato de Movimentação
                   </h3>
                   <span className="text-sm text-gray-500">
                     Período: {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                   </span>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                   <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="block text-green-600 font-medium">Entradas</span>
                      <span className="text-lg font-bold text-green-700">R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="block text-red-600 font-medium">Saídas</span>
                      <span className="text-lg font-bold text-red-700">R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="block text-blue-600 font-medium">Resultado</span>
                      <span className="text-lg font-bold text-blue-700">R$ {(totalIn - totalOut).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                </div>
             </div>

             {/* Table */}
             <table className="w-full text-left text-sm min-w-[500px]">
               <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                 <tr>
                   <th className="px-3 sm:px-6 py-3 font-semibold">Data</th>
                   <th className="px-3 sm:px-6 py-3 font-semibold">Descrição</th>
                   <th className="px-3 sm:px-6 py-3 text-right font-semibold">Valor</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {displayItems.map(item => {
                   // Renderizar fatura agrupada
                   if ('type' in item && item.type === 'invoice') {
                     const invoice = item as InvoiceGroup;
                     const [year, month, day] = invoice.dueDate.split('-');
                     const formattedDate = `${day}/${month}/${year}`;
                     return (
                       <tr key={invoice.id} className="hover:bg-gray-50 bg-violet-50">
                         <td className="px-6 py-3 text-gray-600">
                           {formattedDate}
                         </td>
                         <td className="px-6 py-3 font-medium text-gray-800 flex items-center gap-2">
                           <FontAwesomeIcon icon={faCreditCard} className="text-violet-600" />
                           FATURA DO CARTÃO {invoice.cardName.toUpperCase()}
                         </td>
                         <td className="px-6 py-3 text-right font-bold text-red-600">
                           - R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </td>
                       </tr>
                     );
                   }
                   
                   // Renderizar transação normal
                   const transaction = item as Transaction;
                   const [year, month, day] = transaction.date.split('-');
                   const transactionFormattedDate = `${day}/${month}/${year}`;
                   return (
                     <tr key={transaction.id} className="hover:bg-gray-50">
                       <td className="px-6 py-3 text-gray-600">
                         {transactionFormattedDate}
                       </td>
                       <td className="px-6 py-3 font-medium text-gray-800">
                         {transaction.description}
                       </td>
                       <td className={`px-6 py-3 text-right font-bold ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                         {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </td>
                     </tr>
                   );
                 })}
                 {displayItems.length === 0 && (
                   <tr>
                     <td colSpan={3} className="px-6 py-8 text-center text-gray-400">Nenhum registro encontrado.</td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default Reports;