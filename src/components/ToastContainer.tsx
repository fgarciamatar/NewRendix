import React from 'react';
import type { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div style={{ marginTop: '2px' }}>
            {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--entrada-color)' }} />}
            {toast.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--salida-color)' }} />}
            {toast.type === 'info' && <Info size={18} style={{ color: 'var(--accent-primary)' }} />}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {toast.title}
            </div>
            {toast.message && (
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {toast.message}
              </div>
            )}
          </div>

          <button 
            className="close-btn" 
            onClick={() => onDismiss(toast.id)}
            style={{ padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
