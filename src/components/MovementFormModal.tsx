import React, { useState, useEffect, useRef } from 'react';
import type { Movement, MovementType, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { getTodayInputValue, getShiftFromDateString } from '../utils/formatters';
import { X, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movement: Omit<Movement, 'id' | 'createdAt'> & { id?: string }) => void;
  initialType?: MovementType;
  editingMovement?: Movement | null;
}

export const MovementFormModal: React.FC<MovementFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'entrada',
  editingMovement = null
}) => {
  const [type, setType] = useState<MovementType>(initialType);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('ventas');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [date, setDate] = useState(getTodayInputValue());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ concept?: string; amount?: string }>({});

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (editingMovement) {
      setType(editingMovement.type);
      setConcept(editingMovement.concept);
      setAmount(editingMovement.amount.toString());
      setCategory(editingMovement.category);
      setPaymentMethod(editingMovement.paymentMethod);
      const currentDate = editingMovement.date || getTodayInputValue();
      setDate(currentDate);
      setNote(editingMovement.note || '');
    } else {
      setType(initialType);
      setConcept('');
      setAmount('');
      const defaultCat = CATEGORIES.find(c => c.type === initialType || c.type === 'both')?.id || 'otros';
      setCategory(defaultCat);
      setPaymentMethod('efectivo');
      const todayDate = getTodayInputValue();
      setDate(todayDate);
      setNote('');
    }
    setErrors({});
  }, [editingMovement, initialType, isOpen]);

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    const currentCatDef = CATEGORIES.find(c => c.id === category);
    if (!currentCatDef || (currentCatDef.type !== 'both' && currentCatDef.type !== newType)) {
      const availableCat = CATEGORIES.find(c => c.type === newType || c.type === 'both')?.id || 'otros';
      setCategory(availableCat);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { concept?: string; amount?: string } = {};

    if (!concept.trim()) {
      newErrors.concept = 'El concepto es obligatorio';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Ingresa un monto válido mayor a 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(editingMovement ? { id: editingMovement.id } : {}),
      type,
      concept: concept.trim(),
      amount: numAmount,
      category,
      paymentMethod,
      date,
      shift: getShiftFromDateString(date),
      note: note.trim()
    });

    onClose();
  };

  // Handle Enter key to jump to next input field or submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!formRef.current) return;

      const formElements = Array.from(
        formRef.current.querySelectorAll<HTMLElement>('input, select, button[type="submit"]')
      ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);

      const currentIndex = formElements.indexOf(e.currentTarget);
      if (currentIndex !== -1 && currentIndex < formElements.length - 1) {
        const nextElement = formElements[currentIndex + 1];
        if (nextElement.getAttribute('type') === 'submit') {
          handleSubmit();
        } else {
          nextElement.focus();
        }
      } else {
        handleSubmit();
      }
    }
  };

  if (!isOpen) return null;

  const availableCategories = CATEGORIES.filter(c => c.type === type || c.type === 'both');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingMovement ? 'Editar Movimiento' : `Registrar Nueva ${type === 'entrada' ? 'Entrada' : 'Salida'}`}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Type selector toggle */}
          <div className="type-selector-toggle">
            <button
              type="button"
              className={`type-option-btn ${type === 'entrada' ? 'selected-entrada' : ''}`}
              onClick={() => handleTypeChange('entrada')}
            >
              <ArrowUpRight size={18} />
              <span>Entrada</span>
            </button>
            <button
              type="button"
              className={`type-option-btn ${type === 'salida' ? 'selected-salida' : ''}`}
              onClick={() => handleTypeChange('salida')}
            >
              <ArrowDownRight size={18} />
              <span>Salida</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="form-group">
            <label className="form-label">Monto (en Pesos $) *</label>
            <div className="input-with-symbol">
              <span className="currency-prefix">$</span>
              <input 
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            {errors.amount && (
              <span style={{ color: 'var(--salida-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.amount}
              </span>
            )}
          </div>

          {/* Concept Input */}
          <div className="form-group">
            <label className="form-label">Concepto / Descripción *</label>
            <input 
              type="text"
              placeholder="Ej. Venta mañana, Pago proveedor..."
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {errors.concept && (
              <span style={{ color: 'var(--salida-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.concept}
              </span>
            )}
          </div>

          {/* Category & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-group">
            <div>
              <label className="form-label">Categoría</label>
              <select 
                className="form-select"
                style={{ width: '100%' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={handleKeyDown}
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Medio de Pago</label>
              <select 
                className="form-select"
                style={{ width: '100%' }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                onKeyDown={handleKeyDown}
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label className="form-label">Fecha y Hora (Sistema)</label>
            <input 
              type="datetime-local"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Note / Reference */}
          <div className="form-group">
            <label className="form-label">Nota o Referencia (Opcional)</label>
            <input 
              type="text"
              placeholder="Ej. Nº de Recibo, Comprobante..."
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`btn ${type === 'entrada' ? 'btn-entrada' : 'btn-salida'}`}
            >
              <Check size={18} />
              <span>{editingMovement ? 'Guardar Cambios' : `Registrar ${type === 'entrada' ? 'Entrada' : 'Salida'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

