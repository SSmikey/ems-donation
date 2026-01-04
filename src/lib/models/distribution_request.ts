export interface DistributionRequest {
    _id?: string;
    shelterId: string; // Reference to the existing shelter ID
    items: {
        itemName: string;
        quantity: number;
    }[];

    // Status Flow: สร้าง → รออนุมัติ → อนุมัติแล้ว → กำลังจัดส่ง → สำเร็จ
    // สต็อกจองไว้ตั้งแต่ สร้าง ตัดจริงเมื่อ สำเร็จ (ยืนยันรับของ)
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'สำเร็จ' | 'ยกเลิก';
    urgency: 'ต่ำ' | 'กลาง' | 'สูง';

    requestBy: string; // Name of the staff who requested
    approvedBy?: string; // Name of the staff who approved

    // Cancellation fields
    cancelledBy?: string; // Name of the staff who cancelled
    cancellationReason?: string; // Reason for cancellation
    cancelledAt?: Date; // When the request was cancelled

    createdAt: Date;
    updatedAt: Date;
}
