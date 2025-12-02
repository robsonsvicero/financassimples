import React from 'react';
import { LayoutDashboard, CreditCard, PieChart, FileText, Settings, User as UserIcon, LogOut, Menu } from 'lucide-react';
import { User } from '../types';
import { APP_LOGO } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onOpenNewTransaction: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, user, onLogout, onOpenNewTransaction 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);
  
  const navItems = React.useMemo(() => [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'budget', label: 'Orçamento', icon: PieChart },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Config.', icon: Settings },
  ], []);

  const handleMobileNav = React.useCallback((tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }, [setActiveTab]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-slate-800 font-sans">
      
      {/* --- Desktop Sidebar --- */}
      {!isMobile && (
      <aside className="flex flex-col w-64 glass-card m-4 rounded-3xl fixed h-[calc(100vh-2rem)] z-20">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
             <img src={APP_LOGO} alt="Logo" className="w-8 h-8 object-contain" />
             <h1 className="text-xl font-bold bg-clip-text text-green-600">
               Finanças<span className="font-light text-gray-600">$imples</span>
             </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-10">criado por Robson Svicero-Design</p>
        </div>

        {/* User Profile */}
        <div className="px-6 pb-4">
           <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full object-cover bg-white" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                  <UserIcon size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-800">{user?.name || 'Visitante'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'demo@financas.app'}</p>
              </div>
           </div>
        </div>

        {/* Botão Novo Lançamento */}
        <div className="px-6 pb-4">
          <button 
            onClick={onOpenNewTransaction}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <span className="text-xl">+</span>
            Novo Lançamento
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                      ? 'bg-violet-100 text-violet-700 font-semibold' 
                      : 'text-gray-500 hover:bg-white/40 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-violet-600' : 'text-gray-400'} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <span className="text-violet-600 font-bold">{'›'}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="p-6 border-t border-gray-200/50 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span className="font-semibold">Sair</span>
          </button>
        </div>
      </aside>
      )}

      {/* --- Mobile Header --- */}
      {isMobile && (
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg z-40 flex items-center justify-between px-4 border-b border-gray-200/80">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
           <img src={APP_LOGO} alt="Logo" className="w-8 h-8 object-contain" />
           <h1 className="text-lg font-bold bg-clip-text text-green-600">
             Finanças<span className="font-light text-gray-600">$imples</span>
           </h1>
        </div>
        <div className="w-10"></div>
      </header>
      )}

      {/* --- Mobile Sidebar --- */}
      {isMobile && (
      <div className={`fixed inset-0 z-50 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        <aside className={`flex flex-col w-64 bg-white h-full z-50 shadow-xl transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-1">
               <img src={APP_LOGO} alt="Logo" className="w-8 h-8 object-contain" />
               <h1 className="text-xl font-bold bg-clip-text text-green-600">
                 Finanças<span className="font-light text-gray-600">$imples</span>
               </h1>
            </div>
          </div>

          {/* User Profile Mobile */}
          <div className="px-6 py-4 border-b">
             <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full object-cover bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                    <UserIcon size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name || 'Visitante'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
             </div>
          </div>

          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMobileNav(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                        ? 'bg-violet-100 text-violet-700 font-semibold' 
                        : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-violet-600' : 'text-gray-400'} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && (
                        <span className="text-violet-600 font-bold">{'›'}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button Mobile */}
          <div className="p-6 border-t">
            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              <span className="font-semibold">Sair</span>
            </button>
          </div>
        </aside>
      </div>
      )}

      {/* --- Main Content Area --- */}
      <main className={`flex-1 p-4 ${isMobile ? 'pt-20' : 'pl-72 pt-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default React.memo(Layout);