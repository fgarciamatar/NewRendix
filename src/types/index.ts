export type MovementType = 'entrada' | 'salida';

export type PaymentMethod =
  | 'efectivo'
  | 'transferencia'
  | 'QR'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'otro';

export interface Category {
  id: string;
  name: string;
  type: MovementType | 'both';
  icon: string;
  color: string;
  bgColor: string;
}

export interface Movement {
  id: string;
  type: MovementType;
  concept: string;
  amount: number;
  category: string;
  date: string; // ISO String YYYY-MM-DD or YYYY-MM-DDTHH:mm
  paymentMethod: PaymentMethod;
  shift?: 'Mañana' | 'Tarde';
  note?: string;
  createdAt: number; // Timestamp
  updatedAt?: number;
}

export type CurrencyCode = 'USD' | 'ARS' | 'EUR' | 'MXN' | 'BRL' | 'CLP';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export interface FilterOptions {
  search: string;
  type: 'all' | 'entrada' | 'salida';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
