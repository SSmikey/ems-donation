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
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <style>{`
                .shelter-modal-select option {
                    background-color: #ffffff;
                    color: #212529;
                    padding: 10px;
                    font-size: 15px;
                }
                .shelter-modal-select option:hover {
                    background-color: #f8f9fa;
                    color: #0d6efd;
                }
                .shelter-modal-select option:checked {
                    background-color: #e7f1ff;
                    color: #0d6efd;
                    font-weight: 600;
                }
                .shelter-modal-input {
                    border: 1px solid #dee2e6 !important;
                    background-color: #ffffff !important;
                    color: #212529 !important;
                    font-size: 15px;
                }
                .shelter-modal-input:focus {
                    border-color: #0d6efd !important;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
                    background-color: #ffffff !important;
                    color: #212529 !important;
                }
            `}</style>
            <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <div className="card-body p-4">
                    <h2 className="card-title mb-4 fw-bold" style={{ fontSize: '24px', color: '#111827' }}>
                        {shelter ? 'แก้ไขข้อมูลศูนย์พักพิง' : 'เพิ่มศูนย์พักพิงใหม่'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>ชื่อศูนย์พักพิง</label>
                            <input className="form-control shelter-modal-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>อำเภอ</label>
                                <input className="form-control shelter-modal-input" value={district} onChange={e => setDistrict(e.target.value)} required />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>ตำบล</label>
                                <input className="form-control shelter-modal-input" value={subdistrict} onChange={e => setSubdistrict(e.target.value)} required />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>ประเภทศูนย์</label>
                            <select className="form-select shelter-modal-input shelter-modal-select" value={shelterType} onChange={e => setShelterType(e.target.value)}>
                                <option value="ศูนย์พักพิงหลัก">ศูนย์พักพิงหลัก</option>
                                <option value="ศูนย์พักพิงชั่วคราว">ศูนย์พักพิงชั่วคราว</option>
                                <option value="โรงพยาบาลสนาม">โรงพยาบาลสนาม</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>สถานะความจุ</label>
                            <select className="form-select shelter-modal-input shelter-modal-select" value={capacityStatus} onChange={e => setCapacityStatus(e.target.value)}>
                                <option value="รองรับได้">รองรับได้</option>
                                <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                                <option value="เต็มแล้ว">เต็มแล้ว</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                className="form-control shelter-modal-input"
                                placeholder="เช่น 08-1234-5678"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold mb-2" style={{ color: '#495057', fontSize: '14px' }}>ผู้ดูแล</label>
                            <input
                                type="text"
                                className="form-control shelter-modal-input"
                                placeholder="ชื่อผู้ดูแลศูนย์พักพิง"
                                value={responsible}
                                onChange={e => setResponsible(e.target.value)}
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" onClick={onClose} className="btn btn-outline-secondary px-4" style={{ fontSize: '15px' }}>
                                ยกเลิก
                            </button>
                            <button type="submit" disabled={loading} className="btn btn-primary px-4" style={{ fontSize: '15px' }}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}
