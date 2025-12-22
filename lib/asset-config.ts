// lib/asset-config.ts

/**
 * Asset price configuration
 * Update these values regularly or consider fetching from an API
 * Last updated: 2025-01-XX
 */
export const ASSET_PRICES: Record<string, number> = {
  // Stocks (price per share in EUR)
  mwrd: 85.5,
  smea: 32.2,
  xmme: 40.1,
  
  // Crypto (price per unit in EUR)
  eth: 2450.0,
  sol: 110.0,
  link: 14.5,
  op: 2.1,
  usdt: 1.0,
  
  // Bonds, liquidity, pension funds are stored directly in EUR
  // so they don't need price multipliers
};

/**
 * Asset class groupings
 * Maps asset classes to their component fields in MonthlyPortfolio
 */
export const ASSET_MAPPING = {
  Liquidity: ['ing', 'bbva', 'revolut', 'directa'],
  Stock: ['mwrd', 'smea', 'xmme'],
  Bond: ['bond'],
  'Fondo Pensione': ['cometa'],
  Crypto: ['eth', 'sol', 'link', 'op', 'usdt']
} as const;

export type CategoryNames = keyof typeof ASSET_MAPPING;

/**
 * Color scheme for each asset class
 * Used in charts and visualizations
 */
export const ASSET_CLASS_COLORS: Record<CategoryNames, string> = {
  'Liquidity': 'bg-blue-500',
  'Stock': 'bg-green-500',
  'Crypto': 'bg-purple-500',
  'Fondo Pensione': 'bg-orange-500',
  'Bond': 'bg-yellow-500'
};

/**
 * Helper function to get asset class for a given field
 */
export function getAssetClassForField(field: string): CategoryNames | null {
  // Usiamo Object.entries con un casting a unknown per iterare correttamente sulle chiavi
  const entries = Object.entries(ASSET_MAPPING) as unknown as [CategoryNames, readonly string[]][];
  
  for (const [assetClass, fields] of entries) {
    // Castiamo field a 'any' o 'string' all'interno di includes per bypassare il controllo sulle tuple readonly
    if ((fields as readonly string[]).includes(field)) {
      return assetClass;
    }
  }
  return null;
}

/**
 * Helper to format currency values
 */
export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Helper to format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}