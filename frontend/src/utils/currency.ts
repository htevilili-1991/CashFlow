/**
 * Currency formatting utilities for Vanuatu Vatu (VT)
 */

export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `VT ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export const formatCurrencyWithSign = (amount: string | number, isIncome: boolean): string => {
  const sign = isIncome ? '+' : '-';
  return `${sign} ${formatCurrency(amount)}`;
};

export const CURRENCY_CODE = 'VT';
export const CURRENCY_SYMBOL = 'VT';
export const CURRENCY_NAME = 'Vanuatu Vatu';
