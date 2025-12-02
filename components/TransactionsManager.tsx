import React, { useState, useMemo } from 'react';
import { Transaction, Category, CreditCard } from '../types';
import { Pencil, Trash2, Search, Filter, CreditCard as CreditCardIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { ICON_MAP, MONTH_NAMES } from '../constants';

interface TransactionsManagerProps {
  transactions: Transaction[];
  categories: Category[];
  cards: CreditCard[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

interface InvoiceGroup {
  id: string;
  type: 'invoice';
  cardId: string;
  cardName: string;
  dueDate: string;
  amount: number;
  transactions: Transaction[];
  isPaid: boolean;
}

type DisplayItem = Transaction | InvoiceGroup;

const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  categories,
  cards,
  onEdit,
  onDelete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());

  const changeDate = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const filterMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentDate]);

  const displayItems = useMemo(() => {
    // Primeiro, filtra as transações
    let filtered = transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || t.type === filterType;
      return matchesSearch && matchesType;
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
          dueDate: transaction.dueDate!,
          amount: 0,
          transactions: [],
          isPaid: true // Será atualizado
        });
      }
      
      const invoice = invoiceMap.get(key)!;
      invoice.amount += transaction.amount;
      invoice.transactions.push(transaction);
      // Se alguma transação não está paga, a fatura não está paga
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
      return dateB.localeCompare(dateA); // Mais recente primeiro
    });

    // Aplica filtro de mês
    if (filterMonth) {
      return items.filter(item => {
        const date = 'dueDate' in item ? item.dueDate : item.date;
        return date ? date.startsWith(filterMonth) : false;
      });
    }

    return items;
  }, [transactions, searchTerm, filterType, filterMonth, cards]);

  const toggleInvoice = (invoiceId: string) => {
    setExpandedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const getCategoryName = (category: string) => {
    return categories.find(c => c.id === category)?.name || 'Sem categoria';
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    if (!cat?.icon) return null;
    const IconComponent = ICON_MAP[cat.icon];
    return IconComponent ? <IconComponent size={16} className={cat.color} /> : null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Transações</h2>
          <p className="text-sm text-gray-500 mt-1">
            {displayItems.length} item(ns) encontrado(s)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar transação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none appearance-none bg-white"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </select>
          </div>

          {/* Navegação por mês */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-1 text-center min-w-[140px] font-medium text-gray-700">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-3">
        {displayItems.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <p className="text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ) : (
          displayItems.map((item) => {
            // Renderizar fatura agrupada
            if ('type' in item && item.type === 'invoice') {
              const invoice = item as InvoiceGroup;
              const isExpanded = expandedInvoices.has(invoice.id);
              
              return (
                <div key={invoice.id} className="space-y-2">
                  {/* Cabeçalho da Fatura */}
                  <div className="glass-card p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between gap-4">
                      {/* Info Principal */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                          <CreditCardIcon size={20} className="text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            FATURA DO CARTÃO {invoice.cardName.toUpperCase()}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>Vencimento: {formatDate(invoice.dueDate)}</span>
                            <span>•</span>
                            <span>{invoice.transactions.length} transação(ões)</span>
                            {invoice.isPaid && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Paga</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            - {formatCurrency(invoice.amount)}
                          </p>
                        </div>

                        {/* Botão Expandir */}
                        <button
                          onClick={() => toggleInvoice(invoice.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={isExpanded ? "Recolher" : "Expandir"}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transações da Fatura (Expandido) */}
                  {isExpanded && (
                    <div className="ml-8 space-y-2">
                      {invoice.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="glass-card p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {getCategoryIcon(transaction.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-700 truncate text-sm">
                                  {transaction.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                  <span>{getCategoryName(transaction.category)}</span>
                                  <span>•</span>
                                  <span>Compra: {formatDate(transaction.date)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Valor e Ações */}
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-gray-700 text-sm">
                                {formatCurrency(transaction.amount)}
                              </p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => onEdit(transaction)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
                                      onDelete(transaction.id);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Renderizar transação normal
            const transaction = item as Transaction;
            return (
              <div
                key={transaction.id}
                className="glass-card p-4 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Info Principal */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{getCategoryName(transaction.category)}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                        <span>•</span>
                        <span>
                          {transaction.paymentMethod === 'CASH' && 'Dinheiro'}
                          {transaction.paymentMethod === 'DEBIT' && 'Débito'}
                          {transaction.paymentMethod === 'PIX' && 'PIX'}
                          {transaction.paymentMethod === 'CREDIT' && 'Crédito'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'INCOME'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.installmentTotal && transaction.installmentTotal > 1 && (
                        <p className="text-xs text-gray-500">
                          {transaction.installmentCurrent}/{transaction.installmentTotal}x
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
                            onDelete(transaction.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionsManager;
