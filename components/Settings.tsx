import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Camera, Save, Upload } from 'lucide-react';

interface SettingsProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdateUser({ ...user, name, avatar: avatarUrl });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
       <h2 className="text-2xl font-bold text-gray-800">Configurações da Conta</h2>
       
       <div className="glass-card p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="flex flex-col items-center mb-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-violet-100 border-4 border-white shadow-lg relative flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-contain bg-white" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-violet-400 text-4xl font-bold">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <button 
                  type="button"
                  onClick={triggerFileInput}
                  className="mt-3 text-sm text-violet-600 font-medium cursor-pointer hover:text-violet-800 flex items-center gap-2 bg-transparent border-none"
                >
                  <Upload size={16} />
                  Carregar nova foto
                </button>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição</label>
               <input 
                 type="text" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none text-gray-800" 
               />
             </div>
             
             <div className="pt-4 border-t border-gray-100">
               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all">
                  <Save size={18} />
                  Salvar Alterações
               </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default Settings;