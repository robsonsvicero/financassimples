import { supabase } from './supabaseClient';
import { Transaction, CreditCard, Budget, User } from '../types';
import { INITIAL_CATEGORIES } from '../constants';

const checkSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase não está configurado. Verifique a conexão.");
  }
  return supabase;
};

// --- Auth Helpers ---

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    if (!supabase) return null;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // Fetch profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const isAdmin = session.user.email === 'robsonsvicero@outlook.com';

    return {
      id: session.user.id,
      email: session.user.email!,
      name: profile?.name || session.user.user_metadata?.name || 'Usuário',
      avatar: profile?.avatar_url,
      isAdmin
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signOut = async () => {
  const client = checkSupabase();
  await client.auth.signOut();
};

// --- Data Fetching ---

export const fetchData = async (userId: string) => {
  const client = checkSupabase();

  // 1. Transactions
  const { data: transactions } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  // 2. Cards
  const { data: cards } = await client
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId);

  // 3. Custom Categories
  const { data: customCategories } = await client
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  // 4. Budgets
  const { data: budgets } = await client
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  // Merge default categories with custom ones from DB
  const allCategories = [...INITIAL_CATEGORIES, ...(customCategories || []).map((c: any) => ({
    ...c,
    type: c.type as any
  }))];

  const mappedTransactions: Transaction[] = (transactions || []).map((t: any) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    date: t.date,
    dueDate: t.due_date,
    type: t.type,
    expenseType: t.expense_type,
    category: t.category_id,
    paymentMethod: t.payment_method,
    creditCardId: t.credit_card_id,
    installmentTotal: t.installment_total,
    installmentCurrent: t.installment_current,
    parentId: t.parent_id,
    isPaid: t.is_paid
  }));

  const mappedCards: CreditCard[] = (cards || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    closingDay: c.closing_day,
    dueDay: c.due_day,
    color: c.color,
    limit: c.limit_amount ? Number(c.limit_amount) : undefined
  }));

  const mappedBudgets: Budget[] = (budgets || []).map((b: any) => ({
    categoryId: b.category_id,
    amount: Number(b.amount),
    month: b.month
  }));

  return {
    transactions: mappedTransactions,
    cards: mappedCards,
    categories: allCategories,
    budgets: mappedBudgets
  };
};

// --- CRUD Operations ---

export const addTransactions = async (transactions: Transaction[], userId: string) => {
  const client = checkSupabase();
  const dbPayload = transactions.map(t => ({
    user_id: userId,
    description: t.description,
    amount: t.amount,
    date: t.date,
    due_date: t.dueDate,
    type: t.type,
    expense_type: t.expenseType,
    category_id: t.category,
    payment_method: t.paymentMethod,
    credit_card_id: t.creditCardId || null,
    installment_total: t.installmentTotal,
    installment_current: t.installmentCurrent,
    parent_id: t.parentId,
    is_paid: t.isPaid
  }));

  const { error } = await client.from('transactions').insert(dbPayload);
  if (error) throw error;
};

export const deleteTransaction = async (id: string) => {
  const client = checkSupabase();
  const { error } = await client.from('transactions').delete().eq('id', id);
  if (error) throw error;
};

export const updateTransaction = async (transaction: Transaction) => {
  const client = checkSupabase();
  
  const dbPayload: any = {
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    type: transaction.type,
    payment_method: transaction.paymentMethod,
    is_paid: transaction.isPaid || false
  };

  if (transaction.dueDate) {
    dbPayload.due_date = transaction.dueDate;
  }

  if (transaction.category) {
    dbPayload.category_id = transaction.category;
  }

  if (transaction.creditCardId) {
    dbPayload.credit_card_id = transaction.creditCardId;
  }

  const { error } = await client
    .from('transactions')
    .update(dbPayload)
    .eq('id', transaction.id);
    
  if (error) throw error;
};

export const addCard = async (card: CreditCard, userId: string) => {
  const client = checkSupabase();
  const { data, error } = await client.from('credit_cards').insert({
    user_id: userId,
    name: card.name,
    closing_day: card.closingDay,
    due_day: card.dueDay,
    color: card.color,
    limit_amount: card.limit
  }).select().single();

  if (error) throw error;
  return data;
};

export const updateCard = async (card: CreditCard) => {
  const client = checkSupabase();
  const { error } = await client.from('credit_cards').update({
    name: card.name,
    closing_day: card.closingDay,
    due_day: card.dueDay,
    color: card.color
  }).eq('id', card.id);
  if (error) throw error;
};

export const deleteCard = async (id: string) => {
  const client = checkSupabase();
  const { error } = await client.from('credit_cards').delete().eq('id', id);
  if (error) throw error;
};

export const upsertBudget = async (budget: Budget, userId: string) => {
  const client = checkSupabase();
  const { error } = await client.from('budgets').upsert({
    user_id: userId,
    category_id: budget.categoryId,
    amount: budget.amount,
    month: budget.month
  }, { onConflict: 'user_id, category_id, month' });
  
  if (error) throw error;
};

export const updateUserProfile = async (userId: string, name: string, avatar: string) => {
  const client = checkSupabase();
  const { error } = await client.from('profiles').update({
    name,
    avatar_url: avatar
  }).eq('id', userId);
  
  if (error) throw error;
};

// --- Admin Functions ---

export const listAllUsers = async (): Promise<User[]> => {
  const client = checkSupabase();
  
  // Busca todos os perfis com email
  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, name, avatar_url, email')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Mapeia os perfis para o formato User
  return (profiles || []).map(profile => ({
    id: profile.id,
    email: profile.email || 'Email não disponível',
    name: profile.name || 'Usuário',
    avatar: profile.avatar_url,
    isAdmin: profile.email === 'robsonsvicero@outlook.com'
  }));
};

export const deleteUser = async (userId: string) => {
  const client = checkSupabase();
  
  // Usa função RPC para deletar completamente (dados + profile + auth via CASCADE)
  const { error } = await client.rpc('delete_user_completely', {
    user_id_to_delete: userId
  });
  
  if (error) {
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
};