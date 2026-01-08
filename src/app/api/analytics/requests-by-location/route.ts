import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch distribution requests grouped by location (district)
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');

        // Aggregate requests by district using $lookup
        const pipeline = [
            {
                $addFields: {
                    shelterObjectId: { $toObjectId: '$shelterId' }
                }
            },
            {
                $lookup: {
                    from: 'operationcenters',
                    localField: 'shelterObjectId',
                    foreignField: '_id',
                    as: 'shelter'
                }
            },
            { $unwind: { path: '$shelter', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$shelter.district',
                    totalRequests: { $sum: 1 },
                    highUrgency: {
                        $sum: { $cond: [{ $eq: ['$urgency', 'สูง'] }, 1, 0] }
                    },
                    mediumUrgency: {
                        $sum: { $cond: [{ $eq: ['$urgency', 'กลาง'] }, 1, 0] }
                    },
                    lowUrgency: {
                        $sum: { $cond: [{ $eq: ['$urgency', 'ต่ำ'] }, 1, 0] }
                    }
                }
            },
            { $sort: { totalRequests: -1 } },
            {
                $project: {
                    _id: 0,
                    district: { $ifNull: ['$_id', 'ไม่ระบุ'] },
                    totalRequests: 1,
                    highUrgency: 1,
                    mediumUrgency: 1,
                    lowUrgency: 1
                }
            }
        ];

        const locationData = await db.collection('distributionrequests')
            .aggregate(pipeline)
            .toArray();

        // Calculate summary statistics
        const totalRequests = locationData.reduce((sum, loc: any) => sum + loc.totalRequests, 0);
        const totalDistricts = locationData.length;

        return NextResponse.json({
            success: true,
            data: locationData,
            meta: {
                totalRequests,
                totalDistricts,
                topDistrict: locationData[0]?.district || null
            }
        });
    } catch (error) {
        console.error('Requests by Location Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch requests by location',
            details: String(error)
        }, { status: 500 });
    }
}
