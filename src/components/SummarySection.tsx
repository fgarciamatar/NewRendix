import React from 'react';
import { StatCard } from './StatCard';
import type { Movement } from '../types';
import { TrendingUp, TrendingDown, Wallet, Hash } from 'lucide-react';

interface SummarySectionProps {
  movements: Movement[];
}

export const SummarySection: React.FC<SummarySectionProps> = ({ movements }) => {
  const totalEntradas = movements
    .filter(m => m.type === 'entrada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSalidas = movements
    .filter(m => m.type === 'salida')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balanceNeto = totalEntradas - totalSalidas;
  const count = movements.length;
  const countEntradas = movements.filter(m => m.type === 'entrada').length;
  const countSalidas = movements.filter(m => m.type === 'salida').length;

  return (
    <div className="stats-grid">
      <StatCard 
        title="Total Entradas" 
        amount={totalEntradas} 
        type="entrada" 
        icon={<TrendingUp size={20} />} 
        subtext={`${countEntradas} registro(s) de entradas`}
      />

      <StatCard 
        title="Total Salidas" 
        amount={totalSalidas} 
        type="salida" 
        icon={<TrendingDown size={20} />} 
        subtext={`${countSalidas} registro(s) de salidas`}
      />

      <StatCard 
        title="Balance (Entradas - Salidas)" 
        amount={balanceNeto} 
        type="balance" 
        icon={<Wallet size={20} />} 
        subtext={balanceNeto >= 0 ? 'Balance positivo' : 'Déficit / Balance negativo'}
      />

      <StatCard 
        title="Total Movimientos" 
        amount={count} 
        type="total" 
        icon={<Hash size={20} />} 
        subtext="Transacciones registradas"
        isCount={true}
      />
    </div>
  );
};
