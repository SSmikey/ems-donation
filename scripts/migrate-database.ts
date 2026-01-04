/// <reference types="node" />

/**
 * Database Migration Script
 * สำหรับอัปเดต collections เดิมและสร้าง collections ใหม่
 *
 * Usage: npx ts-node scripts/migrate-database.ts
 */

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssk-ems-donation';

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    console.log('🔄 Starting database migration...\n');

    // Step 1: Update Inventory collection
    await migrateInventory(db);

    // Step 2: Update DistributionRequest collection
    await migrateDistributionRequest(db);

    // Step 3: Create StockTransaction collection
    await createStockTransactionCollection(db);

    // Step 4: Create RequestTimeline collection
    await createRequestTimelineCollection(db);

    // Step 5: Create CenterItem collection
    await createCenterItemCollection(db);

    console.log('\n✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function migrateInventory(db: Db) {
  console.log('📦 Migrating Inventory collection...');
  const inventoryCollection = db.collection('inventory');

  // Check if collection exists
  const inventoryExists = await db.listCollections({ name: 'inventory' }).hasNext();

  if (inventoryExists) {
    // Add new fields to existing documents
    const result = await inventoryCollection.updateMany(
      {},
      {
        $set: {
          reservedQuantity: 0,
          minThreshold: 10,
          lastUpdatedBy: 'system',
        },
        $currentDate: { lastUpdated: true },
      },
      { upsert: false }
    );

    console.log(`   ✓ Updated ${result.modifiedCount} inventory items`);
  } else {
    console.log('   ℹ Inventory collection does not exist yet (will be created on first insert)');
  }
}

async function migrateDistributionRequest(db: Db) {
  console.log('📋 Migrating DistributionRequest collection...');
  const requestCollection = db.collection('distribution_requests');

  // Check if collection exists
  const requestExists = await db.listCollections({ name: 'distribution_requests' }).hasNext();

  if (requestExists) {
    // Convert existing documents to new schema
    const documents = await requestCollection.find({}).toArray();

    for (const doc of documents) {
      // Generate requestNo if not exists
      let requestNo = doc.requestNo;
      if (!requestNo) {
        const createdAt = doc.createdAt || new Date();
        const year = createdAt.getFullYear().toString().slice(2);
        const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
        const day = createdAt.getDate().toString().padStart(2, '0');
        const seq = '0001'; // Default sequence
        requestNo = `R${year}${month}${day}${seq}`;
      }

      // Transform items with itemId
      const updatedItems = doc.items?.map((item: any) => ({
        itemId: item.itemId || '',
        itemName: item.itemName,
        quantity: item.quantity,
        reservedAt: doc.createdAt || new Date(),
        releasedAt: doc.status === 'cancelled' ? new Date() : undefined,
        deductedAt: doc.status === 'completed' || doc.status === 'ส่งมอบแล้ว' ? new Date() : undefined,
      })) || [];

      // Map old status values to new ones
      const statusMap: Record<string, string> = {
        'รอดำเนินการ': 'pending',
        'อนุมัติแล้ว': 'approved',
        'กำลังจัดส่ง': 'shipping',
        'ส่งมอบแล้ว': 'completed',
      };

      const urgencyMap: Record<string, string> = {
        'ต่ำ': 'low',
        'กลาง': 'medium',
        'สูง': 'high',
      };

      await requestCollection.updateOne(
        { _id: doc._id },
        {
          $set: {
            requestNo,
            items: updatedItems,
            status: statusMap[doc.status] || 'pending',
            urgency: urgencyMap[doc.urgency] || 'medium',
            approvedAt: doc.status === 'approved' || doc.status === 'อนุมัติแล้ว' ? doc.updatedAt : undefined,
            shippedAt: doc.status === 'shipping' || doc.status === 'กำลังจัดส่ง' ? doc.updatedAt : undefined,
            completedAt: doc.status === 'completed' || doc.status === 'ส่งมอบแล้ว' ? doc.updatedAt : undefined,
          },
        }
      );
    }

    console.log(`   ✓ Updated ${documents.length} distribution requests`);
  } else {
    console.log('   ℹ DistributionRequest collection does not exist yet');
  }
}

async function createStockTransactionCollection(db: Db) {
  console.log('💱 Creating StockTransaction collection...');
  const collectionName = 'stock_transactions';

  const exists = await db.listCollections({ name: collectionName }).hasNext();

  if (!exists) {
    await db.createCollection(collectionName);

    // Create indexes
    const collection = db.collection(collectionName);
    await collection.createIndex({ itemId: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ referenceId: 1 });
    await collection.createIndex({ transactionType: 1 });

    console.log(`   ✓ Created ${collectionName} collection with indexes`);
  } else {
    console.log(`   ℹ ${collectionName} collection already exists`);
  }
}

async function createRequestTimelineCollection(db: Db) {
  console.log('⏱️ Creating RequestTimeline collection...');
  const collectionName = 'request_timelines';

  const exists = await db.listCollections({ name: collectionName }).hasNext();

  if (!exists) {
    await db.createCollection(collectionName);

    // Create indexes
    const collection = db.collection(collectionName);
    await collection.createIndex({ requestId: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ status: 1 });

    console.log(`   ✓ Created ${collectionName} collection with indexes`);
  } else {
    console.log(`   ℹ ${collectionName} collection already exists`);
  }
}

async function createCenterItemCollection(db: Db) {
  console.log('🏢 Creating CenterItem collection...');
  const collectionName = 'center_items';

  const exists = await db.listCollections({ name: collectionName }).hasNext();

  if (!exists) {
    await db.createCollection(collectionName);

    // Create indexes
    const collection = db.collection(collectionName);
    await collection.createIndex({ centerId: 1, itemId: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ updatedAt: -1 });

    console.log(`   ✓ Created ${collectionName} collection with indexes`);
  } else {
    console.log(`   ℹ ${collectionName} collection already exists`);
  }
}

// Run migration
migrate();
