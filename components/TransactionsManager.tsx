import React, { useState, useMemo } from 'react';
import { Transaction, Category, CreditCard } from '../types';
import { Pencil, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { ICON_MAP } from '../constants';

interface TransactionsManagerProps {
  transactions: Transaction[];
  categories: Category[];
  cards: CreditCard[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  categories,
  cards,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterMonth, setFilterMonth] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || t.type === filterType;
      const matchesMonth = !filterMonth || t.date.startsWith(filterMonth);
      return matchesSearch && matchesType && matchesMonth;
    });
  }, [transactions, searchTerm, filterType, filterMonth]);

  const getCategoryName = (category: string) => {
    return categories.find(c => c.id === category)?.name || 'Sem categoria';
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    if (!cat?.icon) return null;
    const IconComponent = ICON_MAP[cat.icon];
    return IconComponent ? <IconComponent size={16} className={cat.color} /> : null;
  };

  const getCardName = (cardId?: string) => {
    if (!cardId) return '-';
    return cards.find(c => c.id === cardId)?.name || 'Cartão removido';
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
            {filteredTransactions.length} transação(ões) encontrada(s)
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

          {/* Filtro por mês */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <p className="text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
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
                      {transaction.paymentMethod === 'CREDIT' && transaction.creditCardId && (
                        <>
                          <span>•</span>
                          <span>{getCardName(transaction.creditCardId)}</span>
                        </>
                      )}
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
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsManager;
