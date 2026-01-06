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
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalContentStyle: CSSProperties = {
    backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '600px',
    color: '#ffffff', border: '1px solid rgba(0, 212, 255, 0.2)'
  };

  const inputStyle: CSSProperties = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontSize: '0.95rem'
  };

  const labelStyle: CSSProperties = {
    display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)'
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <style>{`
          select option {
            background-color: #1a1a2e;
            color: #ffffff;
            padding: 8px;
          }
          select option:hover {
            background: linear-gradient(rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.2));
            background-color: #16213e;
          }
          select option:checked {
            background: linear-gradient(rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.3));
            background-color: #16213e;
          }
        `}</style>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', fontWeight: 'bold', color: '#ffffff' }}>สร้างคำขอเบิกของใหม่</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>ศูนย์พักพิง:</label>
          <select style={selectStyle} value={selectedShelter} onChange={e => setSelectedShelter(e.target.value)}>
            <option value="">-- เลือกศูนย์พักพิง --</option>
            {shelters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>ความเร่งด่วน:</label>
          <select style={selectStyle} value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option value="ต่ำ">ต่ำ</option>
            <option value="กลาง">กลาง</option>
            <option value="สูง">สูง</option>
          </select>
        </div>

        <div style={{ border: '1px solid rgba(0, 212, 255, 0.2)', padding: '16px', borderRadius: '8px', marginBottom: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '12px', color: '#ffffff', fontSize: '1rem' }}>เพิ่มรายการสินค้า</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <select style={{ ...selectStyle, flex: 2, marginBottom: 0 }} value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
              <option value="">-- เลือกสินค้า --</option>
              {inventory.map(i => (
                <option key={i._id} value={i._id}>{i.itemName} (คงเหลือ: {i.quantity} {i.unit})</option>
              ))}
            </select>
            <input
              type="number"
              style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
              value={itemQuantity}
              onChange={e => setItemQuantity(Number(e.target.value))}
              min="1"
            />
            <button
              onClick={handleAddItem}
              style={{ backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            >
              เพิ่ม
            </button>
          </div>

          {/* Selected Items List */}
          <ul style={{ marginTop: '12px', listStyle: 'none', padding: 0 }}>
            {requestItems.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0, 212, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)' }}>
                <span>{item.name} x {item.quantity}</span>
                <button onClick={() => handleRemoveItem(idx)} style={{ color: '#ff6b6b', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}>ลบ</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 24px', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '8px', background: 'transparent', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            style={{ padding: '10px 24px', backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            ยืนยันการสร้าง
          </button>
        </div>
      </div>
    </div>
  );
}