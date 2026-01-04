'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CancelRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestNo: string;
  items: Array<{ itemName: string; quantity: number }>;
  onCancel: (reason: string, note?: string) => Promise<void>;
}

const CANCEL_REASONS = [
  { value: 'no_stock', label: 'ไม่มีสต็อกเพียงพอ' },
  { value: 'duplicate', label: 'ซ้ำกับคำขออื่น' },
  { value: 'changed_mind', label: 'เปลี่ยนใจ' },
  { value: 'urgent_needed', label: 'ต้องการด่วน' },
  { value: 'other', label: 'อื่นๆ' },
];

export function CancelRequestModal({
  open,
  onOpenChange,
  requestId,
  requestNo,
  items,
  onCancel,
}: CancelRequestModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    const reason = selectedReason === 'other' ? customReason : selectedReason;
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onCancel(reason, note || undefined);
      setSelectedReason('');
      setCustomReason('');
      setNote('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = selectedReason && (selectedReason !== 'other' || customReason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ยกเลิกคำขอเบิก</DialogTitle>
          <DialogDescription>
            ยกเลิกคำขอ {requestNo} - สต็อกจะถูกคืนกลับโดยอัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items Summary */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-2">รายการที่จะคืน:</p>
            <ul className="text-sm space-y-1">
              {items.map((item, idx) => (
                <li key={idx} className="text-muted-foreground">
                  {item.itemName} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>

          {/* Cancel Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผลในการยกเลิก *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="เลือกเหตุผล" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom">ระบุเหตุผล *</Label>
              <Input
                id="custom"
                placeholder="ระบุเหตุผลอื่นๆ"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}

          {/* Additional Note */}
          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุเพิ่มเติม</Label>
            <Input
              id="note"
              placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            ปิด
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
