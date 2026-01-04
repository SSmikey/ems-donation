export interface CenterItem {
  _id?: string;
  centerId: string;
  itemId: string;
  currentQuantity: number;
  requiredQuantity: number;
  status: 'normal' | 'warning' | 'critical' | 'excess';
  lastUpdatedBy: string;
  updatedAt: Date;
}
