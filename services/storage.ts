
import { User, Transaction, CreditCard, Category, Budget } from '../types';
import { INITIAL_CATEGORIES } from '../constants';

const USERS_KEY = 'fin_users_v1';
const DATA_PREFIX = 'fin_data_';

export interface UserData {
  transactions: Transaction[];
  cards: CreditCard[];
  categories: Category[];
  budgets: Budget[];
}

const DEFAULT_DATA: UserData = {
  transactions: [],
  cards: [], // Start with no cards for new users
  categories: INITIAL_CATEGORIES,
  budgets: []
};

// --- Authentication removida ---
// Toda autenticação deve ser feita via backend (API REST)

// --- Data Management ---

export const getUserData = (userId: string): UserData => {
  const dataStr = localStorage.getItem(`${DATA_PREFIX}${userId}`);
  if (!dataStr) {
    return DEFAULT_DATA;
  }
  return JSON.parse(dataStr);
};

export const saveUserData = (userId: string, data: UserData): void => {
  localStorage.setItem(`${DATA_PREFIX}${userId}`, JSON.stringify(data));
};
