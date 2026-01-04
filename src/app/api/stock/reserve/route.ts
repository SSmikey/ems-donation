/**
 * POST /api/stock/reserve
 * Reserve stock when creating a distribution request
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { StockService } from '@/services/stockService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssk-ems-donation';

export async function POST(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const stockService = new StockService(db);

    const { itemId, quantity, referenceId, createdBy } = await request.json();

    if (!itemId || !quantity || !referenceId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, quantity, referenceId, createdBy' },
        { status: 400 }
      );
    }

    const result = await stockService.reserveStock(itemId, quantity, referenceId, createdBy);

    return NextResponse.json(
      {
        success: result,
        message: `Successfully reserved ${quantity} units of item ${itemId}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in reserve endpoint:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to reserve stock' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
