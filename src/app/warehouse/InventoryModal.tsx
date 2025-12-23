'use client';

import { useState, useEffect, CSSProperties } from 'react';

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

    // Style constants
    const modalOverlayStyle: CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };

    const modalContentStyle: CSSProperties = {
        backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', color: '#333',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    };

    const inputStyle: CSSProperties = {
        width: '100%', padding: '10px 12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem'
    };

    const labelStyle: CSSProperties = {
        display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#444'
    };

    const submitButtonStyle: CSSProperties = {
        padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px',
        fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 'bold' }}>
                    {item ? 'แก้ไขรายการสินค้า' : 'เพิ่มรายการสินค้าใหม่'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={labelStyle}>ชื่อรายการสิ่งของ</label>
                        <input
                            type="text"
                            style={inputStyle}
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                            placeholder="เช่น ข้าวสาร, หน้ากากอนามัย..."
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>หมวดหมู่</label>
                        <select
                            style={inputStyle}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>จำนวน</label>
                            <input
                                type="number"
                                style={inputStyle}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                min="0"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>หน่วย</label>
                            <select
                                style={inputStyle}
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer' }}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...submitButtonStyle,
                                backgroundColor: loading ? '#93c5fd' : '#3b82f6'
                            }}
                        >
                            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
