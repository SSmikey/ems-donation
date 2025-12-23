'use client';

import { useState, useEffect, CSSProperties } from 'react';

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
}

export default function CreateRequestModal({ onClose, onSuccess }: CreateRequestModalProps) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Form State
  const [selectedShelter, setSelectedShelter] = useState('');
  const [urgency, setUrgency] = useState('กลาง');
  const [requestItems, setRequestItems] = useState<{ itemId: string; name: string; quantity: number }[]>([]);

  // Item Selection State
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

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

    try {
      const res = await fetch('/api/distribution-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelterId: selectedShelter,
          items: requestItems.map(i => ({ itemName: i.name, quantity: i.quantity })), // Adjust based on API requirement
          urgency,
          status: 'รอดำเนินการ',
          requestBy: 'เจ้าหน้าที่ศูนย์'
        })
      });

      if (res.ok) {
        alert('สร้างคำขอสำเร็จ');
        onSuccess();
      } else {
        alert('เกิดข้อผิดพลาดในการสร้างคำขอ');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // Inline styles for modal
  const modalOverlayStyle: CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalContentStyle: CSSProperties = {
    backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', color: '#333'
  };

  const inputStyle: CSSProperties = {
    width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px'
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', fontWeight: 'bold' }}>สร้างคำขอเบิกของใหม่</h2>

        <div style={{ marginBottom: '15px' }}>
          <label>ศูนย์พักพิง:</label>
          <select style={inputStyle} value={selectedShelter} onChange={e => setSelectedShelter(e.target.value)}>
            <option value="">-- เลือกศูนย์พักพิง --</option>
            {shelters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>ความเร่งด่วน:</label>
          <select style={inputStyle} value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option value="ต่ำ">ต่ำ</option>
            <option value="กลาง">กลาง</option>
            <option value="สูง">สูง</option>
          </select>
        </div>

        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>เพิ่มรายการสินค้า</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select style={{ ...inputStyle, flex: 2 }} value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
              <option value="">-- เลือกสินค้า --</option>
              {inventory.map(i => (
                <option key={i._id} value={i._id}>{i.itemName} (คงเหลือ: {i.quantity} {i.unit})</option>
              ))}
            </select>
            <input
              type="number"
              style={{ ...inputStyle, flex: 1 }}
              value={itemQuantity}
              onChange={e => setItemQuantity(Number(e.target.value))}
              min="1"
            />
            <button
              onClick={handleAddItem}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '0 15px', height: '42px', cursor: 'pointer' }}
            >
              เพิ่ม
            </button>
          </div>

          {/* Selected Items List */}
          <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
            {requestItems.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <span>{item.name} x {item.quantity}</span>
                <button onClick={() => handleRemoveItem(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>ลบ</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ยืนยันการสร้าง
          </button>
        </div>
      </div>
    </div>
  );
}