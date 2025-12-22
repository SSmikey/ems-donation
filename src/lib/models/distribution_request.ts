export interface DistributionRequest {
    _id?: string;
    shelterId: string; // Reference to the existing shelter ID
    items: {
        itemName: string;
        quantity: number;
    }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'ส่งมอบแล้ว';
    urgency: 'ต่ำ' | 'กลาง' | 'สูง';
    requestBy: string; // Name of the staff who requested
    approvedBy?: string; // Name of the staff who approved
    createdAt: Date;
    updatedAt: Date;
}
