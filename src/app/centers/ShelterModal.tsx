'use client';

import { useState, useEffect } from 'react';
import FormSelect from '@/components/FormSelect';

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

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
            <style>{`
                .shelter-modal-input {
                    border: 1px solid rgba(0, 212, 255, 0.3) !important;
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    color: #ffffff !important;
                }
                .shelter-modal-input:focus {
                    border-color: #00d4ff !important;
                    background-color: rgba(255, 255, 255, 0.08) !important;
                    color: #ffffff !important;
                }
            `}</style>
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#1a1a2e', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <div className="card-body p-4">
                    <h2 className="card-title mb-4 fw-bold" style={{ fontSize: '1.3rem', color: '#ffffff' }}>
                        {shelter ? 'แก้ไขข้อมูลศูนย์พักพิง' : 'เพิ่มศูนย์พักพิงใหม่'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ชื่อศูนย์พักพิง</label>
                            <input className="form-control shelter-modal-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>อำเภอ</label>
                                <input className="form-control shelter-modal-input" value={district} onChange={e => setDistrict(e.target.value)} required />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ตำบล</label>
                                <input className="form-control shelter-modal-input" value={subdistrict} onChange={e => setSubdistrict(e.target.value)} required />
                            </div>
                        </div>

                        <div className="mb-3">
                            <FormSelect
                                label="ประเภทศูนย์"
                                value={shelterType}
                                onChange={setShelterType}
                                options={[
                                    { value: 'ศูนย์พักพิงหลัก', label: 'ศูนย์พักพิงหลัก' },
                                    { value: 'ศูนย์พักพิงชั่วคราว', label: 'ศูนย์พักพิงชั่วคราว' },
                                    { value: 'โรงพยาบาลสนาม', label: 'โรงพยาบาลสนาม' }
                                ]}
                                dark={true}
                            />
                        </div>

                        <div className="mb-3">
                            <FormSelect
                                label="สถานะความจุ"
                                value={capacityStatus}
                                onChange={setCapacityStatus}
                                options={[
                                    { value: 'รองรับได้', label: 'รองรับได้' },
                                    { value: 'ใกล้เต็ม', label: 'ใกล้เต็ม' },
                                    { value: 'เต็มแล้ว', label: 'เต็มแล้ว' }
                                ]}
                                dark={true}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                className="form-control shelter-modal-input"
                                placeholder="เช่น 08-1234-5678"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-600 mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>ผู้ดูแล</label>
                            <input
                                type="text"
                                className="form-control shelter-modal-input"
                                placeholder="ชื่อผู้ดูแลศูนย์พักพิง"
                                value={responsible}
                                onChange={e => setResponsible(e.target.value)}
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" onClick={onClose} className="btn btn-outline-light">
                                ยกเลิก
                            </button>
                            <button type="submit" disabled={loading} className="btn fw-600 text-nowrap" style={{ backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none' }}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}
