/**
 * GET /api/stock/transactions
 * Get stock transaction history with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { StockService } from '@/services/stockService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssk-ems-donation';

export async function GET(request: NextRequest) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const stockService = new StockService(db);

    const searchParams = request.nextUrl.searchParams;

    const filters: any = {};

    if (searchParams.has('itemId')) {
      filters.itemId = searchParams.get('itemId');
    }

    if (searchParams.has('transactionType')) {
      filters.transactionType = searchParams.get('transactionType');
    }

    if (searchParams.has('referenceId')) {
      filters.referenceId = searchParams.get('referenceId');
    }

    if (searchParams.has('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate') as string);
    }

    if (searchParams.has('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate') as string);
    }

    const transactions = await stockService.getTransactions(filters);

    return NextResponse.json(
      {
        success: true,
        count: transactions.length,
        data: transactions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in transactions endpoint:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
