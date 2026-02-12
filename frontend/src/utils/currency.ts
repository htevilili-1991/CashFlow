/**
 * Currency formatting utilities for Vanuatu Vatu (VT)
 */

export const formatCurrency = (amount: number | string): string => {
  const numAmount = Number(amount);
  
  return new Intl.NumberFormat('en-VU', {
    style: 'currency',
    currency: 'VUV',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export const formatCurrencyFromCents = (amount: number): string => {
  // Convert from cents to dollars for recurring transactions
  const amountInDollars = amount / 100;
  
  return new Intl.NumberFormat('en-VU', {
    style: 'currency',
    currency: 'VUV',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInDollars);
};

export const formatCurrencyWithSign = (amount: string | number, isIncome: boolean): string => {
  const sign = isIncome ? '+' : '-';
  return `${sign} ${formatCurrency(Number(amount))}`;
};

export const CURRENCY_CODE = 'VT';
export const CURRENCY_SYMBOL = 'VT';
export const CURRENCY_NAME = 'Vanuatu Vatu';
