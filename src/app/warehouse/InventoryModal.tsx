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
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <style>{`
                .modal-form-select option {
                    background-color: #ffffff;
                    color: #212529;
                    padding: 10px;
                    font-size: 15px;
                }
                .modal-form-select option:hover {
                    background-color: #f8f9fa;
                    color: #0d6efd;
                }
                .modal-form-select option:checked {
                    background-color: #e7f1ff;
                    color: #0d6efd;
                    font-weight: 600;
                }
                .modal-form-input {
                    border: 1px solid #dee2e6 !important;
                    background-color: #ffffff !important;
                    color: #212529 !important;
                    font-size: 15px;
                }
                .modal-form-input:focus {
                    border-color: #0d6efd !important;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
                    background-color: #ffffff !important;
                    color: #212529 !important;
                }
            `}</style>
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <div className="card-body p-4">
                    <h2 className="card-title mb-4 fw-bold" style={{ fontSize: '24px', color: '#111827' }}>
                        {item ? 'แก้ไขรายการสินค้า' : 'เพิ่มรายการสินค้าใหม่'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>ชื่อรายการสิ่งของ</label>
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
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>หมวดหมู่</label>
                            <select
                                className="form-select modal-form-input modal-form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>จำนวน</label>
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
                                <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>หน่วย</label>
                                <select
                                    className="form-select modal-form-input modal-form-select"
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
                                className="btn btn-outline-secondary px-4"
                                style={{ fontSize: '15px' }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary px-4"
                                style={{ fontSize: '15px', opacity: loading ? 0.7 : 1 }}
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
