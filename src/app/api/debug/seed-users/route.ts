import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection('users');

        const users = [
            {
                username: 'admin',
                password: 'password123', // In a real app, use hashing!
                role: 'admin',
                firstName: 'System',
                lastName: 'Admin',
                createdAt: new Date()
            },
            {
                username: 'staff',
                password: 'password123',
                role: 'staff',
                firstName: 'General',
                lastName: 'Staff',
                createdAt: new Date()
            }
        ];

        // Check if users already exist
        for (const user of users) {
            const existing = await usersCollection.findOne({ username: user.username });
            if (!existing) {
                await usersCollection.insertOne(user);
                console.log(`Created user: ${user.username}`);
            } else {
                console.log(`User ${user.username} already exists`);
            }
        }

        return NextResponse.json({ message: 'Users seeded successfully', users: ['admin', 'staff'] });
    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed users', details: String(error) }, { status: 500 });
    }
}
