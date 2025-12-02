
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

// --- Authentication ---

export const getStoredUsers = (): any[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const registerUser = (name: string, email: string, password: string): User | null => {
  const users = getStoredUsers();
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error('Este email já está cadastrado.');
  }

  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, // Note: In a real app, never store plain text passwords!
    avatar: ''
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Initialize data for new user
  saveUserData(newUser.id, DEFAULT_DATA);

  // Return user without password
  const { password: _, ...userSafe } = newUser;
  return userSafe as User;
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getStoredUsers();
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Email ou senha inválidos.');
  }

  const { password: _, ...userSafe } = user;
  return userSafe as User;
};

export const updateUserProfile = (user: User): void => {
  const users = getStoredUsers();
  const index = users.findIndex((u: any) => u.id === user.id);
  
  if (index !== -1) {
    // Preserve the password which is not in the User object
    const currentPassword = users[index].password;
    users[index] = { ...user, password: currentPassword };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

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
