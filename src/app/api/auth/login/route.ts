import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const client = await clientPromise;
        const db = client.db('ems-donation');

        const user = await db.collection('users').findOne({ username });

        if (!user) {
            return NextResponse.json({ error: 'ไม่พบชื่อผู้ใช้งานนี้' }, { status: 401 });
        }

        // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
        const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

        let isPasswordValid = false;
        if (isPasswordHashed) {
            // Compare with bcrypt for hashed passwords
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            // Plain text comparison for legacy passwords
            isPasswordValid = user.password === password;
        }

        if (!isPasswordValid) {
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
