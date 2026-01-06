export interface InventoryLog {
    _id?: string;
    inventoryId: string; // Reference to Inventory item
    requestId?: string; // Reference to DistributionRequest (if applicable)
    type: 'RESERVE' | 'UNRESERVE' | 'DEDUCT' | 'RESTORE' | 'MANUAL';
    changeQuantity: number; // Positive or negative
    previousQuantity: number;
    newQuantity: number;
    previousReservedQuantity: number;
    newReservedQuantity: number;
    performedBy: {
        userId: string;
        username: string;
    };
    timestamp: string; // ISO 8601 format
    note?: string;
}
