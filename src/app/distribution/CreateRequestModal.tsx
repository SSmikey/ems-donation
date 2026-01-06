'use client';

import { useState, useEffect } from 'react';

interface Shelter {
  _id: string;
  name: string;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
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
  const [requestItems, setRequestItems] = useState<{ itemId: string; name: string; quantity: number; unit: string }[]>([]);

  // Item Selection State
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

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
          { _id: 'i1', itemName: 'ข้าวสาร (Mock)', quantity: 100, unit: 'kg' },
          { _id: 'i2', itemName: 'น้ำดื่ม (Mock)', quantity: 500, unit: 'pack' }
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

    setRequestItems([
      ...requestItems,
      {
        itemId: item._id,
        name: item.itemName,
        quantity: itemQuantity,
        unit: item.unit // Store unit for the API
      }
    ]);
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

    try {
      const res = await fetch('/api/distribution-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelterId: selectedShelter,
          items: requestItems.map(i => ({
            inventoryId: i.itemId,
            itemName: i.name,
            quantity: i.quantity,
            unit: i.unit
          })),
          urgency,
          status: 'รอดำเนินการ',
          requestBy: {
            userId: 'staff-001', // Ideally should come from auth context
            username: 'staff_user',
            firstName: 'เจ้าหน้าที่',
            lastName: 'หน้างาน',
            role: 'STAF'
          }
        })
      });

      if (res.ok) {
        alert('สร้างคำขอสำเร็จ');
        onSuccess();
      } else {
        const errorData = await res.json();
        alert('เกิดข้อผิดพลาดในการสร้างคำขอ: ' + (errorData.details?.join(', ') || errorData.error));
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
      <style>{`
        .modal-form-select option {
          background-color: #1a1a2e;
          color: #ffffff;
          padding: 8px;
        }
        .modal-form-select option:hover {
          background: linear-gradient(rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.2));
          background-color: #16213e;
        }
        .modal-form-select option:checked {
          background: linear-gradient(rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.3));
          background-color: #16213e;
        }
        .modal-form-input {
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }
        .modal-form-input:focus {
          border-color: #00d4ff !important;
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
      `}</style>
      <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '600px', backgroundColor: '#1a1a2e', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
        <div className="card-body p-4">
          <h2 className="card-title mb-4 fw-bold" style={{ fontSize: '1.3rem', color: '#ffffff' }}>สร้างคำขอเบิกของใหม่</h2>

          <div className="mb-3">
            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ศูนย์พักพิง:</label>
            <select className="form-select modal-form-input" value={selectedShelter} onChange={e => setSelectedShelter(e.target.value)}>
              <option value="">-- เลือกศูนย์พักพิง --</option>
              {shelters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ความเร่งด่วน:</label>
            <select className="form-select modal-form-input" value={urgency} onChange={e => setUrgency(e.target.value)}>
              <option value="ต่ำ">ต่ำ</option>
              <option value="กลาง">กลาง</option>
              <option value="สูง">สูง</option>
            </select>
          </div>

          <div className="border rounded p-3 mb-3" style={{ borderColor: 'rgba(0, 212, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <h3 className="fw-600 mb-3" style={{ fontSize: '1rem', color: '#ffffff' }}>เพิ่มรายการสินค้า</h3>
            <div className="d-flex gap-2 mb-3">
              <select className="form-select modal-form-input flex-grow-1" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                <option value="">-- เลือกสินค้า --</option>
                {inventory.map(i => (
                  <option key={i._id} value={i._id}>{i.itemName} (คงเหลือ: {i.quantity} {i.unit})</option>
                ))}
              </select>
              <input
                type="number"
                className="form-control modal-form-input"
                style={{ maxWidth: '100px' }}
                value={itemQuantity}
                onChange={e => setItemQuantity(Number(e.target.value))}
                min="1"
              />
              <button
                onClick={handleAddItem}
                className="btn fw-600 text-nowrap"
                style={{ backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none' }}
              >
                เพิ่ม
              </button>
            </div>

            {/* Selected Items List */}
            <ul className="list-unstyled">
              {requestItems.map((item, idx) => (
                <li key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderBottomColor: 'rgba(0, 212, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <span>{item.name} x {item.quantity}</span>
                  <button onClick={() => handleRemoveItem(idx)} className="btn btn-sm" style={{ color: '#ff6b6b', border: 'none', background: 'none', padding: 0 }}>ลบ</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="btn btn-outline-light"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className="btn fw-600 text-nowrap"
              style={{ backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none' }}
            >
              ยืนยันการสร้าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}