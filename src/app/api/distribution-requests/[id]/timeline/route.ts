/**
 * GET /api/distribution-requests/[id]/timeline
 * Get request timeline history
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { StockService } from '@/services/stockService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssk-ems-donation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const stockService = new StockService(db);

    const timeline = await stockService.getRequestTimeline(params.id);

    return NextResponse.json(
      {
        success: true,
        count: timeline.length,
        data: timeline,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in timeline endpoint:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch timeline' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
