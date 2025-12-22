const fs = require('fs');
const { MongoClient } = require('mongodb');

async function seed() {
    try {
        let uri = process.env.MONGODB_URI;

        if (!uri && fs.existsSync('.env.local')) {
            const envContent = fs.readFileSync('.env.local', 'utf8');
            const match = envContent.match(/MONGODB_URI=(.+)/);
            if (match) uri = match[1].trim();
        }

        if (!uri) {
            console.error('Error: MONGODB_URI not found');
            process.exit(1);
        }

        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db();
        const usersCollection = db.collection('users');

        const users = [
            {
                username: 'admin',
                password: 'password123',
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

        for (const user of users) {
            const existing = await usersCollection.findOne({ username: user.username });
            if (!existing) {
                await usersCollection.insertOne(user);
                console.log(`Created user: ${user.username}`);
            } else {
                console.log(`User ${user.username} already exists`);
            }
        }

        await client.close();
        console.log('Seeding completed successfully');
    } catch (err) {
        console.error('Seed script error:', err);
        process.exit(1);
    }
}

seed();
