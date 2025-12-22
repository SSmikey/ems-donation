const fs = require('fs');
const { MongoClient } = require('mongodb');

async function forceSeed() {
    try {
        let uri = '';
        if (fs.existsSync('.env.local')) {
            const envContent = fs.readFileSync('.env.local', 'utf8');
            const match = envContent.match(/MONGODB_URI=(.+)/);
            if (match) uri = match[1].trim();
        }

        if (!uri) {
            console.error('MONGODB_URI not found in .env.local');
            return;
        }

        console.log('Connecting to MongoDB...');
        const client = new MongoClient(uri);
        await client.connect();

        // Explicitly use 'ems-donation' database
        const db = client.db('ems-donation');
        console.log('Target Database:', db.databaseName);

        const usersCollection = db.collection('users');

        const users = [
            { username: 'admin', password: 'password123', role: 'admin', firstName: 'System', lastName: 'Admin', createdAt: new Date() },
            { username: 'staff', password: 'password123', role: 'staff', firstName: 'General', lastName: 'Staff', createdAt: new Date() }
        ];

        for (const user of users) {
            await usersCollection.updateOne(
                { username: user.username },
                { $set: user },
                { upsert: true }
            );
            console.log(`Upserted user: ${user.username}`);
        }

        console.log('Verifying data...');
        const count = await usersCollection.countDocuments();
        const allUsers = await usersCollection.find({}).project({ username: 1 }).toArray();
        console.log(`Total users in '${db.databaseName}.users': ${count}`);
        console.log('User list:', allUsers.map(u => u.username));

        await client.close();
        console.log('Done.');
    } catch (err) {
        console.error('Error:', err);
    }
}

forceSeed();
