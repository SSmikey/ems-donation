'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
    _id: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
}

interface InventoryModalProps {
    item: InventoryItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function InventoryModal({ item, onClose, onSuccess }: InventoryModalProps) {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('อาหาร');
    const [quantity, setQuantity] = useState<number | string>(0);
    const [unit, setUnit] = useState('ชิ้น');
    const [loading, setLoading] = useState(false);

    const categories = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'อื่นๆ'];

    useEffect(() => {
        if (item) {
            setItemName(item.itemName);
            setCategory(item.category);
            setQuantity(item.quantity);
            setUnit(item.unit);
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            itemName,
            category,
            quantity: Number(quantity),
            unit,
        };

        try {
            const url = item ? `/api/inventory/${item._id}` : '/api/inventory';
            const method = item ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess();
            } else {
                alert(data.error || 'บันทึกไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
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
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#1a1a2e', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <div className="card-body p-4">
                    <h2 className="card-title mb-4 fw-bold" style={{ fontSize: '1.3rem', color: '#ffffff' }}>
                        {item ? 'แก้ไขรายการสินค้า' : 'เพิ่มรายการสินค้าใหม่'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ชื่อรายการสิ่งของ</label>
                            <input
                                type="text"
                                className="form-control modal-form-input"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                required
                                placeholder="เช่น ข้าวสาร, หน้ากากอนามัย..."
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>หมวดหมู่</label>
                            <select
                                className="form-select modal-form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>จำนวน</label>
                                <input
                                    type="number"
                                    className="form-control modal-form-input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>หน่วย</label>
                                <select
                                    className="form-select modal-form-input"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                >
                                    <option value="ชิ้น">ชิ้น</option>
                                    <option value="ถุง">ถุง</option>
                                    <option value="แพ็ค">แพ็ค</option>
                                    <option value="กล่อง">กล่อง</option>
                                    <option value="กิโลกรัม">กิโลกรัม</option>
                                    <option value="ผืน">ผืน</option>
                                </select>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-outline-light"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn fw-600"
                                style={{
                                    backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
