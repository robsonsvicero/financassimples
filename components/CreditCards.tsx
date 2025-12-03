import React, { useState, useMemo } from 'react';
import { CreditCard, Transaction } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCreditCard, faTrash, faPencil, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MONTH_NAMES } from '../constants';

interface CreditCardsProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddCard: (card: CreditCard) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onUpdateMultipleTransactions: (transactions: Transaction[]) => void;
}

const CreditCards: React.FC<CreditCardsProps> = ({ cards, transactions, onAddCard, onEditCard, onDeleteCard, onUpdateMultipleTransactions }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formCard, setFormCard] = useState<Partial<CreditCard>>({ color: 'bg-slate-800' });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id || null);
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

  const handleOpenAddForm = () => {
    setFormCard({ color: 'bg-slate-800' });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleOpenEditForm = (card: CreditCard) => {
    setFormCard(card);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSaveCard = () => {
    if (formCard.name && formCard.closingDay && formCard.dueDay) {
      if (isEditing && formCard.id) {
        onEditCard(formCard as CreditCard);
      } else {
        onAddCard({
          id: Math.random().toString(36).substr(2, 9),
          name: formCard.name,
          closingDay: Number(formCard.closingDay),
          dueDay: Number(formCard.dueDay),
          color: formCard.color || 'bg-slate-800',
          limit: 0
        });
      }
      setShowForm(false);
      setFormCard({ color: 'bg-slate-800' });
      setIsEditing(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão? Todas as transações futuras podem ser afetadas.')) {
      onDeleteCard(id);
      if (selectedCardId === id) {
        setSelectedCardId(cards.length > 1 ? cards.find(c => c.id !== id)?.id || null : null);
      }
    }
  };

  const getTransactionsForCard = (cardId: string, month: string) => {
    // month no formato YYYY-MM
    return transactions.filter(t => {
      if (t.creditCardId !== cardId) return false;
      // Filtrar por mês de VENCIMENTO (dueDate)
      if (t.dueDate) {
        return t.dueDate.startsWith(month);
      }
      return false;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const selectedCard = cards.find(c => c.id === selectedCardId);
  const cardTransactions = selectedCardId ? getTransactionsForCard(selectedCardId, selectedMonth) : [];

  const totalInvoice = cardTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Meus Cartões</h2>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          Novo Cartão
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-4 sm:p-6 rounded-2xl animate-slide-down">
          <h3 className="font-semibold text-gray-700 mb-4">{isEditing ? 'Editar Cartão' : 'Adicionar Cartão'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              placeholder="Nome do Cartão"
              className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
              value={formCard.name || ''}
              onChange={(e) => setFormCard({ ...formCard, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Dia Fechamento"
              className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
              value={formCard.closingDay || ''}
              onChange={(e) => setFormCard({ ...formCard, closingDay: parseInt(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Dia Vencimento"
              className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
              value={formCard.dueDay || ''}
              onChange={(e) => setFormCard({ ...formCard, dueDay: parseInt(e.target.value) })}
            />
            <select
              className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
              value={formCard.color || 'bg-slate-800'}
              onChange={(e) => setFormCard({ ...formCard, color: e.target.value })}
            >
              <option value="bg-slate-800">Preto</option>
              <option value="bg-purple-600">Roxo</option>
              <option value="bg-red-600">Vermelho</option>
              <option value="bg-blue-600">Azul</option>
              <option value="bg-orange-500">Laranja</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleSaveCard} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Cards List */}
      {cards.length === 0 ? (
        <div className="p-8 text-center bg-white/30 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Nenhum cartão cadastrado.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-4 px-4">
          {cards.map(card => (
            <div
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`flex-shrink-0 w-[calc(100vw-2rem)] sm:w-80 h-48 rounded-2xl p-6 relative overflow-hidden transition-all cursor-pointer snap-center shadow-lg ${selectedCardId === card.id ? 'ring-4 ring-offset-2 ring-violet-200 scale-[1.02]' : 'hover:scale-[1.01]'} ${card.color} text-white`}
            >
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{card.name}</h3>
                  <FontAwesomeIcon icon={faCreditCard} className="opacity-80 text-xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-70 uppercase tracking-wider">Próxima Fatura</p>
                  <p className="text-2xl font-bold tracking-tight">**** **** **** {card.id.substr(0, 4)}</p>
                </div>
                <div className="flex justify-between text-xs opacity-80 font-medium">
                  <span>Fecha dia {card.closingDay}</span>
                  <span>Vence dia {card.dueDay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Area */}
      {selectedCard && (
        <div className="glass-card rounded-2xl overflow-hidden mt-6">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-white/40">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">Fatura - {selectedCard.name}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEditForm(selectedCard)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Cartão"
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCard.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Cartão"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Selecione o mês para ver a fatura</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Navegação por Mês */}
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

                {/* Total da Fatura */}
                <div className="text-center sm:text-right sm:pl-4 sm:border-l border-gray-200 py-2 sm:py-0">
                  <p className="text-xs text-gray-500 uppercase">Total da Fatura</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">R$ {totalInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Botão Marcar Fatura como Paga */}
            {cardTransactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const allPaid = cardTransactions.every(t => t.isPaid);
                    const newStatus = !allPaid;
                    const message = newStatus
                      ? 'Marcar todas as transações desta fatura como pagas?'
                      : 'Desmarcar todas as transações desta fatura como pagas?';

                    if (window.confirm(message)) {
                      // Atualiza o status isPaid de todas as transações da fatura
                      const updatedTransactions = transactions.map(t => {
                        const isInvoiceTransaction = cardTransactions.some(ct => ct.id === t.id);
                        if (isInvoiceTransaction) {
                          return { ...t, isPaid: newStatus };
                        }
                        return t;
                      });
                      onUpdateMultipleTransactions(updatedTransactions);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-semibold ${cardTransactions.every(t => t.isPaid)
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  {cardTransactions.every(t => t.isPaid) ? '✓ Fatura Paga' : 'Marcar Fatura como Paga'}
                </button>
              </div>
            )}
          </div>

          <div className="p-0 overflow-x-auto">
            {cardTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Nenhuma compra registrada neste cartão.</div>
            ) : (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-3 sm:px-6 py-3">Data Compra</th>
                    <th className="px-3 sm:px-6 py-3">Descrição</th>
                    <th className="px-3 sm:px-6 py-3">Vencimento</th>
                    <th className="px-3 sm:px-6 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cardTransactions.map(t => {
                    const [year, month, day] = t.date.split('-');
                    const formattedDate = `${day}/${month}/${year}`;
                    const formattedDueDate = t.dueDate ? (() => {
                      const [y, m, d] = t.dueDate.split('-');
                      return `${d}/${m}/${y}`;
                    })() : '-';
                    return (
                      <tr key={t.id} className="hover:bg-white/50">
                        <td className="px-6 py-3 text-gray-600">{formattedDate}</td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-800">{t.description}</div>
                          {t.installmentTotal && <div className="text-xs text-gray-400">{t.installmentCurrent}/{t.installmentTotal}</div>}
                        </td>
                        <td className="px-6 py-3 text-gray-600 font-medium">
                          {formattedDueDate}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-gray-800">
                          R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;