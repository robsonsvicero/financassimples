export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PIX = 'PIX',
}

export enum ExpenseType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
}

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
  color: string;
  limit?: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO Date string (YYYY-MM-DD)
  dueDate?: string; // For expenses
  type: TransactionType;
  expenseType?: ExpenseType;
  category: string;
  paymentMethod: PaymentMethod;
  creditCardId?: string;
  installmentTotal?: number;
  installmentCurrent?: number;
  parentId?: string; // For grouping installments
  isPaid: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Budget {
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface AppState {
  user: User | null;
  transactions: Transaction[];
  cards: CreditCard[];
  categories: Category[];
  budgets: Budget[];
}