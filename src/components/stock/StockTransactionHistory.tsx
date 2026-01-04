'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StockTransaction {
  _id: string;
  itemId: string;
  itemName?: string;
  transactionType: 'receive' | 'reserve' | 'release' | 'deduct' | 'adjust';
  quantity: number;
  referenceType: string;
  referenceId?: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}

interface StockTransactionHistoryProps {
  transactions: StockTransaction[];
  isLoading?: boolean;
}

const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  receive: { label: 'รับเข้า', color: 'bg-green-100 text-green-800', icon: '📥' },
  reserve: { label: 'จอง', color: 'bg-blue-100 text-blue-800', icon: '✋' },
  release: { label: 'คืน', color: 'bg-orange-100 text-orange-800', icon: '↩️' },
  deduct: { label: 'หัก', color: 'bg-red-100 text-red-800', icon: '📉' },
  adjust: { label: 'ปรับ', color: 'bg-gray-100 text-gray-800', icon: '🔧' },
};

export function StockTransactionHistory({
  transactions,
  isLoading = false,
}: StockTransactionHistoryProps) {
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchType = !filterType || tx.transactionType === filterType;
    const matchSearch =
      !searchTerm ||
      tx.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const totalQuantity = filteredTransactions.reduce((sum, tx) => sum + tx.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">ประวัติการเคลื่อนไหวสต็อก</h3>
        <p className="text-sm text-muted-foreground">
          รวม {filteredTransactions.length} รายการ ({totalQuantity} หน่วย)
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">ค้นหา</label>
          <Input
            placeholder="ค้นหาตามชื่อสินค้า ผู้ใช้ หรือ ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={!filterType ? 'default' : 'outline'}
            onClick={() => setFilterType('')}
            size="sm"
          >
            ทั้งหมด
          </Button>
          {Object.entries(TRANSACTION_TYPE_CONFIG).map(([type]) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              size="sm"
            >
              {TRANSACTION_TYPE_CONFIG[type].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">ไม่มีประวัติการเคลื่อนไหว</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันเวลา</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>ประเภทการเคลื่อนไหว</TableHead>
              <TableHead className="text-right">จำนวน</TableHead>
              <TableHead>ประเภทอ้างอิง</TableHead>
              <TableHead>ผู้บันทึก</TableHead>
              <TableHead>หมายเหตุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => {
              const config = TRANSACTION_TYPE_CONFIG[tx.transactionType];
              return (
                <TableRow key={tx._id}>
                  <TableCell className="text-sm">
                    {new Date(tx.createdAt).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{tx.itemName || tx.itemId}</p>
                      <p className="text-xs text-muted-foreground">{tx.itemId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={config.color}>
                      {config.icon} {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{tx.quantity}</TableCell>
                  <TableCell className="text-sm">{tx.referenceType}</TableCell>
                  <TableCell className="text-sm">{tx.createdBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.note || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
