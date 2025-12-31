// lib/usd-eur-converter.ts

// 1. Definiamo l'interfaccia per la struttura dei tassi dell'API
interface FrankfurterRates {
  [date: string]: {
    EUR: number;
  };
}

/**
 * Fetches historical USD to EUR exchange rate for a specific date
 */
export async function getUsdToEurRate(date: Date): Promise<number> {
  try {
    const dateStr = date.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.frankfurter.app/${dateStr}?from=USD&to=EUR`
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch USD/EUR rate for ${dateStr}, using fallback`);
      return getFallbackRate(date);
    }
    
    // Tipizziamo la risposta singola
    const data = await response.json() as { rates: { EUR: number } };
    return data.rates.EUR || getFallbackRate(date);
  } catch (error) {
    console.error(`Error fetching USD/EUR rate:`, error);
    return getFallbackRate(date);
  }
}

/**
 * Batch fetch multiple USD to EUR rates for a date range
 */
export async function getUsdToEurRatesBatch(
  startDate: Date,
  endDate: Date
): Promise<Map<string, number>> {
  try {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.frankfurter.app/${start}..${end}?from=USD&to=EUR`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch batch rates`);
    }
    
    // 2. Tipizziamo la risposta batch
    const data = await response.json() as { rates: FrankfurterRates };
    const ratesMap = new Map<string, number>();
    
    // 3. Rimuoviamo [string, any] e usiamo la corretta tipizzazione
    Object.entries(data.rates).forEach(([date, details]) => {
      ratesMap.set(date, details.EUR);
    });
    
    return ratesMap;
  } catch (error) {
    console.error(`Error fetching batch USD/EUR rates:`, error);
    return new Map();
  }
}

/**
 * Fallback rates based on historical averages when API fails
 */
function getFallbackRate(date: Date): number {
  const year = date.getFullYear();
  
  const fallbackRates: Record<number, number> = {
    2015: 0.9015,
    2016: 0.9034,
    2017: 0.8852,
    2018: 0.8469,
    2019: 0.8933,
    2020: 0.8755,
    2021: 0.8455,
    2022: 0.9504,
    2023: 0.9251,
    2024: 0.9264,
    2025: 0.95,
  };
  
  return fallbackRates[year] || 0.92;
}

export function convertUsdToEur(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));