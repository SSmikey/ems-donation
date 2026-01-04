/**
 * POST /api/distribution-requests/[id]/complete
 * Mark a distribution request as completed and deduct stock
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

    const { completedBy, note } = await request.json();

    if (!completedBy) {
      return NextResponse.json(
        { error: 'Missing required field: completedBy' },
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

    // Check if request is in shipping status
    if (distributionRequest.status !== 'shipping') {
      return NextResponse.json(
        { error: `Cannot complete request in status: ${distributionRequest.status}` },
        { status: 400 }
      );
    }

    // Deduct stock for all items
    for (const item of distributionRequest.items) {
      try {
        await stockService.deductStock(
          item.itemId,
          item.quantity,
          distributionRequest.shelterId,
          params.id,
          completedBy
        );
      } catch (error) {
        console.error(`Failed to deduct item ${item.itemId}:`, error);
        throw error;
      }
    }

    // Update request status
    await requestCollection.updateOne(
      { _id: requestId },
      {
        $set: {
          status: 'completed',
          completedBy,
          completedAt: new Date(),
          note: note || distributionRequest.note,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Distribution request completed and stock deducted',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in complete endpoint:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to complete request' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
