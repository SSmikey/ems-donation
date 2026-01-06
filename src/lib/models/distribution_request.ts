export interface DistributionRequest {
    _id?: string;
    shelterId: string; // Reference to the existing shelter ID
    items: {
        inventoryId: string; // MongoDB ObjectId as string - reference to Inventory item
        itemName: string; // Keep for display purposes
        quantity: number;
        unit: string; // Unit of measurement (e.g., 'กก.', 'ชิ้น')
    }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว';
    urgency: 'ต่ำ' | 'กลาง' | 'สูง';
    requestBy: {
        userId: string;
        username: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    approvedBy?: {
        userId: string;
        username: string;
        firstName: string;
        lastName: string;
        role: string;
        approvedAt: string; // ISO 8601 timestamp
    };
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
}
