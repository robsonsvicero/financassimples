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
    installmentTotal: t.installment_total,
    installmentCurrent: t.installment_current,
    parentId: t.parent_id,
    isPaid: t.is_paid
  }));
  const mappedCards: CreditCard[] = (cards || []).map((c: any) => ({
    id: c._id?.toString() || c.id,
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
  const db = await getMongoDb();
  const dbPayload = transactions.map(t => ({
    user_id: userId,
    description: t.description,
    amount: t.amount,
    date: t.date + 'T12:00:00',
    due_date: t.dueDate ? t.dueDate + 'T12:00:00' : null,
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
  await db.collection('transactions').insertMany(dbPayload);
};

export const deleteTransaction = async (id: string) => {
  const db = await getMongoDb();
  await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });
};

export const updateTransaction = async (transaction: Transaction) => {
  const db = await getMongoDb();
  const dbPayload: any = {
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date.includes('T') ? transaction.date : transaction.date + 'T12:00:00',
    type: transaction.type,
    payment_method: transaction.paymentMethod,
    is_paid: transaction.isPaid || false
  };
  if (transaction.dueDate) {
    dbPayload.due_date = transaction.dueDate.includes('T') ? transaction.dueDate : transaction.dueDate + 'T12:00:00';
  }
  if (transaction.category) {
    dbPayload.category_id = transaction.category;
  }
  if (transaction.creditCardId) {
    dbPayload.credit_card_id = transaction.creditCardId;
  }
  await db.collection('transactions').updateOne(
    { _id: new ObjectId(transaction.id) },
    { $set: dbPayload }
  );
};

export const addCard = async (card: CreditCard, userId: string) => {
  const db = await getMongoDb();
  const result = await db.collection('credit_cards').insertOne({
    user_id: userId,
    name: card.name,
    closing_day: card.closingDay,
    due_day: card.dueDay,
    color: card.color,
    limit_amount: card.limit
  });
  return { ...card, id: result.insertedId.toString() };
};

export const updateCard = async (card: CreditCard) => {
  const db = await getMongoDb();
  await db.collection('credit_cards').updateOne(
    { _id: new ObjectId(card.id) },
    { $set: {
      name: card.name,
      closing_day: card.closingDay,
      due_day: card.dueDay,
      color: card.color
    }}
  );
};

export const deleteCard = async (id: string) => {
  const db = await getMongoDb();
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
