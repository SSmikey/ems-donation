export interface InventoryItem {
    _id?: string;
    itemName: string;
    category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
    quantity: number;                      // total_quantity
    reservedQuantity: number;              // 🆕 NEW - สต็อกที่จองไว้
    availableQuantity: number;             // 🆕 computed: quantity - reservedQuantity
    unit: string;
    minThreshold: number;                  // 🆕 NEW - จำนวนต่ำสุด
    lastUpdated: Date;
    lastUpdatedBy: string;                 // 🆕 NEW - ผู้อัปเดต
}
