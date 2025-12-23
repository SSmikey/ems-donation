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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shelter) {
            setName(shelter.name);
            setDistrict(shelter.district);
            setSubdistrict(shelter.subdistrict);
            setShelterType(shelter.shelterType);
            setCapacityStatus(shelter.capacityStatus || 'รองรับได้');
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
            responsible: shelter?.responsible || [], // Maintain existing if editing
            phoneNumbers: shelter?.phoneNumbers || [],
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
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };

    const modalContentStyle: CSSProperties = {
        backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', color: '#333'
    };

    const inputStyle: CSSProperties = {
        width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '6px'
    };

    const labelStyle: CSSProperties = {
        display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '0.9rem'
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 'bold' }}>
                    {shelter ? 'แก้ไขข้อมูลศูนย์พักพิง' : 'เพิ่มศูนย์พักพิงใหม่'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>ชื่อศูนย์พักพิง</label>
                    <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />

                    <div style={{ display: 'flex', gap: '10px' }}>
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
                    <select style={inputStyle} value={shelterType} onChange={e => setShelterType(e.target.value)}>
                        <option value="ศูนย์พักพิงหลัก">ศูนย์พักพิงหลัก</option>
                        <option value="ศูนย์พักพิงชั่วคราว">ศูนย์พักพิงชั่วคราว</option>
                        <option value="โรงพยาบาลสนาม">โรงพยาบาลสนาม</option>
                    </select>

                    <label style={labelStyle}>สถานะความจุ</label>
                    <select style={inputStyle} value={capacityStatus} onChange={e => setCapacityStatus(e.target.value)}>
                        <option value="รองรับได้">รองรับได้</option>
                        <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                        <option value="เต็มแล้ว">เต็มแล้ว</option>
                    </select>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}>
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
