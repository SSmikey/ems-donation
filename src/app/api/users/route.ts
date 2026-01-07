import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();

        console.log(`Fetched ${users.length} users from database`);
        return NextResponse.json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, username, password, role } = body;

        // Validation
        const errors: string[] = [];

        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
            errors.push('fullName is required');
        }
        if (!username || typeof username !== 'string' || username.trim() === '') {
            errors.push('username is required');
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            errors.push('password is required and must be at least 6 characters');
        }
        if (!role || !['admin', 'staff'].includes(role)) {
            errors.push('role must be either "admin" or "staff"');
        }

        if (errors.length > 0) {
            return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const usersCollection = db.collection('users');

        console.log('Connected to database:', db.databaseName);

        // Check if username already exists
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        // Parse full name into firstName and lastName
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            username,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        console.log('Attempting to insert user:', { username, firstName, lastName, role });
        const result = await usersCollection.insertOne(newUser);
        console.log('Insert result:', result);

        // Return user without password
        const userResponse = {
            _id: result.insertedId.toString(),
            username,
            firstName,
            lastName,
            role,
            status: 'active'
        };

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
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
        const db = client.db('ems-donation');
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
