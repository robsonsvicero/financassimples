import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Download, FileText } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filtered = transactions.filter(t => {
     return t.date >= startDate && t.date <= endDate;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIn = filtered.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
            <p className="text-gray-500">Extrato detalhado por período</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-300/50">
             <Download size={18} />
             Exportar PDF
          </button>
       </div>

       <div className="glass-card p-6 rounded-2xl">
          <div className="flex gap-4 mb-6">
             <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Início</label>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fim</label>
               <input 
                 type="date" 
                 max={new Date().toISOString().split('T')[0]}
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
               />
             </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
             {/* Header like Bank Statement */}
             <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <FileText size={20} className="text-violet-600" />
                     Extrato de Movimentação
                   </h3>
                   <span className="text-sm text-gray-500">Período: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
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
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                 <tr>
                   <th className="px-6 py-3 font-semibold">Data</th>
                   <th className="px-6 py-3 font-semibold">Descrição</th>
                   <th className="px-6 py-3 text-right font-semibold">Valor</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {filtered.map(t => (
                   <tr key={t.id} className="hover:bg-gray-50">
                     <td className="px-6 py-3 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                     <td className="px-6 py-3 font-medium text-gray-800">{t.description}</td>
                     <td className={`px-6 py-3 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                       {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </td>
                   </tr>
                 ))}
                 {filtered.length === 0 && (
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