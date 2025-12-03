import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, CreditCard } from '../types';
import { MONTH_NAMES } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faArrowTrendUp, faArrowTrendDown, faCalendar, faSearch, faFilter, faCreditCard, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { getFinancialTip } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  cards: CreditCard[];
  onDelete: (id: string) => void;
}

interface InvoiceGroup {
  id: string;
  type: 'invoice';
  cardId: string;
  cardName: string;
  cardColor: string;
  dueDate: string;
  amount: number;
  count: number;
  isPaid: boolean;
}

type DisplayItem = Transaction | InvoiceGroup;

const Dashboard: React.FC<DashboardProps> = ({ transactions, cards }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const viewMode = 'month';
  const [tip, setTip] = useState<string>('');
  const [tipLoaded, setTipLoaded] = useState(false);

  useEffect(() => {
    if (!tipLoaded) {
      getFinancialTip().then((receivedTip) => {
        setTip(receivedTip);
        setTipLoaded(true);
      });
    }
  }, [tipLoaded]);

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + increment);
    }
    setCurrentDate(newDate);
  };

  // Obtém o mês atual no formato YYYY-MM
  const currentMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentDate]);

  const displayList = useMemo(() => {
    // Filtra transações pelo mês selecionado
    const filtered = transactions.filter(t => {
      // Para transações de crédito, usa dueDate; para outras, usa date
      if (t.paymentMethod === 'CREDIT' && t.type === 'EXPENSE' && t.dueDate) {
        return t.dueDate.startsWith(currentMonth);
      }
      return t.date.startsWith(currentMonth);
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
          cardId: transaction.creditCardId!,
          cardName: card?.name || 'Cartão removido',
          cardColor: card?.color || 'bg-gray-500',
          dueDate: transaction.dueDate!,
          amount: 0,
          count: 0,
          isPaid: true
        });
      }
      
      const invoice = invoiceMap.get(key)!;
      invoice.amount += transaction.amount;
      invoice.count += 1;
      if (!transaction.isPaid) {
        invoice.isPaid = false;
      }
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
      return dateB.localeCompare(dateA);
    });

    return items;
  }, [transactions, currentMonth, cards]);

  // Totals
  const totalIncome = useMemo(() => {
    return displayList
      .filter(item => !('type' in item && item.type === 'invoice') && (item as Transaction).type === TransactionType.INCOME)
      .reduce((acc, item) => acc + (item as Transaction).amount, 0);
  }, [displayList]);

  const totalExpense = useMemo(() => {
    return displayList.reduce((acc, item) => {
      if ('type' in item && item.type === 'invoice') {
        return acc + item.amount;
      }
      if ((item as Transaction).type === TransactionType.EXPENSE) {
        return acc + (item as Transaction).amount;
      }
      return acc;
    }, 0);
  }, [displayList]);

  const balance = totalIncome - totalExpense;

  const getDateParts = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    // Cria a data em horário local para evitar problemas de timezone
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    return {
      day,
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' })
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header / Date Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Painel</h2>
           <p className="text-gray-500 text-sm">Visão geral das suas movimentações</p>
        </div>

        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
           <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0">
             <FontAwesomeIcon icon={faChevronLeft} />
           </button>
           <div className="px-2 sm:px-4 py-1 text-center min-w-[120px] sm:min-w-[140px] font-medium text-gray-700 text-sm sm:text-base">
             {viewMode === 'month' && `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
           </div>
           <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0">
             <FontAwesomeIcon icon={faChevronRight} />
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium text-sm">Receitas</span>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <FontAwesomeIcon icon={faArrowTrendUp} />
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
              <FontAwesomeIcon icon={faArrowTrendDown} />
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
              <FontAwesomeIcon icon={faCalendar} />
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
             <FontAwesomeIcon icon={faWandMagicSparkles} size="lg" />
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
                <FontAwesomeIcon icon={faSearch} />
             </button>
             <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500">
                <FontAwesomeIcon icon={faFilter} />
             </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-[600px]">
            <thead className="bg-gray-50/50 text-gray-500 font-medium uppercase text-xs tracking-wider">
              <tr>
                <th className="px-3 sm:px-6 py-4">Data</th>
                <th className="px-3 sm:px-6 py-4">Descrição</th>
                <th className="px-3 sm:px-6 py-4">Categoria</th>
                <th className="px-3 sm:px-6 py-4 text-right">Valor</th>
                <th className="px-3 sm:px-6 py-4 text-center">Status</th>
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
                displayList.map((item) => {
                  // Renderizar fatura agrupada
                  if ('type' in item && item.type === 'invoice') {
                    const invoice = item as InvoiceGroup;
                    return (
                      <tr key={invoice.id} className="hover:bg-white/40 transition-colors group bg-violet-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">
                              {getDateParts(invoice.dueDate).day}
                            </span>
                            <span className="text-xs text-gray-400 uppercase">
                               {getDateParts(invoice.dueDate).weekday}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full ${invoice.cardColor} flex items-center justify-center text-white`}>
                               <FontAwesomeIcon icon={faCreditCard} />
                             </div>
                             <div>
                               <p className="font-medium text-gray-800">FATURA DO CARTÃO {invoice.cardName.toUpperCase()}</p>
                               <p className="text-xs text-gray-400">{invoice.count} transações</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 rounded-md bg-violet-100 text-xs font-medium text-violet-700">Fatura Cartão</span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-red-600">
                          - R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                           {invoice.isPaid ? (
                             <span className="text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs">Paga</span>
                           ) : (
                             <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-full text-xs">Pendente</span>
                           )}
                        </td>
                      </tr>
                    );
                  }

                  // Renderizar transação normal
                  const transaction = item as Transaction;
                  const isExpense = transaction.type === TransactionType.EXPENSE;
                  const dateParts = getDateParts(transaction.date);
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-white/40 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">
                            {dateParts.day}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">
                             {dateParts.weekday}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full ${isExpense ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'} flex items-center justify-center`}>
                              {isExpense ? <FontAwesomeIcon icon={faArrowTrendDown} /> : <FontAwesomeIcon icon={faArrowTrendUp} />}
                           </div>
                           <div>
                             <p className="font-medium text-gray-800">{transaction.description}</p>
                             {transaction.installmentTotal && transaction.installmentTotal > 1 && (
                               <p className="text-xs text-gray-400">
                                 Parcela {transaction.installmentCurrent}/{transaction.installmentTotal}
                               </p>
                             )}
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                           {transaction.paymentMethod === 'CASH' && 'Dinheiro'}
                           {transaction.paymentMethod === 'DEBIT' && 'Débito'}
                           {transaction.paymentMethod === 'PIX' && 'PIX'}
                           {transaction.paymentMethod === 'CREDIT' && 'Crédito'}
                         </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                        {isExpense ? '-' : '+'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                         {transaction.isPaid || transaction.type === TransactionType.INCOME ? (
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