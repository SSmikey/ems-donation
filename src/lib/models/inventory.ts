export interface InventoryItem {
    _id?: string;
    itemName: string;
    category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
    quantity: number;           // Total stock
    reserved: number;           // Reserved from pending requests (จองแล้ว)
    unit: string;
    lastUpdated: Date;
}

// Computed property (not stored):
// Available = quantity - reserved (พร้อมใช้งาน)
