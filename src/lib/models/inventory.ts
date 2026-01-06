export interface InventoryItem {
    _id?: string;
    itemName: string;
    category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
    quantity: number;
    reservedQuantity: number; // Added to track items requested but not yet approved/shipped
    unit: string;
    lastUpdated: string; // ISO 8601 format
}
