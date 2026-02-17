// --- Auth Placeholders ---
export const login = async (email: string, _password: string) => {
  // Implemente a lógica real de login aqui
  return { email };
};

export const register = async (name: string, email: string, _password: string) => {
  // Implemente a lógica real de cadastro aqui
  return { name, email };
};

export const signOut = async () => {
  // Implemente a lógica real de logout aqui
  return true;
};
import { getMongoDb } from './mongoClient';
import { Transaction, CreditCard, Budget, User, Category } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { ObjectId } from 'mongodb';

// --- Fetch Data ---
export const fetchData = async (userId: string) => {
  const db = await getMongoDb();
  const transactions = await db.collection('transactions').find({ user_id: userId }).toArray();
  const cards = await db.collection('credit_cards').find({ user_id: userId }).toArray();
  const customCategories = await db.collection('categories').find({ user_id: userId }).toArray();
  const budgets = await db.collection('budgets').find({ user_id: userId }).toArray();
  const allCategories = [
    ...INITIAL_CATEGORIES,
    ...customCategories.map((c: any) => ({ ...c, type: c.type as any }))
  ];
  const mappedTransactions: Transaction[] = (transactions || []).map((t: any) => ({
    id: t._id?.toString() || t.id,
    description: t.description,
    amount: Number(t.amount),
    date: typeof t.date === 'string' && t.date.includes('T') ? t.date.split('T')[0] : t.date,
    dueDate: t.due_date && typeof t.due_date === 'string' && t.due_date.includes('T') ? t.due_date.split('T')[0] : t.due_date,
    type: t.type,
    expenseType: t.expense_type,
    category: t.category_id,
    paymentMethod: t.payment_method,
    creditCardId: t.credit_card_id,

    // Exemplo de uso correto no frontend:
    const BACKEND_URL = 'https://mongodb-production-dab3.up.railway.app';

    export const fetchData = async (userId) => {
      const res = await fetch(`${BACKEND_URL}/api/data?userId=${userId}`);
      if (!res.ok) throw new Error('Erro ao buscar dados');
      return await res.json();
    };

    export const addTransactions = async (transactions, userId) => {
      const res = await fetch(`${BACKEND_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, userId })
      });
      if (!res.ok) throw new Error('Erro ao adicionar transação');
      return await res.json();
    };

    // Implemente funções semelhantes para update, delete, etc., sempre usando fetch para a API backend.
  await db.collection('credit_cards').deleteOne({ _id: new ObjectId(id) });
};

export const upsertBudget = async (budget: Budget, userId: string) => {
  const db = await getMongoDb();
  await db.collection('budgets').updateOne(
    { user_id: userId, category_id: budget.categoryId, month: budget.month },
    { $set: { amount: budget.amount } },
    { upsert: true }
  );
};

export const updateUserProfile = async (userId: string, name: string, avatar: string) => {
  const db = await getMongoDb();
  await db.collection('profiles').updateOne(
    { id: userId },
    { $set: { name, avatar_url: avatar } }
  );
};

// --- Admin Functions ---
export const listAllUsers = async (): Promise<User[]> => {
  const db = await getMongoDb();
  const profiles = await db.collection('profiles').find({ email: { $exists: true } }).sort({ created_at: -1 }).toArray();
  return (profiles || []).map((profile: any) => ({
    id: profile.id,
    email: profile.email || 'Email não disponível',
    name: profile.name || 'Usuário',
    avatar: profile.avatar_url,
    isAdmin: profile.email === 'robsonsvicero@outlook.com'
  }));
};

export const deleteUser = async (userId: string) => {
  const db = await getMongoDb();
  // Remove profile e dados relacionados (ajuste conforme necessidade)
  await db.collection('profiles').deleteOne({ id: userId });
  await db.collection('transactions').deleteMany({ user_id: userId });
  await db.collection('credit_cards').deleteMany({ user_id: userId });
  await db.collection('categories').deleteMany({ user_id: userId });
  await db.collection('budgets').deleteMany({ user_id: userId });
};

// --- Category Operations ---
export const addCategory = async (category: Omit<Category, 'id'>, userId: string) => {
  const db = await getMongoDb();
  const result = await db.collection('categories').insertOne({
    user_id: userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type
  });
  return { ...category, id: result.insertedId.toString() };
};

export const updateCategory = async (category: Category) => {
  const db = await getMongoDb();
  await db.collection('categories').updateOne(
    { _id: new ObjectId(category.id) },
    { $set: {
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type
    }}
  );
};

export const deleteCategory = async (id: string) => {
  const db = await getMongoDb();
  await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
};
