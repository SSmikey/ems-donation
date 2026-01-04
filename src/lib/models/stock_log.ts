export interface StockLog {
    _id?: string;

    // Item information
    itemName: string;
    itemId: string; // Reference to Inventory._id

    // Action type
    action: 'reserve' | 'unreserve' | 'cut' | 'manual-adjustment';

    // Stock change details
    previousQuantity: number;  // ปริมาณก่อน
    newQuantity: number;       // ปริมาณหลัง
    change: number;            // จำนวนที่เปลี่ยน (+ or -)

    // Related transaction
    relatedRequestId?: string; // Reference to DistributionRequest._id
    performedBy: string;       // ชื่อผู้ทำการเปลี่ยน

    // Additional information
    notes?: string; // หมายเหตุเพิ่มเติม
    createdAt: Date;
}
