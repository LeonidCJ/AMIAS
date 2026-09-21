/**
 * Utility to format monetary values in Peruvian Soles (PEN / S/)
 * according to the official es-PE locale standard (TR-021 / US-04).
 */
export function formatCurrencyPEN(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'S/ 0.00';
  }
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
