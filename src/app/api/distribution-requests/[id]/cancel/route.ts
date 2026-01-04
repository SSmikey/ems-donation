/**
 * POST /api/distribution-requests/[id]/cancel
 * Cancel a distribution request and release reserved stock
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { StockService } from '@/services/stockService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssk-ems-donation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const stockService = new StockService(db);
    const requestCollection = db.collection('distribution_requests');

    const { cancelReason, cancelledBy } = await request.json();

    if (!cancelledBy) {
      return NextResponse.json(
        { error: 'Missing required field: cancelledBy' },
        { status: 400 }
      );
    }

    const requestId = new ObjectId(params.id);
    const distributionRequest = await requestCollection.findOne({ _id: requestId });

    if (!distributionRequest) {
      return NextResponse.json(
        { error: 'Distribution request not found' },
        { status: 404 }
      );
    }

    // Release all reserved items
    for (const item of distributionRequest.items) {
      try {
        await stockService.releaseStock(
          item.itemId,
          item.quantity,
          params.id,
          cancelledBy
        );
      } catch (error) {
        console.error(`Failed to release item ${item.itemId}:`, error);
      }
    }

    // Update request status
    await requestCollection.updateOne(
      { _id: requestId },
      {
        $set: {
          status: 'cancelled',
          cancelledBy,
          cancelledAt: new Date(),
          cancelReason: cancelReason || '',
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Distribution request cancelled and stock released',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in cancel endpoint:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to cancel request' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
