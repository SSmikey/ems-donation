/**
 * Stock Management Service
 * จัดการ reserve, release, และ deduct stock สำหรับระบบจัดการทรัพยากร
 */

import { Db } from 'mongodb';
import { InventoryItem } from '@/lib/models/inventory';
import { StockTransaction } from '@/lib/models/stock_transaction';
import { RequestTimeline } from '@/lib/models/request_timeline';

export class StockService {
  constructor(private db: Db) {}

  /**
   * Reserve Stock - จองสต็อกเมื่อสร้างคำขอ
   */
  async reserveStock(
    itemId: string,
    quantity: number,
    referenceId: string,
    createdBy: string
  ): Promise<boolean> {
    const inventoryCollection = this.db.collection('inventory');
    const transactionCollection = this.db.collection('stock_transactions');
    const timelineCollection = this.db.collection('request_timelines');

    try {
      // Check available quantity
      const item = (await inventoryCollection.findOne({
        _id: itemId,
      })) as InventoryItem | null;

      if (!item) {
        throw new Error(`Item ${itemId} not found`);
      }

      const availableQuantity = item.quantity - item.reservedQuantity;
      if (availableQuantity < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}`
        );
      }

      // Update inventory - increase reservedQuantity
      await inventoryCollection.updateOne(
        { _id: itemId },
        {
          $inc: { reservedQuantity: quantity },
          $set: { lastUpdated: new Date(), lastUpdatedBy: createdBy },
        }
      );

      // Create transaction record
      const transaction: StockTransaction = {
        itemId,
        transactionType: 'reserve',
        quantity,
        referenceType: 'request',
        referenceId,
        createdBy,
        createdAt: new Date(),
      };

      await transactionCollection.insertOne(transaction);

      // Create timeline record
      const timeline: RequestTimeline = {
        requestId: referenceId,
        status: 'reserved',
        note: `Reserved ${quantity} units of item ${itemId}`,
        createdBy,
        createdAt: new Date(),
      };

      await timelineCollection.insertOne(timeline);

      return true;
    } catch (error) {
      console.error('Error reserving stock:', error);
      throw error;
    }
  }

  /**
   * Release Stock - คืนสต็อกเมื่อยกเลิกคำขอ
   */
  async releaseStock(
    itemId: string,
    quantity: number,
    referenceId: string,
    createdBy: string
  ): Promise<boolean> {
    const inventoryCollection = this.db.collection('inventory');
    const transactionCollection = this.db.collection('stock_transactions');
    const timelineCollection = this.db.collection('request_timelines');

    try {
      // Check reserved quantity
      const item = (await inventoryCollection.findOne({
        _id: itemId,
      })) as InventoryItem | null;

      if (!item) {
        throw new Error(`Item ${itemId} not found`);
      }

      if (item.reservedQuantity < quantity) {
        throw new Error(
          `Cannot release ${quantity} units. Reserved: ${item.reservedQuantity}`
        );
      }

      // Update inventory - decrease reservedQuantity
      await inventoryCollection.updateOne(
        { _id: itemId },
        {
          $inc: { reservedQuantity: -quantity },
          $set: { lastUpdated: new Date(), lastUpdatedBy: createdBy },
        }
      );

      // Create transaction record
      const transaction: StockTransaction = {
        itemId,
        transactionType: 'release',
        quantity,
        referenceType: 'request',
        referenceId,
        createdBy,
        createdAt: new Date(),
      };

      await transactionCollection.insertOne(transaction);

      // Create timeline record
      const timeline: RequestTimeline = {
        requestId: referenceId,
        status: 'released',
        note: `Released ${quantity} units of item ${itemId}`,
        createdBy,
        createdAt: new Date(),
      };

      await timelineCollection.insertOne(timeline);

      return true;
    } catch (error) {
      console.error('Error releasing stock:', error);
      throw error;
    }
  }

  /**
   * Deduct Stock - หักสต็อกเมื่อส่งมอบคำขอ
   */
  async deductStock(
    itemId: string,
    quantity: number,
    centerId: string,
    referenceId: string,
    createdBy: string
  ): Promise<boolean> {
    const inventoryCollection = this.db.collection('inventory');
    const centerItemCollection = this.db.collection('center_items');
    const transactionCollection = this.db.collection('stock_transactions');
    const timelineCollection = this.db.collection('request_timelines');

    try {
      // Check total quantity
      const item = (await inventoryCollection.findOne({
        _id: itemId,
      })) as InventoryItem | null;

      if (!item) {
        throw new Error(`Item ${itemId} not found`);
      }

      if (item.quantity < quantity) {
        throw new Error(
          `Insufficient total stock. Available: ${item.quantity}, Requested: ${quantity}`
        );
      }

      // Update inventory - decrease total quantity and reservedQuantity
      await inventoryCollection.updateOne(
        { _id: itemId },
        {
          $inc: { quantity: -quantity, reservedQuantity: -quantity },
          $set: { lastUpdated: new Date(), lastUpdatedBy: createdBy },
        }
      );

      // Update or create center item record
      const existingCenterItem = await centerItemCollection.findOne({
        centerId,
        itemId,
      });

      if (existingCenterItem) {
        await centerItemCollection.updateOne(
          { centerId, itemId },
          {
            $inc: { currentQuantity: quantity },
            $set: { updatedAt: new Date(), lastUpdatedBy: createdBy },
          }
        );
      } else {
        await centerItemCollection.insertOne({
          centerId,
          itemId,
          currentQuantity: quantity,
          requiredQuantity: 0,
          status: 'normal',
          lastUpdatedBy: createdBy,
          updatedAt: new Date(),
        });
      }

      // Create transaction record
      const transaction: StockTransaction = {
        itemId,
        transactionType: 'deduct',
        quantity,
        referenceType: 'request',
        referenceId,
        createdBy,
        createdAt: new Date(),
      };

      await transactionCollection.insertOne(transaction);

      // Create timeline record
      const timeline: RequestTimeline = {
        requestId: referenceId,
        status: 'deducted',
        note: `Deducted ${quantity} units of item ${itemId} to center ${centerId}`,
        createdBy,
        createdAt: new Date(),
      };

      await timelineCollection.insertOne(timeline);

      return true;
    } catch (error) {
      console.error('Error deducting stock:', error);
      throw error;
    }
  }

  /**
   * Get Stock Transactions
   */
  async getTransactions(
    filters?: {
      itemId?: string;
      transactionType?: string;
      referenceId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const transactionCollection = this.db.collection('stock_transactions');
    const query: any = {};

    if (filters?.itemId) query.itemId = filters.itemId;
    if (filters?.transactionType) query.transactionType = filters.transactionType;
    if (filters?.referenceId) query.referenceId = filters.referenceId;

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    return await transactionCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Get Request Timeline
   */
  async getRequestTimeline(requestId: string) {
    const timelineCollection = this.db.collection('request_timelines');

    return await timelineCollection
      .find({ requestId })
      .sort({ createdAt: 1 })
      .toArray();
  }
}
