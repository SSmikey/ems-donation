import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * Seed Database API Endpoint
 * Creates initial admin user and sample data
 * 
 * Access: GET /api/debug/seed-database
 */
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');

        const results = {
            admin: null as any,
            inventory: [] as any[]
        };

        // 1. Create Admin User
        const usersCollection = db.collection('users');
        const existingAdmin = await usersCollection.findOne({ username: 'admin' });

        if (existingAdmin) {
            results.admin = { status: 'exists', message: 'Admin user already exists' };
        } else {
            const adminUser = {
                username: 'admin',
                password: 'admin123', // TODO: Hash password in production
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                createdAt: new Date().toISOString()
            };

            const result = await usersCollection.insertOne(adminUser);
            results.admin = {
                status: 'created',
                id: result.insertedId.toString(),
                username: 'admin',
                password: 'admin123'
            };
        }

        // 2. Create Sample Inventory Items
        const inventoryCollection = db.collection('inventory');

        const sampleItems = [
            {
                itemName: 'ข้าวสาร',
                category: 'อาหาร',
                quantity: 1000,
                unit: 'กก.',
                lastUpdated: new Date().toISOString()
            },
            {
                itemName: 'น้ำดื่ม',
                category: 'น้ำดื่ม',
                quantity: 500,
                unit: 'ขวด',
                lastUpdated: new Date().toISOString()
            },
            {
                itemName: 'ผ้าห่ม',
                category: 'เครื่องนุ่งห่ม',
                quantity: 200,
                unit: 'ผืน',
                lastUpdated: new Date().toISOString()
            },
            {
                itemName: 'ยาพาราเซตามอล',
                category: 'ยาและเวชภัณฑ์',
                quantity: 300,
                unit: 'เม็ด',
                lastUpdated: new Date().toISOString()
            }
        ];

        for (const item of sampleItems) {
            const existing = await inventoryCollection.findOne({
                itemName: item.itemName,
                category: item.category
            });

            if (existing) {
                results.inventory.push({
                    status: 'exists',
                    itemName: item.itemName
                });
            } else {
                const result = await inventoryCollection.insertOne(item);
                results.inventory.push({
                    status: 'created',
                    id: result.insertedId.toString(),
                    itemName: item.itemName,
                    quantity: item.quantity,
                    unit: item.unit
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            data: results
        });

    } catch (error) {
        console.error('Seed Database Error:', error);
        return NextResponse.json({
            error: 'Failed to seed database',
            details: String(error)
        }, { status: 500 });
    }
}
