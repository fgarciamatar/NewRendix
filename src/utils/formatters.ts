export const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();

  if (dateOnly === todayOnly) return 'Hoy';
  if (dateOnly === yesterdayOnly) return 'Ayer';

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  return `${formatDate(dateString)} ${formatTime(dateString)}`.trim();
};

export const getTodayInputValue = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getCurrentShift = (): 'Mañana' | 'Tarde' => {
  const hours = new Date().getHours();
  // Mañana: 06:00 a 14:00 hs (6 a 13:59 hs)
  if (hours >= 6 && hours < 14) {
    return 'Mañana';
  }
  return 'Tarde';
};

export const getShiftFromDateString = (dateString: string): 'Mañana' | 'Tarde' => {
  if (!dateString) return getCurrentShift();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return getCurrentShift();
  const hours = date.getHours();
  if (hours >= 6 && hours < 14) {
    return 'Mañana';
  }
  return 'Tarde';
};

