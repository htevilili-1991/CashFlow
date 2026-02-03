/**
 * Currency formatting utilities for Vanuatu Vatu (VT)
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-VU', {
    style: 'currency',
    currency: 'VUV',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyWithSign = (amount: string | number, isIncome: boolean): string => {
  const sign = isIncome ? '+' : '-';
  return `${sign} ${formatCurrency(Number(amount))}`;
};

export const CURRENCY_CODE = 'VT';
export const CURRENCY_SYMBOL = 'VT';
export const CURRENCY_NAME = 'Vanuatu Vatu';
