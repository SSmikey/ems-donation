import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();

        return NextResponse.json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
