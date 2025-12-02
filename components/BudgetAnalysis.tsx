import React, { useState } from 'react';
import { Transaction, TransactionType, Category, Budget } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, EyeOff } from 'lucide-react';

interface BudgetAnalysisProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  onUpdateBudget: (budget: Budget) => void;
}

const BudgetAnalysis: React.FC<BudgetAnalysisProps> = ({ transactions, categories, budgets, onUpdateBudget }) => {
  const [showCharts, setShowCharts] = useState(false);

  // Calculate spending per category for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const spendingByCategory = categories.filter(c => c.type === 'EXPENSE' || c.type === 'BOTH').map(cat => {
    const spent = transactions
      .filter(t => t.category === cat.id && t.type === TransactionType.EXPENSE)
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
    
    const budget = budgets.find(b => b.categoryId === cat.id)?.amount || 0;
    
    return {
      id: cat.id,
      name: cat.name,
      spent,
      budget,
      remaining: budget - spent,
      color: cat.color.replace('text-', 'bg-').replace('-500', '-200'), // Quick hack for bg color
      barColor: cat.color.replace('text-', '').replace('-500', '') // Quick hack for rechart color
    };
  }).filter(item => item.spent > 0 || item.budget > 0);

  const chartData = spendingByCategory.map(item => ({
    name: item.name,
    gasto: item.spent,
    orcamento: item.budget
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
         <div>
           <h2 className="text-2xl font-bold text-gray-800">Orçamento Mensal</h2>
           <p className="text-gray-500 text-sm">Controle seus limites de gastos</p>
         </div>
         <button 
           onClick={() => setShowCharts(!showCharts)}
           className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 rounded-xl border border-violet-100 shadow-sm hover:bg-violet-50 transition-colors"
         >
           {showCharts ? <EyeOff size={18} /> : <Eye size={18} />}
           {showCharts ? 'Ocultar Gráficos' : 'Ver Análise Visual'}
         </button>
      </div>

      {showCharts && (
        <div className="glass-card p-6 rounded-2xl h-80 animate-scale-up">
           <h3 className="text-lg font-semibold text-gray-700 mb-4">Gastos vs Orçamento</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
               <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
               <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
               <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
               />
               <Bar dataKey="gasto" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Gasto Atual" />
               <Bar dataKey="orcamento" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Meta" />
             </BarChart>
           </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spendingByCategory.map(item => {
           const percent = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
           const isOver = item.spent > item.budget && item.budget > 0;
           
           return (
             <div key={item.id} className="glass-card p-5 rounded-2xl relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="font-bold text-gray-700">{item.name}</h4>
                   <p className="text-xs text-gray-400">
                     Restante: R$ {item.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="font-bold text-gray-800">R$ {item.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                   <p className="text-xs text-gray-400">de R$ {item.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </div>
               </div>

               {/* Progress Bar */}
               <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-violet-500'}`} 
                   style={{ width: `${Math.min(percent, 100)}%` }}
                 ></div>
               </div>

               {/* Quick Edit Budget Input - Simulating interaction */}
               <div className="mt-2 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="text-xs text-gray-400">Definir Meta:</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-violet-300 mt-1 text-gray-800"
                    defaultValue={item.budget}
                    onBlur={(e) => onUpdateBudget({ 
                      categoryId: item.id, 
                      amount: parseFloat(e.target.value), 
                      month: new Date().toISOString().slice(0, 7) 
                    })}
                  />
               </div>
             </div>
           );
        })}
        
        {/* Add Category Card Placeholder */}
        <button className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors bg-white/30">
           <span className="text-2xl mb-2">+</span>
           <span className="text-sm font-medium">Nova Categoria</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetAnalysis;