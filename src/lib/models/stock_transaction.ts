export interface StockTransaction {
  _id?: string;
  itemId: string;
  transactionType: 'receive' | 'reserve' | 'release' | 'deduct' | 'adjust';
  quantity: number;
  referenceType: 'donation' | 'request' | 'adjustment';
  referenceId?: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}
