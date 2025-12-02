import { Category, CreditCard } from './types';
import { 
  Receipt, Bus, Wifi, Droplets, Zap, Home, Utensils, 
  HeartPulse, GraduationCap, Plane, Shirt, ShoppingCart, 
  Paperclip, MoreHorizontal, DollarSign
} from 'lucide-react';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Taxas e Impostos', icon: 'Receipt', color: 'text-red-500', type: 'EXPENSE' },
  { id: '2', name: 'Transporte', icon: 'Bus', color: 'text-blue-500', type: 'EXPENSE' },
  { id: '3', name: 'Internet', icon: 'Wifi', color: 'text-cyan-500', type: 'EXPENSE' },
  { id: '4', name: 'Água', icon: 'Droplets', color: 'text-blue-400', type: 'EXPENSE' },
  { id: '5', name: 'Eletricidade', icon: 'Zap', color: 'text-yellow-500', type: 'EXPENSE' },
  { id: '6', name: 'Aluguel', icon: 'Home', color: 'text-indigo-500', type: 'EXPENSE' },
  { id: '7', name: 'Alimentação', icon: 'Utensils', color: 'text-orange-500', type: 'EXPENSE' },
  { id: '8', name: 'Saúde', icon: 'HeartPulse', color: 'text-pink-500', type: 'EXPENSE' },
  { id: '9', name: 'Educação', icon: 'GraduationCap', color: 'text-purple-500', type: 'EXPENSE' },
  { id: '10', name: 'Lazer', icon: 'Plane', color: 'text-green-500', type: 'EXPENSE' },
  { id: '11', name: 'Vestuário', icon: 'Shirt', color: 'text-teal-500', type: 'EXPENSE' },
  { id: '12', name: 'Supermercado', icon: 'ShoppingCart', color: 'text-emerald-600', type: 'EXPENSE' },
  { id: '13', name: 'Material de Escritório', icon: 'Paperclip', color: 'text-gray-500', type: 'EXPENSE' },
  { id: '14', name: 'Outros', icon: 'MoreHorizontal', color: 'text-slate-500', type: 'BOTH' },
  { id: '15', name: 'Salário', icon: 'DollarSign', color: 'text-green-600', type: 'INCOME' },
];

export const ICON_MAP: Record<string, any> = {
  Receipt, Bus, Wifi, Droplets, Zap, Home, Utensils, 
  HeartPulse, GraduationCap, Plane, Shirt, ShoppingCart, 
  Paperclip, MoreHorizontal, DollarSign
};

export const MOCK_CARDS: CreditCard[] = [
  { id: 'c1', name: 'Nubank', closingDay: 25, dueDay: 3, color: 'bg-purple-600' },
  { id: 'c2', name: 'Bradesco', closingDay: 15, dueDay: 25, color: 'bg-red-600' },
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const APP_LOGO = "./src/images/logo_app.png";
