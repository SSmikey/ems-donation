'use client';

import { useState, useEffect, CSSProperties } from 'react';

interface Shelter {
    _id?: string;
    name: string;
    district: string;
    subdistrict: string;
    shelterType: string;
    capacityStatus: string;
    responsible?: any[];
    phoneNumbers?: string[];
}

interface ShelterModalProps {
    shelter: Shelter | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ShelterModal({ shelter, onClose, onSuccess }: ShelterModalProps) {
    const [name, setName] = useState('');
    const [district, setDistrict] = useState('');
    const [subdistrict, setSubdistrict] = useState('');
    const [shelterType, setShelterType] = useState('ศูนย์พักพิงหลัก');
    const [capacityStatus, setCapacityStatus] = useState('รองรับได้');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [responsible, setResponsible] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shelter) {
            setName(shelter.name);
            setDistrict(shelter.district);
            setSubdistrict(shelter.subdistrict);
            setShelterType(shelter.shelterType);
            setCapacityStatus(shelter.capacityStatus || 'รองรับได้');
            setPhoneNumber(shelter.phoneNumbers?.[0] || '');
            setResponsible(shelter.responsible?.[0] || '');
        }
    }, [shelter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            district,
            subdistrict,
            shelterType,
            capacityStatus,
            responsible: responsible ? [responsible] : shelter?.responsible || [],
            phoneNumbers: phoneNumber ? [phoneNumber] : shelter?.phoneNumbers || [],
            status: 'active'
        };

        try {
            const url = shelter ? `/api/shelters` : '/api/shelters';
            const method = shelter ? 'PUT' : 'POST';

            // Note: For PUT, the API might take the ID from body or query. 
            // Looking at api/shelters/route.ts, PUT likely needs the _id in body if it's broad.
            const body = shelter ? { ...payload, _id: shelter._id } : payload;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                alert(data.error || 'บันทึกไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    };

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
                    {shelter ? 'แก้ไขข้อมูลศูนย์พักพิง' : 'เพิ่มศูนย์พักพิงใหม่'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>ชื่อศูนย์พักพิง</label>
                    <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>อำเภอ</label>
                            <input style={inputStyle} value={district} onChange={e => setDistrict(e.target.value)} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>ตำบล</label>
                            <input style={inputStyle} value={subdistrict} onChange={e => setSubdistrict(e.target.value)} required />
                        </div>
                    </div>

                    <label style={labelStyle}>ประเภทศูนย์</label>
                    <select style={selectStyle} value={shelterType} onChange={e => setShelterType(e.target.value)}>
                        <option value="ศูนย์พักพิงหลัก">ศูนย์พักพิงหลัก</option>
                        <option value="ศูนย์พักพิงชั่วคราว">ศูนย์พักพิงชั่วคราว</option>
                        <option value="โรงพยาบาลสนาม">โรงพยาบาลสนาม</option>
                    </select>

                    <label style={labelStyle}>สถานะความจุ</label>
                    <select style={selectStyle} value={capacityStatus} onChange={e => setCapacityStatus(e.target.value)}>
                        <option value="รองรับได้">รองรับได้</option>
                        <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                        <option value="เต็มแล้ว">เต็มแล้ว</option>
                    </select>

                    <label style={labelStyle}>เบอร์โทรศัพท์</label>
                    <input
                        style={inputStyle}
                        type="tel"
                        placeholder="เช่น 08-1234-5678"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                    />

                    <label style={labelStyle}>ผู้ดูแล</label>
                    <input
                        style={inputStyle}
                        type="text"
                        placeholder="ชื่อผู้ดูแลศูนย์พักพิง"
                        value={responsible}
                        onChange={e => setResponsible(e.target.value)}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 24px', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '8px', background: 'transparent', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}>
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
