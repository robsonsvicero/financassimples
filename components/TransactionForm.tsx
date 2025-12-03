import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, ExpenseType, Category, CreditCard } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCalendar } from '@fortawesome/free-solid-svg-icons';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: Transaction[]) => void;
  editingTransaction?: Transaction | null;
  onUpdate?: (transaction: Transaction) => void;
  cards: CreditCard[];
  categories: Category[];
  onAddCategory: (category: Category) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, onClose, onSave, editingTransaction, onUpdate, cards, categories 
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [date, setDate] = useState(getLocalDateString());
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [expenseType, setExpenseType] = useState<ExpenseType>(ExpenseType.VARIABLE);
  const [isPaid, setIsPaid] = useState(false);
  
  // Reset or load form when opened
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // Carregar dados da transação para edição
        setType(editingTransaction.type);
        setDescription(editingTransaction.description);
        setAmount(editingTransaction.amount.toString());
        setDate(editingTransaction.date);
        setCategoryId(editingTransaction.category);
        setPaymentMethod(editingTransaction.paymentMethod);
        setSelectedCardId(editingTransaction.creditCardId || '');
        setExpenseType(editingTransaction.expenseType || ExpenseType.VARIABLE);
        setIsPaid(editingTransaction.isPaid);
        setInstallments(1); // Não permitir edição de parcelas
      } else {
        // Limpar formulário para nova transação
        setType(TransactionType.EXPENSE);
        setDescription('');
        setAmount('');
        setDate(getLocalDateString());
        setInstallments(1);
        setCategoryId(categories[0]?.id || '');
        setPaymentMethod(PaymentMethod.DEBIT);
        setSelectedCardId('');
        setExpenseType(ExpenseType.VARIABLE);
        setIsPaid(false);
      }
    }
  }, [isOpen, editingTransaction, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId) return;

    const numAmount = parseFloat(amount.replace(',', '.')); // Handle PT-BR decimal
    
    // Se estiver editando, atualizar a transação existente
    if (editingTransaction && onUpdate) {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        description,
        amount: numAmount,
        date,
        category: categoryId,
        paymentMethod,
        creditCardId: paymentMethod === PaymentMethod.CREDIT ? selectedCardId : undefined,
        expenseType: type === TransactionType.EXPENSE ? expenseType : undefined,
        isPaid,
      };
      onUpdate(updatedTransaction);
      onClose();
      return;
    }

    const transactionsToAdd: Transaction[] = [];

    // Calculate Due Date Logic for Credit Card
    const calculateDueDate = (purchaseDateStr: string, cardId: string, monthOffset: number = 0): string => {
       const card = cards.find(c => c.id === cardId);
       if (!card) return purchaseDateStr;

       const pDate = new Date(purchaseDateStr + 'T12:00:00');
       const purchaseDay = pDate.getDate();
       
       let targetMonth = pDate.getMonth();
       let targetYear = pDate.getFullYear();

       // Billing Cycle Logic: se a compra foi no dia do fechamento ou depois, vai para o próximo mês
       if (purchaseDay >= card.closingDay) {
          targetMonth += 1;
       }
       
       // Add installment offset (cada parcela vence em um mês diferente)
       targetMonth += monthOffset;

       // Adjust for year rollover
       while (targetMonth > 11) {
         targetMonth -= 12;
         targetYear += 1;
       }
       while (targetMonth < 0) {
         targetMonth += 12;
         targetYear -= 1;
       }

       const targetDate = new Date(targetYear, targetMonth, card.dueDay);
       return targetDate.toISOString().split('T')[0];
    };

    if (paymentMethod === PaymentMethod.CREDIT && type === TransactionType.EXPENSE) {
       // Handle Installments
       const baseAmount = numAmount / installments;
       const remainder = numAmount - (Number(baseAmount.toFixed(2)) * installments);
       
       // Parent ID for grouping
       const parentId = Math.random().toString(36).substr(2, 9);

       for (let i = 0; i < installments; i++) {
          const installmentAmount = i === 0 ? baseAmount + remainder : baseAmount;
          // Due date shifts by month for each installment
          const dueDate = calculateDueDate(date, selectedCardId, i);
          
          transactionsToAdd.push({
            id: Math.random().toString(36).substr(2, 9),
            description,
            amount: Number(installmentAmount.toFixed(2)),
            date: date, // Purchase date remains same
            dueDate: dueDate,
            type,
            expenseType,
            category: categoryId,
            paymentMethod,
            creditCardId: selectedCardId,
            installmentTotal: installments > 1 ? installments : undefined,
            installmentCurrent: installments > 1 ? i + 1 : undefined,
            parentId,
            isPaid: false
          });
       }
    } else {
      // Normal Transaction
      // Auto-marcar como pago se for dinheiro, débito, PIX ou receita
      const autoPaid = type === TransactionType.INCOME || 
                       paymentMethod === PaymentMethod.CASH || 
                       paymentMethod === PaymentMethod.DEBIT || 
                       paymentMethod === PaymentMethod.PIX;
      
      transactionsToAdd.push({
        id: Math.random().toString(36).substr(2, 9),
        description,
        amount: numAmount,
        date,
        type,
        expenseType: type === TransactionType.EXPENSE ? expenseType : undefined,
        category: categoryId,
        paymentMethod,
        isPaid: autoPaid
      });
    }

    onSave(transactionsToAdd);
    onClose();
  };

  const currentCategories = categories.filter(c => c.type === 'BOTH' || c.type === type);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-100">
           <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
             <button 
               onClick={() => setType(TransactionType.INCOME)}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === TransactionType.INCOME ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
             >
               Receita
             </button>
             <button 
               onClick={() => setType(TransactionType.EXPENSE)}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
             >
               Despesa
             </button>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
             <FontAwesomeIcon icon={faXmark} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           {/* Amount */}
           <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Valor</label>
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-lg font-semibold text-gray-800"
                  placeholder="0,00"
                  required
                />
             </div>
           </div>

           {/* Description */}
           <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
             <input 
               type="text" 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
               placeholder="Ex: Supermercado"
               required
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Data</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm text-gray-800"
                  />
                </div>
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Categoria</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm appearance-none text-gray-800"
                >
                   {currentCategories.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                </select>
              </div>
           </div>

           {type === TransactionType.EXPENSE && (
             <div className="space-y-4 pt-2 border-t border-gray-100">
               
               {/* Expense Type */}
               <div className="flex gap-4">
                 <label className="flex items-center gap-2 text-sm text-gray-600">
                   <input 
                     type="radio" 
                     name="expenseType" 
                     checked={expenseType === ExpenseType.FIXED}
                     onChange={() => setExpenseType(ExpenseType.FIXED)}
                     className="text-violet-600 focus:ring-violet-500"
                   />
                   Fixa
                 </label>
                 <label className="flex items-center gap-2 text-sm text-gray-600">
                   <input 
                     type="radio" 
                     name="expenseType" 
                     checked={expenseType === ExpenseType.VARIABLE}
                     onChange={() => setExpenseType(ExpenseType.VARIABLE)}
                     className="text-violet-600 focus:ring-violet-500"
                   />
                   Variável
                 </label>
               </div>

               {/* Payment Method */}
               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Método de Pagamento</label>
                 <div className="grid grid-cols-4 gap-2">
                    {[PaymentMethod.CASH, PaymentMethod.DEBIT, PaymentMethod.PIX, PaymentMethod.CREDIT].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium border ${
                          paymentMethod === m 
                          ? 'bg-violet-50 border-violet-500 text-violet-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {m === 'CASH' ? 'Dinheiro' : m === 'DEBIT' ? 'Débito' : m === 'PIX' ? 'PIX' : 'Crédito'}
                      </button>
                    ))}
                 </div>
               </div>

               {/* Credit Card Specifics */}
               {paymentMethod === PaymentMethod.CREDIT && (
                 <div className="bg-violet-50 p-4 rounded-xl space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-violet-700 uppercase mb-1">Cartão</label>
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="w-full p-2 rounded-lg border border-violet-200 text-sm focus:ring-violet-500 text-gray-800"
                        required
                      >
                        <option value="">Selecione um cartão</option>
                        {cards.map(card => (
                          <option key={card.id} value={card.id}>{card.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-violet-700 uppercase mb-1">Parcelas</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-violet-200 text-sm focus:ring-violet-500 text-gray-800"
                      >
                         <option value={1}>À vista (1x)</option>
                         {[...Array(11)].map((_, i) => (
                           <option key={i+2} value={i+2}>{i+2}x</option>
                         ))}
                      </select>
                    </div>
                    {installments > 1 && (
                      <p className="text-xs text-violet-600 italic">
                        * O valor será dividido e as datas de vencimento ajustadas automaticamente.
                      </p>
                    )}
                    
                    {/* Marcar como Pago (para faturas de crédito) */}
                    {editingTransaction && (
                      <div className="pt-2">
                        <label className="flex items-center gap-2 text-sm text-violet-700">
                          <input
                            type="checkbox"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                            className="rounded text-violet-600 focus:ring-violet-500"
                          />
                          Marcar como pago
                        </label>
                      </div>
                    )}
                 </div>
               )}

             </div>
           )}

           <button 
             type="submit" 
             className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98]"
           >
             {editingTransaction ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;