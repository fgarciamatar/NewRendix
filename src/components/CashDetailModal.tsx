import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Movement, MovementType, CashDetailKind, CashBreakdown } from '../types';
import { CASH_DENOMINATIONS } from '../constants/cash';
import { getTodayInputValue, getShiftFromDateString, formatCurrency } from '../utils/formatters';
import { X, ArrowUpRight, ArrowDownRight, Check, DollarSign, AlertTriangle } from 'lucide-react';

interface CashDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movement: Omit<Movement, 'id' | 'createdAt'> & { id?: string }) => void;
  movements: Movement[];
}

const emptyBreakdown = (): CashBreakdown => {
  const breakdown: CashBreakdown = {};
  CASH_DENOMINATIONS.forEach(denom => { breakdown[denom] = 0; });
  return breakdown;
};

export const CashDetailModal: React.FC<CashDetailModalProps> = ({
  isOpen,
  onClose,
  onSave,
  movements
}) => {
  const [kind, setKind] = useState<CashDetailKind>('efectivo');
  const [type, setType] = useState<MovementType>('salida');
  const [breakdown, setBreakdown] = useState<CashBreakdown>(emptyBreakdown());
  const [date, setDate] = useState(getTodayInputValue());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const formRef = useRef<HTMLFormElement>(null);

  // Solo se permite un "Detalle Efectivo" por planilla (el "Detalle Cambio" no tiene límite)
  const yaExisteDetalleEfectivo = useMemo(
    () => movements.some(m => m.cashDetail?.kind === 'efectivo'),
    [movements]
  );

  // Reset form each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setKind(yaExisteDetalleEfectivo ? 'cambio' : 'efectivo');
      setType('salida');
      setBreakdown(emptyBreakdown());
      setDate(getTodayInputValue());
      setNote('');
      setError(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const total = useMemo(() => {
    return CASH_DENOMINATIONS.reduce((sum, denom) => sum + denom * (breakdown[denom] || 0), 0);
  }, [breakdown]);

  const handleQtyChange = (denom: number, value: string) => {
    const qty = value === '' ? 0 : parseInt(value, 10);
    setBreakdown(prev => ({ ...prev, [denom]: isNaN(qty) || qty < 0 ? 0 : qty }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (kind === 'efectivo' && yaExisteDetalleEfectivo) {
      setError('Ya existe un Detalle Efectivo en esta planilla. Solo se permite uno: eliminá el existente antes de cargar uno nuevo.');
      return;
    }

    if (total <= 0) {
      setError('Ingresa al menos una cantidad de billetes mayor a 0');
      return;
    }

    const concept = kind === 'efectivo' ? 'Detalle Efectivo' : 'Detalle Cambio';
    const category = kind === 'efectivo' ? 'detalle_efectivo' : 'detalle_cambio';

    onSave({
      type,
      concept,
      amount: total,
      category,
      paymentMethod: 'efectivo',
      date,
      shift: getShiftFromDateString(date),
      note: note.trim(),
      cashDetail: {
        kind,
        breakdown: { ...breakdown }
      }
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} style={{ color: '#10b981' }} />
            Detalle Efectivo
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          {yaExisteDetalleEfectivo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                background: 'var(--salida-bg)',
                border: '1px solid var(--salida-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--salida-color)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                Ya existe un Detalle Efectivo en esta planilla. Solo se permite uno por planilla:
                podés cargar un Detalle de Cambio, o eliminar el Detalle Efectivo existente antes de agregar otro.
              </span>
            </div>
          )}

          {/* Kind selector: Efectivo / Cambio */}
          <div className="form-group">
            <label className="form-label">Tipo de Detalle</label>
            <select
              className="form-select"
              style={{ width: '100%' }}
              value={kind}
              onChange={(e) => setKind(e.target.value as CashDetailKind)}
              onKeyDown={handleKeyDown}
            >
              <option value="efectivo" disabled={yaExisteDetalleEfectivo}>
                Detalle de Efectivo{yaExisteDetalleEfectivo ? ' (ya cargado)' : ''}
              </option>
              <option value="cambio">Detalle de Cambio</option>
            </select>
          </div>

          {/* Entrada / Salida toggle */}
          <div className="type-selector-toggle">
            <button
              type="button"
              className={`type-option-btn ${type === 'entrada' ? 'selected-entrada' : ''}`}
              onClick={() => setType('entrada')}
            >
              <ArrowUpRight size={18} />
              <span>Entrada</span>
            </button>
            <button
              type="button"
              className={`type-option-btn ${type === 'salida' ? 'selected-salida' : ''}`}
              onClick={() => setType('salida')}
            >
              <ArrowDownRight size={18} />
              <span>Salida</span>
            </button>
          </div>

          {/* Denomination inputs */}
          <div className="form-group">
            <label className="form-label">Cantidad de Billetes por Denominación</label>
            <div className="cash-denominations-grid">
              <div className="cash-denom-row cash-denom-header">
                <span>Billete</span>
                <span>Cantidad</span>
                <span style={{ textAlign: 'right' }}>Subtotal</span>
              </div>
              {CASH_DENOMINATIONS.map(denom => (
                <div key={denom} className="cash-denom-row">
                  <span className="cash-denom-label">$ {denom.toLocaleString('es-AR')}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    className="form-input cash-denom-input"
                    value={breakdown[denom] || ''}
                    onChange={(e) => handleQtyChange(denom, e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <span className="cash-denom-subtotal">
                    {formatCurrency(denom * (breakdown[denom] || 0))}
                  </span>
                </div>
              ))}
            </div>

            <div className="cash-total-row">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {error && (
              <span style={{ color: 'var(--salida-color)', fontSize: '0.75rem', marginTop: '8px', display: 'block' }}>
                {error}
              </span>
            )}
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
              placeholder="Ej. Arqueo de caja, Cierre de turno..."
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
              disabled={kind === 'efectivo' && yaExisteDetalleEfectivo}
            >
              <Check size={18} />
              <span>Registrar {kind === 'efectivo' ? 'Detalle Efectivo' : 'Detalle Cambio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
