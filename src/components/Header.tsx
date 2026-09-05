import React from 'react';
import {
  Sun,
  Moon,
  FileText,
  Trash2,
  Clock,
  DollarSign
} from 'lucide-react';
import { LogoIcon } from './LogoIcon';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onExportPDF: () => void;
  onClearAll: () => void;
  onOpenCashDetail: () => void;
  activeShift: 'Mañana' | 'Tarde';
  onShiftChange: (shift: 'Mañana' | 'Tarde') => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onExportPDF,
  onClearAll,
  onOpenCashDetail,
  activeShift,
  onShiftChange
}) => {
  return (
    <header className="app-header glass-card">
      <div className="brand-logo">
        <div className="logo-icon">
          <LogoIcon size={24} color="#ffffff" />
        </div>
        <div>
          <h1 className="logo-title">Rendix</h1>
          <p className="logo-tagline">Registro de Entradas & Salidas</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Turno Selector on Navbar */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.2rem 0.4rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg-subtle)',
            marginRight: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', paddingLeft: '0.2rem' }}>
            <Clock size={13} />
            <span>Turno:</span>
          </div>
          <div className="type-pills">
            <button 
              className={`pill-btn ${activeShift === 'Mañana' ? 'active' : ''}`}
              onClick={() => onShiftChange('Mañana')}
              title="Turno Mañana (06:00 a 14:00 hs - Asignado según la hora)"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Sun size={13} style={{ color: activeShift === 'Mañana' ? '#f59e0b' : 'inherit' }} />
              <span>Mañana</span>
            </button>
            <button 
              className={`pill-btn ${activeShift === 'Tarde' ? 'active' : ''}`}
              onClick={() => onShiftChange('Tarde')}
              title="Turno Tarde (14:00 a 06:00 hs - Asignado según la hora)"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Moon size={13} style={{ color: activeShift === 'Tarde' ? '#3b82f6' : 'inherit' }} />
              <span>Tarde</span>
            </button>
          </div>
        </div>

        {/* Cash Detail Button */}
        <button
          className="btn btn-cash-detail"
          onClick={onOpenCashDetail}
          title="Registrar detalle de billetes de Efectivo o Cambio · Acceso rápido: Ctrl + B"
        >
          <DollarSign size={16} style={{ color: '#10b981' }} />
          <span>Detalle Efectivo</span>
          <kbd className="kbd-shortcut">Ctrl+B</kbd>
        </button>

        {/* PDF Export Only Button */}
        <button
          className="btn btn-secondary"
          onClick={onExportPDF}
          title="Exportar Planilla PDF con Entradas, Salidas y Balance"
        >
          <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Exportar PDF</span>
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-secondary btn-icon-only" 
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Clear All */}
        <button 
          className="btn btn-ghost btn-icon-only" 
          onClick={onClearAll}
          title="Borrar todos los movimientos"
          style={{ color: 'var(--text-muted)' }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </header>
  );
};
