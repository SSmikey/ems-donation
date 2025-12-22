import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const client = await clientPromise;
        // Explicitly use 'ems-donation' database
        const db = client.db('ems-donation');

        const user = await db.collection('users').findOne({ username });

        if (!user) {
            return NextResponse.json({ error: 'ไม่พบชื่อผู้ใช้งานนี้' }, { status: 401 });
        }

        if (user.password !== password) {
            return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
        }

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 });
    }
}
