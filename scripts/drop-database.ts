import clientPromise from '../src/lib/mongodb';

async function dropDatabase() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');

        console.log('🗑️  Dropping database: ems-donation');
        await db.dropDatabase();
        console.log('✅ Database dropped successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error dropping database:', error);
        process.exit(1);
    }
}

dropDatabase();
