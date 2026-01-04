/**
 * POST /api/distribution-requests/[id]/ship
 * Mark a distribution request as shipped
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssk-ems-donation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const requestCollection = db.collection('distribution_requests');
    const timelineCollection = db.collection('request_timelines');

    const { shippedBy, note } = await request.json();

    if (!shippedBy) {
      return NextResponse.json(
        { error: 'Missing required field: shippedBy' },
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

    // Check if request is in approved status
    if (distributionRequest.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot ship request in status: ${distributionRequest.status}` },
        { status: 400 }
      );
    }

    // Update request status
    const updateResult = await requestCollection.updateOne(
      { _id: requestId },
      {
        $set: {
          status: 'shipping',
          shippedBy,
          shippedAt: new Date(),
          note: note || distributionRequest.note,
          updatedAt: new Date(),
        },
      }
    );

    // Create timeline record
    if (updateResult.modifiedCount > 0) {
      await timelineCollection.insertOne({
        requestId: params.id,
        status: 'shipping',
        note: note || 'Request marked as shipped',
        createdBy: shippedBy,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Distribution request marked as shipped',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in ship endpoint:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to ship request' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
