import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');
        const dbName = db.databaseName;

        // Get all collections in ems-donation
        const collections = await db.listCollections().toArray();
        const collectionDetails = [];

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            collectionDetails.push({ name: col.name, count });
        }

        // Check specific user data
        let users = await db.collection('users').find({}).limit(5).toArray();

        // Auto-seed if empty
        if (users.length === 0) {
            const initialUsers = [
                { username: 'admin', password: 'password123', role: 'admin', firstName: 'System', lastName: 'Admin', createdAt: new Date() },
                { username: 'staff', password: 'password123', role: 'staff', firstName: 'General', lastName: 'Staff', createdAt: new Date() }
            ];
            await db.collection('users').insertMany(initialUsers);
            users = await db.collection('users').find({}).limit(5).toArray();
        }

        return NextResponse.json({
            status: 'connected',
            database: dbName,
            collections: collectionDetails,
            sampleUsers: users.map(u => ({ username: u.username, role: u.role })),
            envExists: !!process.env.MONGODB_URI,
            message: 'ข้อมูลผู้ใช้ได้รับการตรวจสอบและบันทึกแล้ว (หากยังไม่เคยมี)'
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: String(error),
            env: process.env.MONGODB_URI ? 'Defined' : 'Undefined'
        }, { status: 500 });
    }
}
