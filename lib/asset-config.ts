// lib/asset-config.ts

import { getUsdToEurRate, convertUsdToEur } from './usd-eur-converter';

export const ASSET_MAPPING = {
  Liquidity: ['ing', 'bbva', 'revolut', 'directa'],
  Stock: ['mwrd', 'smea', 'xmme'],
  Bond: ['bond'],
  'Fondo Pensione': ['cometa'],
  Crypto: ['eth', 'sol', 'link', 'op', 'usdt']
} as const;

export type CategoryNames = keyof typeof ASSET_MAPPING;

const ETF_SYMBOLS: Record<string, string> = {
  mwrd: 'MWRD.PAR',
  smea: 'SMEA.LON',
  xmme: 'XMME.DEX'
};

/**
 * Calcola la data target: ultimo del mese o ieri se il mese è quello corrente.
 */
function getTargetDateStr(date: Date): string {
  const target = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const finalDate = target > yesterday ? yesterday : target;
  return finalDate.toISOString().split('T')[0];
}

/**
 * Utility per attendere un determinato numero di millisecondi
 */
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Fetch Prezzo ETF da AlphaVantage (già in EUR)
 */
export async function fetchEtfPrice(ticker: string, targetDate: Date): Promise<number> {
  const symbol = ETF_SYMBOLS[ticker];
  if (!symbol) return 0;

  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json["Note"] || json["Error Message"]) {
      console.warn(`AlphaVantage info per ${ticker}:`, json["Note"] || json["Error Message"]);
      return 0;
    }

    const meta = json["Meta Data"];
    const series = json["Time Series (Daily)"];

    if (!meta || !series) {
      console.error(`Dati non trovati per ${ticker}`);
      return 0;
    }

    const lastRefreshedStr = meta["3. Last Refreshed"];
    const lastRefreshedDate = new Date(lastRefreshedStr);
    const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const startDate = lastDayOfMonth > lastRefreshedDate ? lastRefreshedDate : lastDayOfMonth;

    let price = 0;
    
    for (let i = 0; i <= 7; i++) {
      const searchDate = new Date(startDate);
      searchDate.setDate(searchDate.getDate() - i); 
      
      const dateKey = searchDate.toISOString().split('T')[0];
      
      if (series[dateKey]) {
        price = parseFloat(series[dateKey]["4. close"]);
        break; 
      }
    }

    // SMEA correction (pence to pounds)
    if (ticker === 'smea' && price > 1000) {
      price = price / 100;
    }

    return price;

  } catch (error) {
    console.error(`Eccezione fetch ETF ${ticker}:`, error);
    return 0;
  }
}

/**
 * Recupera il prezzo Crypto da CryptoCompare (in USD) e converte in EUR
 */
export async function fetchCryptoPrice(symbol: string, date: Date): Promise<number> {
  // USDT fixed at 0.90 EUR as requested
  if (symbol.toLowerCase() === 'usdt') return 0.90;
  
  try {
    // 1. Get crypto price in USD
    const dateStr = getTargetDateStr(date);
    const timestamp = Math.floor(new Date(dateStr).getTime() / 1000);
    
    const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
    const cryptoResponse = await fetch(
      `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${symbol.toUpperCase()}&tsyms=USD&ts=${timestamp}&api_key=${apiKey}`
    );
    
    const cryptoData = await cryptoResponse.json();
    const priceUsd = cryptoData[symbol.toUpperCase()]?.["USD"] || 0;
    
    if (priceUsd === 0) {
      console.warn(`No USD price found for ${symbol} on ${dateStr}`);
      return 0;
    }
    
    // 2. Get USD/EUR exchange rate for that date
    const exchangeRate = await getUsdToEurRate(date);
    
    // 3. Convert USD to EUR
    const priceEur = convertUsdToEur(priceUsd, exchangeRate);
    
    console.log(`💱 ${symbol.toUpperCase()}: $${priceUsd.toFixed(2)} × ${exchangeRate.toFixed(4)} = €${priceEur.toFixed(2)}`);
    
    return priceEur;
    
  } catch (error) {
    console.error(`Error fetch Crypto ${symbol}:`, error);
    return 0;
  }
}

export const ASSET_CLASS_COLORS: Record<CategoryNames, string> = {
  'Liquidity': 'bg-blue-500',
  'Stock': 'bg-green-500',
  'Crypto': 'bg-purple-500',
  'Fondo Pensione': 'bg-orange-500',
  'Bond': 'bg-yellow-500'
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}