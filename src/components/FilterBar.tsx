import React from 'react';
import { Search, Filter, Calendar, ArrowUpDown, RefreshCw } from 'lucide-react';
import type { FilterOptions } from '../types';
import { CATEGORIES } from '../constants/categories';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (updated: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  return (
    <div className="glass-card filter-bar">
      <div className="filter-row-top">
        {/* Search input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por concepto, nota o código..." 
            value={filters.search} 
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Type pills toggle */}
        <div className="type-pills">
          <button 
            className={`pill-btn ${filters.type === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange({ type: 'all' })}
          >
            Todas
          </button>
          <button 
            className={`pill-btn pill-entrada ${filters.type === 'entrada' ? 'active' : ''}`}
            onClick={() => onFilterChange({ type: 'entrada' })}
          >
            Entradas
          </button>
          <button 
            className={`pill-btn pill-salida ${filters.type === 'salida' ? 'active' : ''}`}
            onClick={() => onFilterChange({ type: 'salida' })}
          >
            Salidas
          </button>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-select"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="all">Todas las Categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-select"
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
          >
            <option value="all">Cualquier fecha</option>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
          </select>
        </div>

        {/* Sorting selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-select"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
          >
            <option value="date-desc">Más recientes primero</option>
            <option value="date-asc">Más antiguos primero</option>
            <option value="amount-desc">Mayor monto primero</option>
            <option value="amount-asc">Menor monto primero</option>
          </select>
        </div>

        {/* Reset filter button */}
        {(filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all') && (
          <button 
            className="btn btn-ghost btn-sm"
            onClick={onResetFilters}
            title="Limpiar filtros"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={14} />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
};
