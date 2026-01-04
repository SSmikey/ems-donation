'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Shelter {
  _id: string;
  name: string;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
}

interface CreateRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialShelterId?: string;
}

export default function CreateRequestModal({ onClose, onSuccess, initialShelterId }: CreateRequestModalProps) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Form State
  const [selectedShelter, setSelectedShelter] = useState(initialShelterId || '');
  const [urgency, setUrgency] = useState('กลาง');
  const [requestItems, setRequestItems] = useState<{ itemId: string; name: string; quantity: number }[]>([]);

  // Item Selection State
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialShelterId) {
      setSelectedShelter(initialShelterId);
    }
  }, [initialShelterId]);

  useEffect(() => {
    // Fetch Shelters
    fetch('/api/shelters')
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) return res.json();
        throw new Error('Not JSON');
      })
      .then(data => {
        if (data.success || data.data) setShelters(data.data || data);
      })
      .catch(err => {
        console.warn('Using mock shelters:', err);
        setShelters([
          { _id: 's1', name: 'ศูนย์พักพิงวัดป่า (Mock)' },
          { _id: 's2', name: 'โรงเรียนบ้านดอน (Mock)' }
        ]);
      });

    // Fetch Inventory
    fetch('/api/inventory')
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) return res.json();
        throw new Error('Not JSON');
      })
      .then(data => {
        if (data.success) setInventory(data.data);
      })
      .catch(err => {
        console.warn('Using mock inventory:', err);
        setInventory([
          { _id: 'i1', itemName: 'ข้าวสาร (Mock)', quantity: 100, unit: 'kg', category: 'อาหาร' },
          { _id: 'i2', itemName: 'น้ำดื่ม (Mock)', quantity: 500, unit: 'pack', category: 'น้ำดื่ม' }
        ]);
      });
  }, []);

  const handleAddItem = () => {
    if (!selectedItem || itemQuantity <= 0) return;

    const item = inventory.find(i => i._id === selectedItem);
    if (!item) return;

    if (itemQuantity > item.quantity) {
      alert(`สินค้าในคลังมีเพียง ${item.quantity} ${item.unit}`);
      return;
    }

    // Check if item already added
    const existingItem = requestItems.find(i => i.itemId === selectedItem);
    if (existingItem) {
      alert('สินค้านี้มีอยู่ในรายการแล้ว กรุณาลบและเพิ่มใหม่หากต้องการเปลี่ยนจำนวน');
      return;
    }

    setRequestItems([...requestItems, { itemId: item._id, name: item.itemName, quantity: itemQuantity }]);
    setSelectedItem('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...requestItems];
    newItems.splice(index, 1);
    setRequestItems(newItems);
  };

  const handleSubmit = async () => {
    if (!selectedShelter || requestItems.length === 0) {
      alert('กรุณาเลือกศูนย์พักพิงและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/distribution-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelterId: selectedShelter,
          items: requestItems.map(i => ({ itemName: i.name, quantity: i.quantity })),
          urgency,
          status: 'รอดำเนินการ',
          requestBy: 'เจ้าหน้าที่ศูนย์'
        })
      });

      if (res.ok) {
        alert('สร้างคำขอสำเร็จ');
        onSuccess();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'เกิดข้อผิดพลาดในการสร้างคำขอ');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const selectedShelterName = shelters.find(s => s._id === selectedShelter)?.name || '';
  const availableItem = inventory.find(i => i._id === selectedItem);

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Modal Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6">
          <h2 className="text-2xl font-bold text-foreground">สร้างคำขอเบิกของใหม่</h2>
          <p className="text-sm text-muted-foreground mt-1">เลือกศูนย์พักพิงและรายการสินค้าที่ต้องการขอเบิก</p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Shelter Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">ศูนย์พักพิง *</label>
            <select
              value={selectedShelter}
              onChange={e => setSelectedShelter(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
            >
              <option value="">-- เลือกศูนย์พักพิง --</option>
              {shelters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          {/* Urgency Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">ความเร่งด่วน *</label>
            <div className="flex gap-3">
              {['ต่ำ', 'กลาง', 'สูง'].map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={urgency === level}
                    onChange={e => setUrgency(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Items Section */}
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-4 text-foreground">เพิ่มรายการสินค้า *</h3>

            {/* Add Item Controls */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">เลือกสินค้า</label>
                <select
                  value={selectedItem}
                  onChange={e => setSelectedItem(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">-- เลือกสินค้า --</option>
                  {inventory.map(i => (
                    <option key={i._id} value={i._id}>
                      {i.itemName} (คงเหลือ: {i.quantity} {i.unit})
                    </option>
                  ))}
                </select>
                {availableItem && (
                  <p className="text-xs text-muted-foreground mt-1">หมวดหมู่: {availableItem.category}</p>
                )}
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-foreground">จำนวน</label>
                  <Input
                    type="number"
                    value={itemQuantity}
                    onChange={e => setItemQuantity(Number(e.target.value))}
                    min="1"
                    max={availableItem?.quantity || 999}
                  />
                </div>
                <Button
                  onClick={handleAddItem}
                  disabled={!selectedItem || itemQuantity <= 0}
                  className="whitespace-nowrap"
                >
                  เพิ่ม
                </Button>
              </div>
            </div>

            {/* Selected Items List */}
            {requestItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium mb-3 text-foreground">รายการสินค้าที่เลือก</h4>
                <div className="space-y-2">
                  {requestItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-background rounded border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">จำนวน: {item.quantity} หน่วย</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-destructive"
                      >
                        ลบ
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-foreground">
                    รวม: <span className="font-semibold">{requestItems.length}</span> รายการ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedShelterName && requestItems.length > 0 && (
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
              <p className="text-sm text-foreground">
                <span className="font-semibold">ศูนย์พักพิง:</span> {selectedShelterName}
              </p>
              <p className="text-sm text-foreground mt-2">
                <span className="font-semibold">ความเร่งด่วน:</span>
                <Badge className="ml-2" variant="outline">{urgency}</Badge>
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedShelter || requestItems.length === 0}
          >
            {loading ? 'กำลังสร้าง...' : 'ยืนยันการสร้าง'}
          </Button>
        </div>
      </div>
    </div>
  );
}