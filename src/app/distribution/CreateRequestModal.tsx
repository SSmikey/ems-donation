'use client';

import { useState, useEffect } from 'react';
import FormSelect from '@/components/FormSelect';

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
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedShelter, setSelectedShelter] = useState(initialShelterId || '');
  const [urgency, setUrgency] = useState('กลาง');
  const [requestItems, setRequestItems] = useState<{ itemId: string; name: string; quantity: number; unit: string; maxQuantity: number }[]>([]);

  // Category Selection
  const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');

  useEffect(() => {
    if (initialShelterId) {
      setSelectedShelter(initialShelterId);
    }
  }, [initialShelterId]);

  useEffect(() => {
    setLoading(true);
    // Fetch Shelters
    const fetchShelters = fetch('/api/shelters')
      .then(res => res.json())
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
    const fetchInventory = fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if (data.success) setInventory(data.data);
      })
      .catch(err => {
        console.warn('Using mock inventory:', err);
        setInventory([
          { _id: 'i1', itemName: 'ข้าวสาร', quantity: 100, unit: 'kg', category: 'อาหาร' },
          { _id: 'i2', itemName: 'น้ำดื่ม', quantity: 500, unit: 'แพ็ค', category: 'น้ำดื่ม' },
          { _id: 'i3', itemName: 'พาราเซตามอล', quantity: 50, unit: 'กระปุก', category: 'ยาและเวชภัณฑ์' },
          { _id: 'i4', itemName: 'ผ้าห่ม', quantity: 30, unit: 'ผืน', category: 'เครื่องนุ่งห่ม' },
        ]);
      });

    Promise.all([fetchShelters, fetchInventory]).finally(() => setLoading(false));
  }, []);

  const categories = ['ทั้งหมด', ...new Set(inventory.map(item => item.category))];

  const handleAddItem = (item: InventoryItem) => {
    if (requestItems.find(i => i.itemId === item._id)) return;

    setRequestItems([
      ...requestItems,
      {
        itemId: item._id,
        name: item.itemName,
        quantity: 1,
        unit: item.unit,
        maxQuantity: item.quantity
      }
    ]);
  };

  const handleUpdateQuantity = (index: number, qty: number) => {
    const newItems = [...requestItems];
    const max = newItems[index].maxQuantity;
    const finalQty = Math.max(1, Math.min(qty, max));
    newItems[index].quantity = finalQty;
    setRequestItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index));
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
          requestDate: new Date().toISOString()
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

  const filteredInventory = activeCategory === 'ทั้งหมด'
    ? inventory
    : inventory.filter(item => item.category === activeCategory);

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, backdropFilter: 'blur(4px)' }}>
      <div className="card shadow-2xl border-0 overflow-hidden" style={{ width: '95%', maxWidth: '900px', backgroundColor: '#ffffff', borderRadius: '16px' }}>
        <div className="card-header border-0 p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#ffffff' }}>
          <h2 className="mb-0 fw-bold" style={{ fontSize: '1.5rem', color: '#111827' }}>สร้างคำขอเบิกของใหม่</h2>
          <button onClick={onClose} className="btn-close shadow-none"></button>
        </div>

        <div className="card-body p-4 pt-0" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="row g-4 mb-4">
            <div className="col-md-8">
              <FormSelect
                label="ศูนย์พักพิง"
                value={selectedShelter}
                onChange={setSelectedShelter}
                options={shelters.map(s => ({ value: s._id, label: s.name }))}
                placeholder="-- เลือกศูนย์พักพิง --"
              />
            </div>
            <div className="col-md-4">
              <FormSelect
                label="ความเร่งด่วน"
                value={urgency}
                onChange={setUrgency}
                options={[
                  { value: 'ต่ำ', label: 'ต่ำ' },
                  { value: 'กลาง', label: 'กลาง' },
                  { value: 'สูง', label: 'สูง' }
                ]}
              />
            </div>
          </div>

          <div className="row g-4">
            {/* Inventory Selection Section */}
            <div className="col-lg-6">
              <div className="p-3 bg-light rounded-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#374151', fontSize: '1.1rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8V21H3V8"></path>
                    <path d="M1 3H23V8H1V3Z"></path>
                    <path d="M10 12H14"></path>
                  </svg>
                  เลือกสินค้าในคลัง
                </h5>

                {/* Category Tabs */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`btn btn-sm px-3 py-2 rounded-pill transition-all ${activeCategory === cat ? 'btn-primary' : 'btn-white border'}`}
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        backgroundColor: activeCategory === cat ? '#2563eb' : '#ffffff',
                        borderColor: activeCategory === cat ? '#2563eb' : '#e5e7eb',
                        color: activeCategory === cat ? '#ffffff' : '#4b5563'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                  {loading ? (
                    <div className="col-span-2 text-center py-4 text-muted small text-uppercase letter-spacing-wide">กำลังโหลดคลังสินค้า...</div>
                  ) : filteredInventory.map(item => {
                    const isInBasket = requestItems.some(ri => ri.itemId === item._id);
                    return (
                      <div
                        key={item._id}
                        className={`p-3 rounded-3 border transition-all ${isInBasket ? 'opacity-50 pointer-events-none bg-light' : 'bg-white shadow-sm hov-lift cursor-pointer'}`}
                        onClick={() => !isInBasket && handleAddItem(item)}
                        style={{ border: '1px solid #e5e7eb' }}
                      >
                        <div className="small text-muted mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>{item.category}</div>
                        <div className="fw-bold mb-1" style={{ fontSize: '14px', color: '#111827' }}>{item.itemName}</div>
                        <div className="text-primary fw-600" style={{ fontSize: '12px' }}>{item.quantity} {item.unit}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Basket Section */}
            <div className="col-lg-6">
              <div className="p-3 border rounded-4 h-100 d-flex flex-column" style={{ borderColor: '#e5e7eb' }}>
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#374151', fontSize: '1.1rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  ตะกร้าคำขอ ({requestItems.length} รายการ)
                </h5>

                <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '350px' }}>
                  {requestItems.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <div className="mb-2">⚠️</div>
                      <div className="small fw-500">กรุณาเลือกสินค้าที่ต้องการด้านซ้าย</div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0 p-2 small">สินค้า</th>
                            <th className="border-0 p-2 small text-center" style={{ width: '100px' }}>จำนวน</th>
                            <th className="border-0 p-2" style={{ width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {requestItems.map((item, idx) => (
                            <tr key={item.itemId}>
                              <td className="p-2">
                                <div className="fw-600 mb-0" style={{ fontSize: '13px' }}>{item.name}</div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>คงเหลือ {item.maxQuantity} {item.unit}</div>
                              </td>
                              <td className="p-2">
                                <div className="input-group input-group-sm rounded-2 overflow-hidden border">
                                  <button className="btn btn-white border-0 px-2" onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}>-</button>
                                  <input
                                    type="number"
                                    className="form-control border-0 text-center p-0 shadow-none fw-600"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                                    style={{ width: '40px', fontSize: '13px' }}
                                  />
                                  <button className="btn btn-white border-0 px-2" onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}>+</button>
                                </div>
                              </td>
                              <td className="p-2 text-end">
                                <button className="btn btn-link text-danger p-0 shadow-none" onClick={() => handleRemoveItem(idx)}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 mt-5">
            <button
              onClick={onClose}
              className="btn btn-white border px-4 py-2 rounded-3 fw-600 transition-all hover-bg-light"
              style={{ color: '#4b5563' }}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={requestItems.length === 0}
              className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm transition-all hov-lift"
              style={{ backgroundColor: '#2563eb', border: 'none' }}
            >
              ยืนยันการสร้างคำขอ
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hov-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hov-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        .btn-white:hover {
          background-color: #f9fafb !important;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .inventory-grid::-webkit-scrollbar {
          width: 5px;
        }
        .inventory-grid::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}