import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Movement } from '../types';
import { formatCurrency, formatDateTime, getShiftFromDateString } from './formatters';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { CASH_DENOMINATIONS } from '../constants/cash';

export const exportMovementsToPDF = (movements: Movement[], activeShift: 'Mañana' | 'Tarde' = 'Tarde') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const entradas = movements.filter(m => m.type === 'entrada');
  const salidas = movements.filter(m => m.type === 'salida');

  const totalEntradas = entradas.reduce((sum, m) => sum + m.amount, 0);
  const totalSalidas = salidas.reduce((sum, m) => sum + m.amount, 0);
  const balanceNeto = totalEntradas - totalSalidas;

  const todayStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Title & Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('RENDIX', 14, 18);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Planilla de Registro de Entradas y Salidas - Turno ${activeShift}`, 14, 25);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha de emisión: ${todayStr} | Turno Activo: ${activeShift}`, 14, 31);
  doc.text(`Total registros: ${movements.length}`, 140, 31, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 34, 196, 34);

  let currentY = 40;

  // Helper to resolve labels
  const getCatName = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.name || catId;
  };

  const getPayName = (payId: string) => {
    return PAYMENT_METHODS.find(p => p.id === payId)?.label || payId;
  };

  // --- TABLA DE ENTRADAS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Emerald green
  doc.text(`1. ENTRADAS (${entradas.length})`, 14, currentY);

  const entradasBody = entradas.map(m => [
    m.concept + (m.note ? ` (${m.note})` : ''),
    getCatName(m.category),
    getPayName(m.paymentMethod),
    m.shift || getShiftFromDateString(m.date),
    formatDateTime(m.date),
    formatCurrency(m.amount)
  ]);

  if (entradasBody.length === 0) {
    entradasBody.push(['Sin entradas registradas', '-', '-', '-', '-', '$ 0,00']);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Concepto / Descripción', 'Categoría', 'Medio de Pago', 'Turno', 'Fecha', 'Monto']],
    body: entradasBody,
    foot: [['TOTAL ENTRADAS', '', '', '', '', formatCurrency(totalEntradas)]],
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    footStyles: {
      fillColor: [236, 253, 245],
      textColor: [6, 95, 70],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 32 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Check if we need a new page
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // --- TABLA DE SALIDAS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(244, 63, 94); // Rose red
  doc.text(`2. SALIDAS (${salidas.length})`, 14, currentY);

  const salidasBody = salidas.map(m => [
    m.concept + (m.note ? ` (${m.note})` : ''),
    getCatName(m.category),
    getPayName(m.paymentMethod),
    m.shift || getShiftFromDateString(m.date),
    formatDateTime(m.date),
    formatCurrency(m.amount)
  ]);

  if (salidasBody.length === 0) {
    salidasBody.push(['Sin salidas registradas', '-', '-', '-', '-', '$ 0,00']);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Concepto / Descripción', 'Categoría', 'Medio de Pago', 'Turno', 'Fecha', 'Monto']],
    body: salidasBody,
    foot: [['TOTAL SALIDAS', '', '', '', '', formatCurrency(totalSalidas)]],
    theme: 'grid',
    headStyles: {
      fillColor: [244, 63, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    footStyles: {
      fillColor: [255, 241, 242],
      textColor: [159, 18, 57],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 32 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 12;

  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // --- DETALLE DE EFECTIVO (solo "efectivo", el "cambio" no se imprime) ---
  const cashDetailsToPrint = movements.filter(m => m.cashDetail && m.cashDetail.kind === 'efectivo');

  if (cashDetailsToPrint.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Emerald green
    doc.text(`3. DETALLE DE EFECTIVO (${cashDetailsToPrint.length})`, 14, currentY);
    currentY += 6;

    cashDetailsToPrint.forEach((m) => {
      const breakdown = m.cashDetail!.breakdown;
      const rows = CASH_DENOMINATIONS
        .filter(denom => (breakdown[denom] || 0) > 0)
        .map(denom => [
          `$ ${denom.toLocaleString('es-AR')}`,
          String(breakdown[denom]),
          formatCurrency(denom * breakdown[denom])
        ]);

      if (rows.length === 0) {
        rows.push(['-', '-', formatCurrency(0)]);
      }

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${m.concept} · ${m.type === 'entrada' ? 'Entrada' : 'Salida'} · ${formatDateTime(m.date)}${m.note ? ` · ${m.note}` : ''}`,
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 3,
        head: [['Denominación', 'Cantidad', 'Subtotal']],
        body: rows,
        foot: [['TOTAL', '', formatCurrency(m.amount)]],
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        footStyles: {
          fillColor: [236, 253, 245],
          textColor: [6, 95, 70],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14 }
      });

      // @ts-ignore
      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    currentY += 4;
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
  }

  // --- RESUMEN FINAL / BALANCE (ENTRADAS - SALIDAS) ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, currentY, 182, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`RESUMEN DE BALANCE FINAL - TURNO ${activeShift.toUpperCase()}`, 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`(+) Total Entradas:  ${formatCurrency(totalEntradas)}`, 20, currentY + 17);
  doc.text(`(-) Total Salidas:   ${formatCurrency(totalSalidas)}`, 20, currentY + 24);

  // Balance box highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  if (balanceNeto >= 0) {
    doc.setTextColor(6, 95, 70); // Green
  } else {
    doc.setTextColor(159, 18, 57); // Red
  }

  const balanceText = `BALANCE (ENTRADAS - SALIDAS): ${formatCurrency(balanceNeto)}`;
  doc.text(balanceText, 20, currentY + 32);

  // Save PDF
  const filename = `rendix_planilla_turno_${activeShift.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
