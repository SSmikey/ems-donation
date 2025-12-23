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
        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };

    const modalContentStyle: CSSProperties = {
        backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '500px',
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
        appearance: 'none',
        paddingRight: '32px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300d4ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
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
                <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', fontWeight: 'bold', color: '#ffffff' }}>
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
                            style={selectStyle}
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
                                style={selectStyle}
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 24px', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '8px', background: 'transparent', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 24px', background: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '8px',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1
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
