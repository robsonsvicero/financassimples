import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CreditCard } from '../types';
import { MONTH_NAMES } from '../constants';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, Search, Filter, CreditCard as CreditCardIcon } from 'lucide-react';
import { getFinancialTip } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  cards: CreditCard[];
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, cards }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const viewMode = 'month'; // Fixed to month view for now
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    // Load tip once on mount
    getFinancialTip().then(setTip);
  }, []);

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + increment);
    } else if (viewMode === 'year') {
      newDate.setFullYear(newDate.getFullYear() + increment);
    } else {
      newDate.setDate(newDate.getDate() + increment);
    }
    setCurrentDate(newDate);
  };

  const getFilteredTransactions = () => {
    // Basic filter for Month view logic - strictly relying on Date objects for comparison
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      // For credit card expenses, we usually want to see them based on their billing cycle/invoice month?
      // Requirement says: "Spreadsheet view displaying all transactions".
      // Requirement 5 says: Aggregated invoices.
      
      // Filter by Month View Logic
      if (viewMode === 'month') {
        return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
      }
      return true; // Simplify for demo, expand for other views
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredRaw = getFilteredTransactions();

  // Aggregation Logic for Credit Cards
  const processedTransactions: any[] = [];
  const creditCardBills: Record<string, { cardId: string, amount: number, dueDate: string, count: number }> = {};

  filteredRaw.forEach(t => {
    if (t.paymentMethod === 'CREDIT' && t.creditCardId) {
      // It's a credit card transaction.
      // Based on Requirement 5: "Expenses with Credit Card... aggregated into a single entry"
      // However, usually aggregation happens based on Invoice Due Date.
      // If we are looking at specific month transactions, we list them.
      // But if we want the "Invoice" view, we group by due date.
      
      // Let's implement the aggregation for the Dashboard List
      const key = `${t.creditCardId}-${t.dueDate}`;
      if (!creditCardBills[key]) {
        creditCardBills[key] = { cardId: t.creditCardId, amount: 0, dueDate: t.dueDate || '', count: 0 };
      }
      creditCardBills[key].amount += t.amount;
      creditCardBills[key].count += 1;
    } else {
      processedTransactions.push(t);
    }
  });

  // Convert aggregated bills back to list items
  Object.values(creditCardBills).forEach(bill => {
    const card = cards.find(c => c.id === bill.cardId);
    processedTransactions.push({
      id: `bill-${bill.cardId}-${bill.dueDate}`,
      description: `Fatura Cartão ${card?.name}`,
      amount: bill.amount,
      date: bill.dueDate, // Display based on due date
      type: TransactionType.EXPENSE,
      paymentMethod: 'CREDIT',
      category: '1', // Taxas e Impostos or generic
      isAggregated: true,
      cardColor: card?.color,
      itemCount: bill.count
    });
  });

  // Sort final list by date
  const displayList = processedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Totals
  const totalIncome = displayList.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = displayList.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header / Date Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Painel</h2>
           <p className="text-gray-500 text-sm">Visão geral das suas movimentações</p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
           <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
             <ChevronLeft size={20} />
           </button>
           <div className="px-4 py-1 text-center min-w-[140px] font-medium text-gray-700">
             {viewMode === 'month' && `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
           </div>
           <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium text-sm">Receitas</span>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-red-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium text-sm">Despesas</span>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className={`glass-card p-6 rounded-2xl border-l-4 ${balance >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium text-sm">Saldo</span>
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              <Calendar size={18} />
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* AI Tip */}
      {tip && (
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl p-4 text-white shadow-lg flex items-center gap-4">
           <div className="p-2 bg-white/20 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
           </div>
           <div>
             <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Dica Inteligente</p>
             <p className="font-medium">{tip}</p>
           </div>
        </div>
      )}

      {/* Spreadsheet / List View */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/40">
           <h3 className="font-semibold text-gray-700">Transações</h3>
           <div className="flex gap-2">
             <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500">
                <Search size={18} />
             </button>
             <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500">
                <Filter size={18} />
             </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma transação encontrada neste período.
                  </td>
                </tr>
              ) : (
                displayList.map((t) => {
                  const isExpense = t.type === TransactionType.EXPENSE;
                  // const Icon = ICON_MAP[t.category] || ICON_MAP['MoreHorizontal']; // Future: display icons
                  
                  return (
                    <tr key={t.id} className="hover:bg-white/40 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">
                            {new Date(t.date).getDate()}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">
                             {new Date(t.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           {t.isAggregated ? (
                             <div className={`w-8 h-8 rounded-full ${t.cardColor || 'bg-gray-500'} flex items-center justify-center text-white`}>
                               <CreditCardIcon size={14} />
                             </div>
                           ) : (
                             <div className={`w-8 h-8 rounded-full ${isExpense ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'} flex items-center justify-center`}>
                                {isExpense ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                             </div>
                           )}
                           <div>
                             <p className="font-medium text-gray-800">{t.description}</p>
                             {t.installmentTotal && (
                               <p className="text-xs text-gray-400">
                                 Parcela {t.installmentCurrent}/{t.installmentTotal}
                               </p>
                             )}
                             {t.isAggregated && (
                                <p className="text-xs text-gray-400">{t.itemCount} transações</p>
                             )}
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         {t.isAggregated ? (
                           <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">Fatura Cartão</span>
                         ) : (
                           <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">Geral</span>
                         )}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                        {isExpense ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                         {t.isPaid || t.type === TransactionType.INCOME ? (
                           <span className="text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs">Pago</span>
                         ) : (
                           <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-full text-xs">Pendente</span>
                         )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;