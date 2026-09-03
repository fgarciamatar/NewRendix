import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  type: 'entrada' | 'salida' | 'balance' | 'total';
  icon: React.ReactNode;
  subtext: string;
  isCount?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  type,
  icon,
  subtext,
  isCount = false
}) => {
  const formattedValue = isCount 
    ? amount.toLocaleString('es-ES')
    : formatCurrency(amount);

  return (
    <div className={`glass-card stat-card stat-${type}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon-wrapper">
          {icon}
        </div>
      </div>
      <div className="stat-amount">
        {type === 'balance' && amount > 0 ? `+${formattedValue}` : formattedValue}
      </div>
      <div className="stat-subtext">
        {subtext}
      </div>
    </div>
  );
};
