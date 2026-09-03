import React from 'react';
import type { Movement } from '../types';
import { formatCurrency, formatDateTime, getShiftFromDateString } from '../utils/formatters';
import { CATEGORIES } from '../constants/categories';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus,
  Minus,
  Inbox,
  ShoppingBag,
  Briefcase,
  UserCheck,
  TrendingUp,
  RotateCcw,
  PackageCheck,
  Home,
  Zap,
  Users,
  FileText,
  Truck,
  Megaphone,
  MoreHorizontal,
  Sun,
  Moon
} from 'lucide-react';

interface MovementListProps {
  movements: Movement[];
  onEdit: (movement: Movement) => void;
  onDuplicate: (movement: Movement) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: (type: 'entrada' | 'salida') => void;
}

const getCategoryIcon = (iconName: string, color: string) => {
  const props = { size: 13, style: { color } };
  switch (iconName) {
    case 'ShoppingBag': return <ShoppingBag {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'UserCheck': return <UserCheck {...props} />;
    case 'TrendingUp': return <TrendingUp {...props} />;
    case 'RotateCcw': return <RotateCcw {...props} />;
    case 'PackageCheck': return <PackageCheck {...props} />;
    case 'Home': return <Home {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Users': return <Users {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'Truck': return <Truck {...props} />;
    case 'Megaphone': return <Megaphone {...props} />;
    default: return <MoreHorizontal {...props} />;
  }
};

export const MovementList: React.FC<MovementListProps> = ({
  movements,
  onEdit,
  onDuplicate,
  onDelete,
  onOpenAddModal
}) => {
  const entradas = movements.filter(m => m.type === 'entrada');
  const salidas = movements.filter(m => m.type === 'salida');

  const totalEntradas = entradas.reduce((sum, item) => sum + item.amount, 0);
  const totalSalidas = salidas.reduce((sum, item) => sum + item.amount, 0);

  const renderTableRows = (items: Movement[], isEntrada: boolean) => {
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Inbox size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Sin {isEntrada ? 'entradas' : 'salidas'} registradas
            </div>
            <button 
              className={`btn ${isEntrada ? 'btn-entrada' : 'btn-salida'} btn-sm`} 
              style={{ marginTop: '0.75rem' }}
              onClick={() => onOpenAddModal(isEntrada ? 'entrada' : 'salida')}
            >
              {isEntrada ? '+ Registrar Entrada' : '- Registrar Salida'}
            </button>
          </td>
        </tr>
      );
    }

    return items.map((item) => {
      const categoryDef = CATEGORIES.find(c => c.id === item.category) || {
        id: 'otros',
        name: item.category || 'Otros',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.15)',
        icon: 'MoreHorizontal'
      };

      const itemShift = item.shift || getShiftFromDateString(item.date);

      return (
        <tr key={item.id}>
          {/* Concept */}
          <td>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {item.concept}
            </div>
            {item.note && (
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {item.note}
              </div>
            )}
          </td>

          {/* Category */}
          <td>
            <span 
              className="category-badge"
              style={{ 
                backgroundColor: categoryDef.bgColor, 
                color: categoryDef.color,
                border: `1px solid ${categoryDef.color}33`,
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem'
              }}
            >
              {getCategoryIcon(categoryDef.icon, categoryDef.color)}
              {categoryDef.name}
            </span>
          </td>

          {/* Date & Shift */}
          <td>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>{formatDateTime(item.date)}</span>
              <span 
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: itemShift === 'Mañana' ? '#f59e0b' : '#3b82f6'
                }}
              >
                {itemShift === 'Mañana' ? <Sun size={11} /> : <Moon size={11} />}
                Turno {itemShift}
              </span>
            </div>
          </td>

          {/* Amount */}
          <td style={{ textAlign: 'right' }}>
            <div className={`amount-cell ${item.type}`} style={{ fontSize: '0.875rem' }}>
              {item.type === 'entrada' ? '+' : '-'}{formatCurrency(item.amount)}
            </div>
          </td>

          {/* Actions */}
          <td>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' }}>
              <button 
                className="btn btn-ghost btn-icon-only" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => onEdit(item)}
                title="Editar"
              >
                <Edit3 size={13} />
              </button>
              <button 
                className="btn btn-ghost btn-icon-only" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => onDuplicate(item)}
                title="Duplicar"
              >
                <Copy size={13} />
              </button>
              <button 
                className="btn btn-ghost btn-icon-only" 
                style={{ width: '28px', height: '28px', color: 'var(--salida-color)' }}
                onClick={() => onDelete(item.id)}
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="dual-tables-grid">
      {/* LEFT COLUMN: ENTRADAS */}
      <div className="glass-card table-column entrada-column">
        <div className="column-header entrada-header">
          <div className="column-header-title">
            <div className="icon-badge entrada">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--entrada-color)' }}>
                ENTRADAS
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {entradas.length} registro(s)
              </span>
            </div>
          </div>

          <button 
            className="btn btn-entrada btn-sm"
            onClick={() => onOpenAddModal('entrada')}
            title="Acceso rápido: Ctrl + Q"
          >
            <Plus size={14} />
            <span>+ Nueva Entrada</span>
            <kbd className="kbd-shortcut">Ctrl+Q</kbd>
          </button>
        </div>

        <div className="table-container">
          <table className="movements-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Fecha / Turno</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows(entradas, true)}
            </tbody>
            {entradas.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ fontWeight: 700, fontSize: '0.85rem' }}>Total Entradas</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--entrada-color)', fontSize: '0.95rem' }}>
                    +{formatCurrency(totalEntradas)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN: SALIDAS */}
      <div className="glass-card table-column salida-column">
        <div className="column-header salida-header">
          <div className="column-header-title">
            <div className="icon-badge salida">
              <ArrowDownRight size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--salida-color)' }}>
                SALIDAS
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {salidas.length} registro(s)
              </span>
            </div>
          </div>

          <button 
            className="btn btn-salida btn-sm"
            onClick={() => onOpenAddModal('salida')}
            title="Acceso rápido: Ctrl + M"
          >
            <Minus size={14} />
            <span>- Nueva Salida</span>
            <kbd className="kbd-shortcut">Ctrl+M</kbd>
          </button>
        </div>

        <div className="table-container">
          <table className="movements-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Fecha / Turno</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows(salidas, false)}
            </tbody>
            {salidas.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ fontWeight: 700, fontSize: '0.85rem' }}>Total Salidas</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--salida-color)', fontSize: '0.95rem' }}>
                    -{formatCurrency(totalSalidas)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
