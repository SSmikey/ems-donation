export interface DistributionRequest {
    _id?: string;
    requestNo: string;                     // 🆕 NEW: R2501030001 format
    shelterId: string;                     // Reference to the existing shelter ID
    items: {
        itemId: string;                    // 🆕 เปลี่ยนจาก itemName
        itemName: string;
        quantity: number;
        reservedAt: Date;                  // 🆕 NEW
        releasedAt?: Date;                 // 🆕 NEW
        deductedAt?: Date;                 // 🆕 NEW
    }[];
    status: 'pending' | 'approved' | 'shipping' | 'completed' | 'cancelled';
    urgency: 'low' | 'medium' | 'high';
    requestBy: string;                     // Name/ID of the staff who requested
    approvedBy?: string;                   // Name/ID of the staff who approved
    approvedAt?: Date;                     // 🆕 NEW
    shippedBy?: string;                    // 🆕 NEW
    shippedAt?: Date;                      // 🆕 NEW
    completedBy?: string;                  // 🆕 NEW
    completedAt?: Date;                    // 🆕 NEW
    cancelledBy?: string;                  // 🆕 NEW
    cancelledAt?: Date;                    // 🆕 NEW
    cancelReason?: string;                 // 🆕 NEW
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}
