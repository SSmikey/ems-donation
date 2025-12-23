'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CenterModal from '@/components/CenterModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Toast from '@/components/Toast';
import styles from './centers.module.css';

interface Center {
  _id?: string;
  name: string;
  district: string;
  subdistrict: string;
  capacity?: number | null;
  capacityStatus: 'รองรับได้' | 'ใกล้เต็ม' | 'เต็มแล้ว';
  shelterType: string;
  phoneNumbers: string[];
  responsible: {
    name: string;
    position: string;
    phone: string;
  }[];
}

export default function CentersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [centers, setCenters] = useState<Center[]>([]);
  const [filteredShelters, setFilteredShelters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [errorInfo, setErrorInfo] = useState<any>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    centerId: '',
    centerName: '',
  });
  const [toast, setToast] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  // Fetch Centers from API
  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shelters');
      const result = await res.json();

      if (result.data && Array.isArray(result.data)) {
        setCenters(result.data);
        setFilteredShelters(result.data);
      } else if (Array.isArray(result)) {
        setCenters(result);
        setFilteredShelters(result);
      } else if (result.error) {
        setErrorInfo(result);
        showToast('error', 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching shelters:', error);
      setErrorInfo({ error: 'Failed to connect to API', details: String(error) });
      showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // Filter
  useEffect(() => {
    const results = centers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subdistrict?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || s.capacityStatus === filterStatus;
      return matchSearch && matchStatus;
    });
    setFilteredShelters(results);
  }, [searchTerm, filterStatus, centers]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'รองรับได้':
        return styles.statusNormal;
      case 'ใกล้เต็ม':
        return styles.statusWarn;
      case 'เต็มแล้ว':
        return styles.statusCritical;
      default:
        return styles.statusNormal;
    }
  };

  // CRUD Operations
  const handleAddCenter = () => {
    setEditingCenter(null);
    setIsModalOpen(true);
  };

  const handleEditCenter = (center: Center) => {
    setEditingCenter(center);
    setIsModalOpen(true);
  };

  const handleSaveCenter = async (center: Center) => {
    try {
      if (editingCenter) {
        // Update
        const response = await fetch(`/api/shelters/${editingCenter._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(center),
        });

        if (response.ok) {
          showToast('success', '💾 แก้ไขศูนย์สำเร็จ');
          fetchCenters();
        } else {
          const error = await response.json();
          showToast('error', `❌ ${error.error || 'เกิดข้อผิดพลาด'}`);
        }
      } else {
        // Create
        const response = await fetch('/api/shelters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(center),
        });

        if (response.ok) {
          showToast('success', '✅ เพิ่มศูนย์สำเร็จ');
          fetchCenters();
        } else {
          const error = await response.json();
          showToast('error', `❌ ${error.error || 'เกิดข้อผิดพลาด'}`);
        }
      }

      setIsModalOpen(false);
      setEditingCenter(null);
    } catch (error) {
      showToast('error', '❌ ไม่สามารถเชื่อมต่อได้');
      console.error('Save error:', error);
    }
  };

  const handleDeleteClick = (center: Center) => {
    setConfirmDialog({
      show: true,
      centerId: center._id!,
      centerName: center.name,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/shelters/${confirmDialog.centerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('success', '🗑️ ลบศูนย์สำเร็จ');
        fetchCenters();
      } else {
        showToast('error', '❌ เกิดข้อผิดพลาด');
      }
    } catch (error) {
      showToast('error', '❌ ไม่สามารถเชื่อมต่อได้');
      console.error('Delete error:', error);
    } finally {
      setConfirmDialog({ show: false, centerId: '', centerName: '' });
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={styles.mainContent}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>จัดการศูนย์พักพิง ({centers.length} แห่ง)</h1>
            <button 
              className={styles.addButton}
              onClick={handleAddCenter}
            >
              + เพิ่มศูนย์ใหม่
            </button>
          </div>

          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="ค้นหาชื่อศูนย์, อำเภอ, ตำบล..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="รองรับได้">รองรับได้</option>
              <option value="ใกล้เต็ม">ใกล้เต็ม</option>
              <option value="เต็มแล้ว">เต็มแล้ว</option>
            </select>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.6)' }}>
              กำลังโหลดข้อมูลศูนย์พักพิง...
            </p>
          ) : (
            <div className={styles.centersGrid}>
              {filteredShelters.map((s) => (
                <div key={s._id} className={styles.centerCard}>
                  <span className={`${styles.statusBadge} ${getStatusClass(s.capacityStatus)}`}>
                    {s.capacityStatus || 'ปกติ'}
                  </span>
                  <h3 className={styles.centerName}>{s.name}</h3>
                  <p className={styles.centerLocation}>
                    📍 ต.{s.subdistrict} อ.{s.district}
                  </p>

                  <div className={styles.infoRow}>
                    <span className={styles.label}>ประเภท:</span>
                    <span>{s.shelterType}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>ความจุ:</span>
                    <span>{s.capacity ? `${s.capacity.toLocaleString()} คน` : 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>เบอร์โทร:</span>
                    <span>{s.phoneNumbers?.[0] || '-'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>ผู้รับผิดชอบ:</span>
                    <span>{s.responsible?.[0]?.name || '-'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editCardBtn}
                      onClick={() => handleEditCenter(s)}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      className={styles.deleteCardBtn}
                      onClick={() => handleDeleteClick(s)}
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredShelters.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '50px',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <p>ไม่พบข้อมูลศูนย์ที่ตรงกับการค้นหา</p>
              {errorInfo && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: 'rgba(255,0,0,0.1)',
                    borderRadius: '10px',
                    textAlign: 'left',
                    color: '#f87171',
                  }}
                >
                  <h4 style={{ color: '#fff' }}>Debug Information:</h4>
                  <p>
                    <strong>DB Name:</strong> {errorInfo.dbName || '-'}
                  </p>
                  <p>
                    <strong>Collections Found:</strong>{' '}
                    {errorInfo.availableCollections?.join(', ') || 'none'}
                  </p>
                  <p>
                    <strong>Error:</strong> {errorInfo.error}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '10px',
                    }}
                  >
                    * โปรดตรวจสอบว่า MONGODB_URI ใน .env.local ระบุฐานข้อมูลที่ถูกต้อง
                    และข้อมูลศูนย์พักพิงอยู่ในคอลเลกชันที่ระบบหาพบ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CenterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCenter(null);
        }}
        onSave={handleSaveCenter}
        editCenter={editingCenter}
      />

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="ยืนยันการลบศูนย์พักพิง"
        message={`คุณต้องการลบ "${confirmDialog.centerName}" ใช่หรือไม่?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ show: false, centerId: '', centerName: '' })}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}