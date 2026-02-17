import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
import * as ApiService from './services/api.mongo';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ResetPasswordLazy from './ResetPasswordLazy';

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
      // Listen for auth changes (incluindo sessão inicial)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted || !supabase) return;
        
        if (session?.user) {
          try {
            // Busca profile com timeout de 3 segundos
            const profilePromise = supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            const { data: profile } = await Promise.race([
              profilePromise,
              timeoutPromise
            ]) as any;
            
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
          } catch (error) {
            // Fallback: cria usuário sem profile
            const isAdmin = session.user.email === 'robsonsvicero@outlook.com';
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || 'Usuário',
              avatar: session.user.user_metadata?.avatar_url,
              isAdmin
            };
            setCurrentUser(user);
            loadData(user.id).catch(console.error);
          }
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

  const handleRecalculateDueDates = async () => {
    if (!currentUser) return;
    
    // Filtra apenas transações de crédito com cartão
    const creditTransactions = transactions.filter(
      t => t.paymentMethod === 'CREDIT' && t.type === 'EXPENSE' && t.creditCardId && t.date
    );

    const updatedTransactions: Transaction[] = [];

    creditTransactions.forEach(transaction => {
      const card = cards.find(c => c.id === transaction.creditCardId);
      if (!card) return;

      const purchaseDate = new Date(transaction.date + 'T12:00:00');
      const purchaseDay = purchaseDate.getDate();
      
      let targetMonth = purchaseDate.getMonth();
      let targetYear = purchaseDate.getFullYear();

      // Lógica corrigida: >= (no dia do fechamento ou depois vai para próximo mês)
      if (purchaseDay >= card.closingDay) {
        targetMonth += 1;
      }

      // Se a transação é parcelada, adiciona o offset da parcela
      if (transaction.installmentCurrent && transaction.installmentCurrent > 1) {
        targetMonth += (transaction.installmentCurrent - 1);
      }

      // Ajusta ano se necessário
      while (targetMonth > 11) {
        targetMonth -= 12;
        targetYear += 1;
      }
      while (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      const newDueDate = new Date(targetYear, targetMonth, card.dueDay).toISOString().split('T')[0];

      // Se a data mudou, adiciona à lista de atualizações
      if (transaction.dueDate !== newDueDate) {
        updatedTransactions.push({
          ...transaction,
          dueDate: newDueDate
        });
      }
    });

    // Atualiza as transações que mudaram
    if (updatedTransactions.length > 0) {
      await Promise.all(
        updatedTransactions.map(t => ApiService.updateTransaction(t))
      );
      loadData(currentUser.id);
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
            onAdd={async (cat) => {
              if (!currentUser) return;
              try {
                const newCat = await ApiService.addCategory(cat, currentUser.id);
                setCategories([...categories, { ...cat, id: newCat.id }]);
              } catch (error) {
                console.error('Error adding category:', error);
                alert('Erro ao adicionar categoria');
              }
            }}
            onEdit={async (cat) => {
              try {
                await ApiService.updateCategory(cat);
                setCategories(categories.map(c => c.id === cat.id ? cat : c));
              } catch (error) {
                console.error('Error updating category:', error);
                alert('Erro ao atualizar categoria');
              }
            }}
            onDelete={async (id) => {
              try {
                await ApiService.deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
              } catch (error) {
                console.error('Error deleting category:', error);
                alert('Erro ao deletar categoria');
              }
            }}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} cards={cards} />;
      case 'users':
        return currentUser ? <UserManagement currentUser={currentUser} /> : null;
      case 'settings':
        return <Settings user={currentUser} onUpdateUser={handleUpdateUser} onRecalculateDueDates={handleRecalculateDueDates} />;
      default:
        return <Dashboard transactions={transactions} cards={cards} onDelete={handleDeleteTransaction} />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ResetPasswordLazy />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            isLoading ? (
              <LoadingScreen />
            ) : !currentUser ? (
              <Auth
                onLogin={handleLogin}
                onRegister={handleRegister}
                onGoogleLogin={handleGoogleLogin}
                error={authError}
                onClearError={() => setAuthError('')}
              />
            ) : (
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
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
