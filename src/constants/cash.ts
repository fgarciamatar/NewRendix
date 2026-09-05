// Denominaciones de billetes de peso argentino disponibles para el detalle de efectivo/cambio
export const CASH_DENOMINATIONS = [10, 20, 50, 100, 200, 500, 1000, 2000, 10000, 20000] as const;

export type CashDenomination = typeof CASH_DENOMINATIONS[number];
