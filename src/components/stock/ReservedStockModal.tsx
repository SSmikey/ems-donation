'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ReservedStock {
  requestId: string;
  requestNo: string;
  itemId: string;
  itemName: string;
  reservedQuantity: number;
  shelterName: string;
  status: string;
  createdAt: Date;
}

interface ReservedStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stocks: ReservedStock[];
  onViewRequest?: (requestId: string) => void;
}

export function ReservedStockModal({
  open,
  onOpenChange,
  stocks,
  onViewRequest,
}: ReservedStockModalProps) {
  const totalReserved = stocks.reduce((sum, stock) => sum + stock.reservedQuantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สต็อกที่จองไว้</DialogTitle>
          <DialogDescription>
            รวมทั้งสิ้น {stocks.length} รายการจอง ({totalReserved} หน่วย)
          </DialogDescription>
        </DialogHeader>

        {stocks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">ไม่มีสต็อกที่จองไว้</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>หมายเลขคำขอ</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead>ศูนย์พักพิง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่จอง</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={`${stock.requestId}-${stock.itemId}`}>
                    <TableCell className="font-medium">{stock.requestNo}</TableCell>
                    <TableCell>{stock.itemName}</TableCell>
                    <TableCell className="text-right">{stock.reservedQuantity}</TableCell>
                    <TableCell>{stock.shelterName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stock.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(stock.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewRequest?.(stock.requestId)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Summary */}
            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">จำนวนรายการจอง</p>
                  <p className="text-2xl font-bold">{stocks.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">รวมจำนวนหน่วย</p>
                  <p className="text-2xl font-bold">{totalReserved}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">สถานะที่พบบ่อยที่สุด</p>
                  <p className="text-lg font-semibold">
                    {stocks.length > 0
                      ? stocks[0].status
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
