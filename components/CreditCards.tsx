import React, { useState } from 'react';
import { CreditCard, Transaction } from '../types';
import { Plus, CreditCard as CardIcon, Trash2, Pencil } from 'lucide-react';

interface CreditCardsProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddCard: (card: CreditCard) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
}

const CreditCards: React.FC<CreditCardsProps> = ({ cards, transactions, onAddCard, onEditCard, onDeleteCard }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formCard, setFormCard] = useState<Partial<CreditCard>>({ color: 'bg-slate-800' });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id || null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

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
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const selectedCard = cards.find(c => c.id === selectedCardId);
  const cardTransactions = selectedCardId ? getTransactionsForCard(selectedCardId, selectedMonth) : [];
  
  const totalInvoice = cardTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Gerar opções de mês (6 meses no passado e 6 no futuro)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const value = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800">Meus Cartões</h2>
         <button 
           onClick={handleOpenAddForm}
           className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
         >
           <Plus size={16} />
           Novo Cartão
         </button>
       </div>

       {showForm && (
         <div className="glass-card p-6 rounded-2xl animate-slide-down">
            <h3 className="font-semibold text-gray-700 mb-4">{isEditing ? 'Editar Cartão' : 'Adicionar Cartão'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <input 
                 placeholder="Nome do Cartão" 
                 className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
                 value={formCard.name || ''}
                 onChange={(e) => setFormCard({...formCard, name: e.target.value})}
               />
               <input 
                 type="number"
                 placeholder="Dia Fechamento" 
                 className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
                 value={formCard.closingDay || ''}
                 onChange={(e) => setFormCard({...formCard, closingDay: parseInt(e.target.value)})}
               />
               <input 
                 type="number"
                 placeholder="Dia Vencimento" 
                 className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
                 value={formCard.dueDay || ''}
                 onChange={(e) => setFormCard({...formCard, dueDay: parseInt(e.target.value)})}
               />
               <select 
                  className="p-3 bg-white/60 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-400 text-gray-800"
                  value={formCard.color || 'bg-slate-800'}
                  onChange={(e) => setFormCard({...formCard, color: e.target.value})}
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
         <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
           {cards.map(card => (
             <div 
               key={card.id}
               onClick={() => setSelectedCardId(card.id)}
               className={`flex-shrink-0 w-80 h-48 rounded-2xl p-6 relative overflow-hidden transition-all cursor-pointer snap-center shadow-lg ${selectedCardId === card.id ? 'ring-4 ring-offset-2 ring-violet-200 scale-[1.02]' : 'hover:scale-[1.01]'} ${card.color} text-white`}
             >
                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                     <h3 className="font-bold text-lg">{card.name}</h3>
                     <CardIcon size={24} className="opacity-80" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs opacity-70 uppercase tracking-wider">Próxima Fatura</p>
                     <p className="text-2xl font-bold tracking-tight">**** **** **** {card.id.substr(0,4)}</p>
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
            <div className="p-6 border-b border-gray-100 bg-white/40">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                   <div className="flex items-center gap-3">
                     <h3 className="font-bold text-lg text-gray-800">Fatura - {selectedCard.name}</h3>
                     <div className="flex gap-1">
                        <button 
                          onClick={() => handleOpenEditForm(selectedCard)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Editar Cartão"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(selectedCard.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Cartão"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                   </div>
                   <p className="text-sm text-gray-500">Selecione o mês para ver a fatura</p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Seletor de Mês */}
                  <div>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm font-medium text-gray-700"
                    >
                      {monthOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Total da Fatura */}
                  <div className="text-right pl-4 border-l border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Total da Fatura</p>
                    <p className="text-2xl font-bold text-slate-800">R$ {totalInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
              
              {/* Botão Marcar Fatura como Paga */}
              {cardTransactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const allPaid = cardTransactions.every(t => t.isPaid);
                      if (window.confirm(allPaid ? 'Desmarcar todas as transações desta fatura como pagas?' : 'Marcar todas as transações desta fatura como pagas?')) {
                        // TODO: Implementar atualização em massa
                        alert('Funcionalidade em desenvolvimento');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    {cardTransactions.every(t => t.isPaid) ? '✓ Fatura Paga' : 'Marcar Fatura como Paga'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-0">
               {cardTransactions.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">Nenhuma compra registrada neste cartão.</div>
               ) : (
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 text-gray-500">
                     <tr>
                       <th className="px-6 py-3">Data Compra</th>
                       <th className="px-6 py-3">Descrição</th>
                       <th className="px-6 py-3">Vencimento</th>
                       <th className="px-6 py-3 text-right">Valor</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {cardTransactions.map(t => (
                       <tr key={t.id} className="hover:bg-white/50">
                         <td className="px-6 py-3 text-gray-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                         <td className="px-6 py-3">
                           <div className="font-medium text-gray-800">{t.description}</div>
                           {t.installmentTotal && <div className="text-xs text-gray-400">{t.installmentCurrent}/{t.installmentTotal}</div>}
                         </td>
                         <td className="px-6 py-3 text-gray-600 font-medium">
                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '-'}
                         </td>
                         <td className="px-6 py-3 text-right font-medium text-gray-800">
                           R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </td>
                       </tr>
                     ))}
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