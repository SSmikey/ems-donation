/**
 * Database Seeding Script
 * Creates initial admin user and sample data
 * 
 * Run with: npx ts-node scripts/seed-database.ts
 */

// Import MongoDB client
// Note: Using dynamic import to avoid module resolution issues with ts-node
const getMongoClient = async () => {
    const { default: clientPromise } = await import('../src/lib/mongodb.js');
    return clientPromise;
};

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        const clientPromise = await getMongoClient();
        const client = await clientPromise;
        const db = client.db('ems-donation');

        // 1. Create Admin User
        console.log('👤 Creating admin user...');
        const usersCollection = db.collection('users');

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('   ⚠️  Admin user already exists, skipping...');
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
            console.log(`   ✅ Admin user created with ID: ${result.insertedId}`);
            console.log('   📝 Credentials: username=admin, password=admin123\n');
        }

        // 2. Create Sample Inventory Items (Optional)
        console.log('📦 Creating sample inventory items...');
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
                console.log(`   ⚠️  ${item.itemName} already exists, skipping...`);
            } else {
                const result = await inventoryCollection.insertOne(item);
                console.log(`   ✅ Created: ${item.itemName} (${item.quantity} ${item.unit})`);
            }
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - Admin user: admin / admin123');
        console.log('   - Sample inventory items created');
        console.log('\n💡 Next steps:');
        console.log('   1. Start dev server: npm run dev');
        console.log('   2. Login with admin credentials');
        console.log('   3. Create shelters and distribution requests\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
