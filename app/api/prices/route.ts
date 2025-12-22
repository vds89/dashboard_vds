// app/api/portfolio/prices/route.ts
/**
 * API endpoint to get and update asset prices
 * This is optional but useful for maintaining price data
 */

import { NextResponse } from 'next/server';
import { ASSET_PRICES } from '@/lib/asset-config';

export async function GET() {
  try {
    return NextResponse.json({
      prices: ASSET_PRICES,
      lastUpdated: new Date().toISOString(),
      note: "Prices are configured in lib/asset-config.ts"
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

// Optional: Allow price updates via API
// Uncomment if you want to update prices programmatically
/*
export async function POST(request: Request) {
  try {
    const { prices, apiKey } = await request.json();
    
    // Add authentication here
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate prices format
    if (!prices || typeof prices !== 'object') {
      return NextResponse.json(
        { error: 'Invalid prices format' },
        { status: 400 }
      );
    }
    
    // Here you would typically:
    // 1. Validate the price data
    // 2. Update a database table with prices
    // 3. Or write to a config file
    
    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json(
      { error: 'Failed to update prices' },
      { status: 500 }
    );
  }
}
*/