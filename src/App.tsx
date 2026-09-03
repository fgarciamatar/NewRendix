import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type {
  Movement,
  FilterOptions,
  ToastMessage,
  MovementType
} from './types';
import {
  loadMovementsFromStorage,
  saveMovementsToStorage
} from './utils/storage';
import { exportMovementsToPDF } from './utils/pdfExport';
import { formatCurrency, getCurrentShift } from './utils/formatters';

import { Header } from './components/Header';
import { SummarySection } from './components/SummarySection';
import { FilterBar } from './components/FilterBar';
import { MovementList } from './components/MovementList';
import { MovementFormModal } from './components/MovementFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/ToastContainer';


export function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Active shift assigned automatically according to local hour
  const [activeShift, setActiveShift] = useState<'Mañana' | 'Tarde'>(getCurrentShift);

  // Periodically refresh active shift based on time of day
  useEffect(() => {
    setActiveShift(getCurrentShift());
    const interval = setInterval(() => {
      setActiveShift(getCurrentShift());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Data state
  const [movements, setMovements] = useState<Movement[]>(() => loadMovementsFromStorage());

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    category: 'all',
    dateRange: 'all',
    sortBy: 'date-desc'
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<MovementType>('entrada');
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync movements to localStorage
  useEffect(() => {
    saveMovementsToStorage(movements);
  }, [movements]);

  // Open modal for creating new record
  const handleOpenAddModal = useCallback((type: MovementType) => {
    setEditingMovement(null);
    setModalInitialType(type);
    setIsModalOpen(true);
  }, []);

  // Keyboard Shortcuts (Ctrl + Q for Entrada, Ctrl + M for Salida)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Avoid triggering when user is typing inside an input/textarea
      const targetTag = (e.target as HTMLElement)?.tagName;
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag);

      if (isInputField) return;

      if (isCtrlOrCmd && key === 'q') {
        e.preventDefault();
        handleOpenAddModal('entrada');
      } else if (isCtrlOrCmd && key === 'm') {
        e.preventDefault();
        handleOpenAddModal('salida');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenAddModal]);

  // Handle PDF export
  const handleExportPDF = () => {
    if (movements.length === 0) {
      addToast('info', 'Sin datos para exportar', 'Registra al menos una entrada o salida antes de exportar el PDF.');
      return;
    }
    exportMovementsToPDF(movements, activeShift);
    addToast('success', 'Planilla PDF descargada', 'Se exportó la planilla con todas las entradas, salidas y el balance final.');
  };

  // Filter & Sort Logic
  const filteredMovements = useMemo(() => {
    return movements.filter(item => {
      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesConcept = item.concept.toLowerCase().includes(query);
        const matchesNote = (item.note || '').toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesConcept && !matchesNote && !matchesCategory) return false;
      }

      // Type filter
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = new Date();
        if (isNaN(itemDate)) return true;

        if (filters.dateRange === 'today') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          if (itemDate < startOfDay) return false;
        } else if (filters.dateRange === 'week') {
          const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
          if (itemDate < sevenDaysAgo) return false;
        } else if (filters.dateRange === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          if (itemDate < startOfMonth) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (filters.sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (filters.sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (filters.sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [movements, filters]);

  // Open modal for editing existing record
  const handleEditMovement = (item: Movement) => {
    setEditingMovement(item);
    setIsModalOpen(true);
  };

  // Duplicate movement
  const handleDuplicateMovement = (item: Movement) => {
    const duplicated: Movement = {
      ...item,
      id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
      concept: `${item.concept} (Copia)`,
      createdAt: Date.now()
    };
    setMovements(prev => [duplicated, ...prev]);
    addToast('success', 'Movimiento duplicado', 'Se ha registrado una nueva copia en localStorage');
  };

  // Save movement (create or update)
  const handleSaveMovement = (movementData: Omit<Movement, 'id' | 'createdAt'> & { id?: string }) => {
    if (movementData.id) {
      // Update
      setMovements(prev => prev.map(m => m.id === movementData.id ? {
        ...m,
        ...movementData,
        updatedAt: Date.now()
      } as Movement : m));
      addToast('success', 'Movimiento actualizado', 'Los cambios se han guardado en localStorage');
    } else {
      // Create
      const newMovement: Movement = {
        ...movementData,
        id: 'mov-' + Date.now() + Math.random().toString().slice(2, 5),
        createdAt: Date.now()
      };
      setMovements(prev => [newMovement, ...prev]);

      if (movementData.type === 'entrada') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
        addToast('success', 'Entrada registrada', `+${formatCurrency(movementData.amount)} guardado en entradas`);
      } else {
        addToast('info', 'Salida registrada', `-${formatCurrency(movementData.amount)} guardado en salidas`);
      }
    }
  };

  // Delete movement
  const handleDeleteRequest = (id: string) => {
    const target = movements.find(m => m.id === id);
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Movimiento',
      message: `¿Estás seguro de que deseas eliminar "${target?.concept || 'este registro'}"? Se actualizará en localStorage.`,
      onConfirm: () => {
        setMovements(prev => prev.filter(m => m.id !== id));
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        addToast('info', 'Movimiento eliminado', 'El registro ha sido borrado');
      }
    });
  };

  // Clear all data
  const handleClearAllRequest = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Limpiar Todo el Historial',
      message: '¿Estás seguro de que deseas borrar TODAS las entradas y salidas? Esta acción vaciará el almacenamiento de localStorage.',
      onConfirm: () => {
        setMovements([]);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        addToast('error', 'Historial vaciado', 'Todos los registros fueron eliminados');
      }
    });
  };

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportPDF={handleExportPDF}
        onClearAll={handleClearAllRequest}
        activeShift={activeShift}
        onShiftChange={setActiveShift}
      />



      {/* Main Metrics Overview Cards */}
      <SummarySection
        movements={movements}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
        onResetFilters={() => setFilters({
          search: '',
          type: 'all',
          category: 'all',
          dateRange: 'all',
          sortBy: 'date-desc'
        })}
      />

      {/* Main Layout Dual Tables */}
      <div className="main-layout">
        <MovementList
          movements={filteredMovements}
          onEdit={handleEditMovement}
          onDuplicate={handleDuplicateMovement}
          onDelete={handleDeleteRequest}
          onOpenAddModal={handleOpenAddModal}
        />
      </div>

      {/* Add / Edit Modal */}
      <MovementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMovement}
        initialType={modalInitialType}
        editingMovement={editingMovement}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Feedback */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
  );
}

export default App;
