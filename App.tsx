import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, CreditCard, Budget, Category } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import CreditCards from './components/CreditCards';
import BudgetAnalysis from './components/BudgetAnalysis';
import Reports from './components/Reports';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import Auth from './components/Auth';
import LoadingScreen from './components/LoadingScreen';
import TransactionsManager from './components/TransactionsManager';
import CategoriesManager from './components/CategoriesManager';
import { supabase } from './services/supabaseClient';
import * as ApiService from './services/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [authError, setAuthError] = useState('');
  
  // App Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // 1. Check active session on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadingTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        setIsLoading(false);
      }
    }, 3000);
    
    if (supabase) {
      // Verifica sessão inicial
      const checkInitialSession = async () => {
        try {
          if (!supabase) return;
          console.log('[checkInitialSession] Verificando sessão...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('[checkInitialSession] Sessão:', session?.user?.email, 'Erro:', sessionError);
          if (!isMounted) return;
          
          if (session?.user) {
            console.log('[checkInitialSession] Buscando profile...');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            console.log('[checkInitialSession] Profile:', profile, 'Erro:', profileError);
            
            const isAdmin = session.user.email === 'robsonsvicero@outlook.com';
            
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata?.name || 'Usuário',
              avatar: profile?.avatar_url,
              isAdmin
            };
            
            console.log('[checkInitialSession] Usuário construído:', user);
            setCurrentUser(user);
            loadData(user.id).catch(console.error);
          } else {
            console.log('[checkInitialSession] Sem sessão ativa');
          }
        } catch (error) {
          console.error('[checkInitialSession] Erro:', error);
        }
      };
      
      checkInitialSession();
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted || !supabase) return;
        
        if (session?.user) {
          // Busca profile separadamente
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const isAdmin = session.user.email === 'robsonsvicero@outlook.com';
          
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || 'Usuário',
            avatar: profile?.avatar_url,
            isAdmin
          };
          
          setCurrentUser(user);
          loadData(user.id).catch(console.error);
        } else {
          setCurrentUser(null);
          setTransactions([]);
          setCards([]);
          setBudgets([]);
          setCategories([]);
        }
      });
      
      return () => {
        isMounted = false;
        clearTimeout(loadingTimeout);
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
    };
  }, []);

  const loadData = useCallback(async (userId: string) => {
    try {
      const data = await ApiService.fetchData(userId);
      setTransactions(data.transactions || []);
      setCards(data.cards || []);
      setCategories(data.categories || []);
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setTransactions([]);
      setCards([]);
      setCategories([]);
      setBudgets([]);
    }
  }, []);

  const handleLogin = useCallback(async (email: string, pass: string) => {
    if (!supabase) {
      const errorMsg = 'Supabase não configurado';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
    try {
      setAuthError('');
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao fazer login';
      setAuthError(errorMsg);
      throw err;
    }
  }, []);

  const handleRegister = useCallback(async (name: string, email: string, pass: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setAuthError('');
      alert('Cadastro realizado! Verifique seu email se necessário ou faça login.');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao cadastrar');
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao conectar com Google');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await ApiService.signOut();
      setCurrentUser(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await ApiService.updateUserProfile(updatedUser.id, updatedUser.name, updatedUser.avatar || '');
      setCurrentUser(updatedUser);
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  // --- CRUD Operations ---

  const handleSaveTransactions = async (newTransactions: Transaction[]) => {
    if (!currentUser) return;
    try {
      setTransactions(prev => [...prev, ...newTransactions]);
      await ApiService.addTransactions(newTransactions, currentUser.id);
      loadData(currentUser.id); 
    } catch (error) {
      console.error("Error saving transaction", error);
      alert("Erro ao salvar transação");
      loadData(currentUser.id);
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
      await ApiService.updateTransaction(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction", error);
      alert("Erro ao atualizar transação");
    }
  };

  const handleUpdateMultipleTransactions = async (updatedTransactions: Transaction[]) => {
    try {
      // Atualiza o estado local primeiro
      setTransactions(updatedTransactions);
      
      // Atualiza cada transação no banco de dados
      await Promise.all(
        updatedTransactions.map(transaction => ApiService.updateTransaction(transaction))
      );
    } catch (error) {
      console.error("Error updating transactions", error);
      alert("Erro ao atualizar transações");
      // Recarrega os dados em caso de erro
      if (currentUser) loadData(currentUser.id);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      setTransactions(prev => prev.filter(t => t.id !== id));
      await ApiService.deleteTransaction(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCard = async (card: CreditCard) => {
    if (!currentUser) return;
    try {
      const newCardRecord = await ApiService.addCard(card, currentUser.id);
      const newCard: CreditCard = {
        id: newCardRecord.id,
        name: newCardRecord.name,
        closingDay: newCardRecord.closing_day,
        dueDay: newCardRecord.due_day,
        color: newCardRecord.color,
        limit: newCardRecord.limit_amount
      };
      setCards(prev => [...prev, newCard]);
    } catch (error) {
      console.error("Error adding card", error);
    }
  };

  const handleEditCard = async (updatedCard: CreditCard) => {
    try {
      setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
      await ApiService.updateCard(updatedCard);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      setCards(prev => prev.filter(c => c.id !== id));
      await ApiService.deleteCard(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateBudget = async (budget: Budget) => {
    if (!currentUser) return;
    try {
      setBudgets(prev => {
        const existing = prev.findIndex(b => b.categoryId === budget.categoryId && b.month === budget.month);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = budget;
          return updated;
        }
        return [...prev, budget];
      });
      await ApiService.upsertBudget(budget, currentUser.id);
    } catch (error) {
      console.error(error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} cards={cards} onDelete={handleDeleteTransaction} />;
      case 'cards':
        return (
          <CreditCards 
            cards={cards} 
            transactions={transactions} 
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onUpdateMultipleTransactions={handleUpdateMultipleTransactions}
          />
        );
      case 'budget':
        return <BudgetAnalysis transactions={transactions} categories={categories} budgets={budgets} onUpdateBudget={handleUpdateBudget} />;
      case 'transactions':
        return (
          <TransactionsManager
            transactions={transactions}
            categories={categories}
            cards={cards}
            onEdit={(t) => {
              setEditingTransaction(t);
              setTransactionModalOpen(true);
            }}
            onDelete={handleDeleteTransaction}
          />
        );
      case 'categories':
        return (
          <CategoriesManager
            categories={categories}
            onAdd={(cat) => {
              const newCat = { ...cat, id: Date.now().toString() };
              setCategories([...categories, newCat]);
            }}
            onEdit={(cat) => {
              setCategories(categories.map(c => c.id === cat.id ? cat : c));
            }}
            onDelete={(id) => {
              setCategories(categories.filter(c => c.id !== id));
            }}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} cards={cards} />;
      case 'users':
        return currentUser ? <UserManagement currentUser={currentUser} /> : null;
      case 'settings':
        return <Settings user={currentUser} onUpdateUser={handleUpdateUser} />;
      default:
        return <Dashboard transactions={transactions} cards={cards} onDelete={handleDeleteTransaction} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return (
      <Auth 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        onGoogleLogin={handleGoogleLogin}
        error={authError} 
        onClearError={() => setAuthError('')} 
      />
    );
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser}
        onLogout={handleLogout}
        onOpenNewTransaction={() => setTransactionModalOpen(true)}
      >
        {renderContent()}
      </Layout>
      
      <TransactionForm 
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransactions}
        editingTransaction={editingTransaction}
        onUpdate={handleUpdateTransaction}
        cards={cards}
        categories={categories}
        onAddCategory={(cat) => setCategories(prev => [...prev, cat])}
      />
    </>
  );
};

export default App;
