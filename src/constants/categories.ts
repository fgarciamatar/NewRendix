import type { Category, PaymentMethod } from '../types';

export const CATEGORIES: Category[] = [
  // Entradas
  { id: 'venta mñana', name: 'Ventas mañana', type: 'entrada', icon: 'ShoppingBag', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  { id: 'venta total', name: 'venta total', type: 'entrada', icon: 'Briefcase', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.15)' },
  { id: 'NC', name: 'nota de credito', type: 'entrada', icon: 'RotateCcw', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)' },

  // Salidas
  { id: 'Total Tarjeta', name: 'Total Tarjeta', type: 'salida', icon: 'PackageCheck', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  { id: 'Total Efectivo', name: 'Total Efectivo', type: 'salida', icon: 'Home', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  { id: 'Total Cambio', name: 'Total Cambio', type: 'salida', icon: 'Zap', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  { id: 'Transferencia', name: 'Transferencia', type: 'salida', icon: 'Users', color: '#e11d48', bgColor: 'rgba(225, 29, 72, 0.15)' },

  // Ambos
  { id: 'otros', name: 'Otros / Varios', type: 'both', icon: 'MoreHorizontal', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.15)' }
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: 'Banknote' },
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: 'Building2' },
  { id: 'QR', label: 'QR', icon: 'Qrcode' },
  { id: 'tarjeta_debito', label: 'Tarjeta de Débito', icon: 'CreditCard' },
  { id: 'tarjeta_credito', label: 'Tarjeta de Crédito', icon: 'CreditCard' },
  { id: 'otro', label: 'Otro Medio', icon: 'Wallet' }
];
