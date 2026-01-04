'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RequestItem {
  itemId: string;
  itemName: string;
  quantity: number;
  reservedAt?: Date;
  releasedAt?: Date;
  deductedAt?: Date;
}

interface RequestDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestNo: string;
  shelterId: string;
  shelterName?: string;
  items: RequestItem[];
  status: string;
  urgency: string;
  requestBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  onApprove?: () => void;
  onShip?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export function RequestDetailModal({
  open,
  onOpenChange,
  requestNo,
  shelterId,
  shelterName,
  items,
  status,
  urgency,
  requestBy,
  approvedBy,
  approvedAt,
  shippedAt,
  completedAt,
  createdAt,
  onApprove,
  onShip,
  onComplete,
  onCancel,
}: RequestDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายละเอียดคำขอเบิก {requestNo}</DialogTitle>
          <DialogDescription>
            ศูนย์พักพิง: {shelterName || shelterId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Urgency */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium">สถานะ</p>
              <Badge className={STATUS_COLORS[status] || 'bg-gray-100'}>
                {status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">ความเร่งด่วน</p>
              <Badge className={URGENCY_COLORS[urgency] || 'bg-gray-100'}>
                {urgency}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">วันที่สร้าง</p>
              <p className="text-sm">{new Date(createdAt).toLocaleDateString('th-TH')}</p>
            </div>
          </div>

          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ผู้ขอ</p>
              <p className="text-sm">{requestBy}</p>
            </div>
            {approvedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">อนุมัติโดย</p>
                <p className="text-sm">{approvedBy}</p>
              </div>
            )}
            {approvedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่อนุมัติ</p>
                <p className="text-sm">{new Date(approvedAt).toLocaleDateString('th-TH')}</p>
              </div>
            )}
            {shippedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่จัดส่ง</p>
                <p className="text-sm">{new Date(shippedAt).toLocaleDateString('th-TH')}</p>
              </div>
            )}
            {completedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่ส่งมอบ</p>
                <p className="text-sm">{new Date(completedAt).toLocaleDateString('th-TH')}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div>
            <p className="text-sm font-medium mb-3">รายการของ</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex gap-2 justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <div className="flex gap-2">
            {status === 'pending' && (
              <>
                <Button variant="outline" onClick={onCancel}>
                  ยกเลิก
                </Button>
                <Button onClick={onApprove}>อนุมัติ</Button>
              </>
            )}
            {status === 'approved' && (
              <Button onClick={onShip}>จัดส่ง</Button>
            )}
            {status === 'shipping' && (
              <Button onClick={onComplete}>ส่งมอบแล้ว</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
