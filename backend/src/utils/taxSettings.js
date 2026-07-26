import { getSettings } from '../jsonStore.js';

export const DEFAULT_TAX_SETTINGS = {
  vatPercentage: 18,
  enabled: true,
  autoApply: true,
};

export function getTaxSettings() {
  const tax = getSettings().tax || {};
  return {
    ...DEFAULT_TAX_SETTINGS,
    ...tax,
    vatPercentage: Number(tax.vatPercentage ?? DEFAULT_TAX_SETTINGS.vatPercentage),
    enabled: tax.enabled !== false && tax.enabled !== 'false',
    autoApply: tax.autoApply !== false && tax.autoApply !== 'false',
  };
}

export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}
