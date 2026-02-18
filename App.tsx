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
// TODO: Implemente as funções de API usando fetch para o backend
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ResetPasswordLazy from './ResetPasswordLazy';
// TODO: Implemente as funções de API usando fetch para o backend

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
import * as ApiService from './services/api.mongo';
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [authError, setAuthError] = useState('');
  
  // App Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // 1. Check active session on mount (agora apenas desativa o loading)
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Função de carregamento de dados (placeholder)
  const loadData = useCallback(async (_userId: string) => {
    try {
      const [transactions, cards, categories, budgets] = await Promise.all([
        ApiService.getTransactions(),
        ApiService.getCards(),
        ApiService.getCategories(),
        ApiService.getBudgets()
      ]);
      setTransactions(transactions);
      setCards(cards);
      setCategories(categories);
      setBudgets(budgets);
    } catch (error) {
      setTransactions([]);
      setCards([]);
      setCategories([]);
      setBudgets([]);
    }
  }, []);

  // Login agora deve ser feito via ApiService (MongoDB)
  const handleLogin = useCallback(async (_email: string, _pass: string) => {
    try {
      setAuthError('');
      // await fetch('URL_DO_BACKEND/api/login', { method: 'POST', body: JSON.stringify({ email, pass }) })
      // Implemente a chamada correta para login
      // Atualize o usuário logado conforme retorno do seu ApiService
      // Exemplo:
      // setCurrentUser(await ApiService.getCurrentUser());
  const handleLogin = useCallback(async (email: string, password: string) => {
      const errorMsg = err.message || 'Erro ao fazer login';
      setAuthError(errorMsg);
      throw err;
    }
  }, []);

  // Cadastro agora deve ser feito via ApiService (MongoDB)
      await ApiService.login(email, password);
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
  const handleRegister = useCallback(async (_name: string, _email: string, _pass: string) => {
    try {
      // await fetch('URL_DO_BACKEND/api/register', { method: 'POST', body: JSON.stringify({ name, email, pass }) })
      // Implemente a chamada correta para cadastro
      setAuthError('');
      alert('Cadastro realizado! Faça login.');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao cadastrar');
  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
  }, []);

  // Login com Google: redireciona para o backend
  const handleGoogleLogin = useCallback(() => {
    window.location.href = 'https://robsonsvicero.net/api/auth/google';
      await ApiService.register(name, email, password);
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
  }, []);
  // Detecta retorno do Google OAuth2
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'success') {
      // Buscar usuário autenticado na sessão
      fetch('https://robsonsvicero.net/api/auth/me', {
    window.location.href = (import.meta.env.VITE_BACKEND_URL || 'https://robsonsvicero.net') + '/api/auth/google';
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            setAuthError('');
            window.history.replaceState({}, document.title, '/');
          } else {
            setAuthError('Erro ao autenticar com Google.');
          }
        })
        .catch(() => setAuthError('Erro ao autenticar com Google.'));
    } else if (params.get('google') === 'fail') {
      setAuthError('Falha ao autenticar com Google.');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('https://robsonsvicero.net/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setCurrentUser(null);
      setActiveTab('dashboard');
    } catch (error) {
      setAuthError('Erro ao sair.');
      await ApiService.logout();
  const handleUpdateUser = async (updatedUser: User) => {
    try {
      // await fetch('URL_DO_BACKEND/api/user', { method: 'PUT', body: JSON.stringify({ ... }) })
      // Implemente a chamada correta para atualizar perfil
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
      // await fetch('URL_DO_BACKEND/api/transactions', { method: 'POST', body: JSON.stringify({ ... }) })
      // Implemente a chamada correta para adicionar transações
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
      // await fetch('URL_DO_BACKEND/api/transactions/' + updatedTransaction.id, { method: 'PUT', body: JSON.stringify(updatedTransaction) })
      // Implemente a chamada correta para atualizar transação
    } catch (error) {
      console.error("Error updating transaction", error);
      alert("Erro ao atualizar transação");
    }
  };

      await ApiService.updateTransaction(updatedTransaction.id, updatedTransaction);
    try {
      // Atualiza o estado local primeiro
      setTransactions(updatedTransactions);
      
      // Atualiza cada transação no banco de dados
      // TODO: Implemente a chamada correta para atualizar várias transações
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
      // await fetch('URL_DO_BACKEND/api/transactions/' + id, { method: 'DELETE' })
      // Implemente a chamada correta para deletar transação
    } catch (error) {
      console.error(error);
    }
  };

      await ApiService.deleteTransaction(id);
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
      // TODO: Implemente a chamada correta para atualizar várias transações
      loadData(currentUser.id);
    }
  };

  const handleAddCard = async (card: CreditCard) => {
    if (!currentUser) return;
    try {
      const newCard = await ApiService.addCard(card);
      setCards(prev => [...prev, newCard]);
    } catch (error) {
      alert('Erro ao adicionar cartão');
    }
  };

  const handleEditCard = async (updatedCard: CreditCard) => {
    try {
      const card = await ApiService.updateCard(updatedCard.id, updatedCard);
      setCards(prev => prev.map(c => c.id === updatedCard.id ? card : c));
    } catch (error) {
      alert('Erro ao atualizar cartão');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await ApiService.deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao deletar cartão');
    }
  };

  const handleUpdateBudget = async (budget: Budget) => {
    if (!currentUser) return;
    try {
      const updated = await ApiService.updateBudget(budget.categoryId + '-' + budget.month, budget);
      setBudgets(prev => {
        const existing = prev.findIndex(b => b.categoryId === budget.categoryId && b.month === budget.month);
        if (existing >= 0) {
          const arr = [...prev];
          arr[existing] = updated;
          return arr;
        }
        return [...prev, updated];
      });
    } catch (error) {
      alert('Erro ao atualizar orçamento');
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
              try {
                const newCat = await ApiService.addCategory(cat);
                setCategories(prev => [...prev, newCat]);
              } catch (error) {
                alert('Erro ao adicionar categoria');
              }
            }}
            onEdit={async (cat) => {
              try {
                const updated = await ApiService.updateCategory(cat.id, cat);
                setCategories(categories.map(c => c.id === cat.id ? updated : c));
              } catch (error) {
                alert('Erro ao atualizar categoria');
              }
            }}
            onDelete={async (id) => {
              try {
                await ApiService.deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
              } catch (error) {
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
