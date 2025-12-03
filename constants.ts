import { Category, CreditCard } from './types';
import { 
  faReceipt, faBus, faWifi, faDroplet, faBolt, faHouse, faUtensils, 
  faHeartPulse, faGraduationCap, faPlane, faShirt, faCartShopping, 
  faPaperclip, faEllipsis, faDollarSign, faCar, faGasPump
} from '@fortawesome/free-solid-svg-icons';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Taxas e Impostos', icon: 'faReceipt', color: 'text-red-500', type: 'EXPENSE' },
  { id: '2', name: 'Transporte', icon: 'faBus', color: 'text-blue-500', type: 'EXPENSE' },
  { id: '3', name: 'Internet', icon: 'faWifi', color: 'text-cyan-500', type: 'EXPENSE' },
  { id: '4', name: 'Água', icon: 'faDroplet', color: 'text-blue-400', type: 'EXPENSE' },
  { id: '5', name: 'Eletricidade', icon: 'faBolt', color: 'text-yellow-500', type: 'EXPENSE' },
  { id: '6', name: 'Aluguel', icon: 'faHouse', color: 'text-indigo-500', type: 'EXPENSE' },
  { id: '7', name: 'Alimentação', icon: 'faUtensils', color: 'text-orange-500', type: 'EXPENSE' },
  { id: '8', name: 'Saúde', icon: 'faHeartPulse', color: 'text-pink-500', type: 'EXPENSE' },
  { id: '9', name: 'Educação', icon: 'faGraduationCap', color: 'text-purple-500', type: 'EXPENSE' },
  { id: '10', name: 'Lazer', icon: 'faPlane', color: 'text-green-500', type: 'EXPENSE' },
  { id: '11', name: 'Vestuário', icon: 'faShirt', color: 'text-teal-500', type: 'EXPENSE' },
  { id: '12', name: 'Supermercado', icon: 'faCartShopping', color: 'text-emerald-600', type: 'EXPENSE' },
  { id: '13', name: 'Material de Escritório', icon: 'faPaperclip', color: 'text-gray-500', type: 'EXPENSE' },
  { id: '14', name: 'Outros', icon: 'faEllipsis', color: 'text-slate-500', type: 'BOTH' },
  { id: '15', name: 'Salário', icon: 'faDollarSign', color: 'text-green-600', type: 'INCOME' },
];

export const ICON_MAP: Record<string, any> = {
  faReceipt, faBus, faWifi, faDroplet, faBolt, faHouse, faUtensils, 
  faHeartPulse, faGraduationCap, faPlane, faShirt, faCartShopping, 
  faPaperclip, faEllipsis, faDollarSign, faCar, faGasPump
};

export const MOCK_CARDS: CreditCard[] = [
  { id: 'c1', name: 'Nubank', closingDay: 25, dueDay: 3, color: 'bg-purple-600' },
  { id: 'c2', name: 'Bradesco', closingDay: 15, dueDay: 25, color: 'bg-red-600' },
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const APP_LOGO = "/logo_app.png";
