// lib/usd-eur-converter.ts

/**
 * Fetches historical USD to EUR exchange rate for a specific date
 * Uses Frankfurter API (free, no API key required)
 */
export async function getUsdToEurRate(date: Date): Promise<number> {
  try {
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const response = await fetch(
      `https://api.frankfurter.app/${dateStr}?from=USD&to=EUR`
    );
    
    if (!response.ok) {
      console.warn(`Failed to fetch USD/EUR rate for ${dateStr}, using fallback`);
      return getFallbackRate(date);
    }
    
    const data = await response.json();
    return data.rates.EUR || getFallbackRate(date);
  } catch (error) {
    console.error(`Error fetching USD/EUR rate:`, error);
    return getFallbackRate(date);
  }
}

/**
 * Batch fetch multiple USD to EUR rates for a date range
 * More efficient for bulk operations
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
    
    const data = await response.json();
    const ratesMap = new Map<string, number>();
    
    // Convert response to Map for easy lookup
    Object.entries(data.rates).forEach(([date, rates]: [string, any]) => {
      ratesMap.set(date, rates.EUR);
    });
    
    return ratesMap;
  } catch (error) {
    console.error(`Error fetching batch USD/EUR rates:`, error);
    return new Map();
  }
}

/**
 * Fallback rates based on historical averages when API fails
 * Source: ECB historical data averages by year
 */
function getFallbackRate(date: Date): number {
  const year = date.getFullYear();
  
  // Historical yearly average rates USD to EUR
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
    2025: 0.95, // Estimated
  };
  
  return fallbackRates[year] || 0.92; // Default fallback
}

/**
 * Convert USD price to EUR
 */
export function convertUsdToEur(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate;
}

/**
 * Utility to add delay between API calls
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));