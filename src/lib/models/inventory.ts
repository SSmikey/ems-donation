export interface InventoryItem {
    _id?: string;
    itemName: string;
    category: 'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ';
    quantity: number;
    unit: string;
    lastUpdated: Date;
}
