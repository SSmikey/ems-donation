'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import styles from './quick-donation.module.css';

export default function QuickDonationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState<'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ'>('อาหาร');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('ชิ้น');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    message: '',
  });

  const categories: Array<'อาหาร' | 'ยาและเวชภัณฑ์' | 'เครื่องนุ่งห่ม' | 'น้ำดื่ม' | 'อื่นๆ'> = [
    'อาหาร',
    'น้ำดื่ม',
    'ยาและเวชภัณฑ์',
    'เครื่องนุ่งห่ม',
    'อื่นๆ'
  ];

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!itemName.trim()) {
      showToast('warning', '⚠️ กรุณากรอกชื่อสินค้า');
      return;
    }

    const qty = Number(quantity);
    if (qty <= 0 || isNaN(qty)) {
      showToast('warning', '⚠️ จำนวนต้องมากกว่า 0');
      return;
    }

    if (!unit.trim()) {
      showToast('warning', '⚠️ กรุณาเลือกหน่วย');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          category: category,
          quantity: qty,
          unit: unit,
        }),
      });

      if (response.ok) {
        showToast('success', '✅ บันทึกการบริจาคสำเร็จ! ขอบคุณสำหรับความเอื้อเฟื้อ');
        // Reset form
        setItemName('');
        setQuantity('');
        setUnit('ชิ้น');
        setCategory('อาหาร');
      } else {
        const error = await response.json();
        showToast('error', `❌ ${error.error || 'เกิดข้อผิดพลาด'}`);
      }
    } catch (error) {
      showToast('error', '❌ ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={styles.mainContent}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className={styles.contentArea}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h1>⚡ บันทึกของเข้าด่วน (Quick Donation)</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                รับของบริจาคเข้าสต็อกส่วนกลางอย่างรวดเร็ว
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>เลือกหมวดหมู่</label>
                <div className={styles.categoryGroup}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`${styles.categoryBtn} ${
                        category === cat ? styles.categoryBtnActive : ''
                      }`}
                      onClick={() => setCategory(cat)}
                      disabled={isSubmitting}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>ชื่อรายการสิ่งของ</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวสาร, ยาแก้ปวด..."
                  className={styles.inputField}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>จำนวน</label>
                  <input
                    type="number"
                    placeholder="0"
                    className={styles.inputField}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    min="1"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>หน่วย</label>
                  <select
                    className={styles.inputField}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="ชิ้น">ชิ้น</option>
                    <option value="ถุง">ถุง</option>
                    <option value="แพ็ค">แพ็ค</option>
                    <option value="กล่อง">กล่อง</option>
                    <option value="กิโลกรัม">กิโลกรัม</option>
                    <option value="ขวด">ขวด</option>
                    <option value="ผืน">ผืน</option>
                    <option value="ชุด">ชุด</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              {itemName && quantity && Number(quantity) > 0 && (
                <div style={{
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '2px solid rgba(74, 222, 128, 0.3)',
                  borderRadius: '10px',
                  padding: '15px',
                  marginTop: '20px',
                  marginBottom: '20px'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px', fontSize: '14px' }}>
                    <strong>📋 สรุปการบริจาค:</strong>
                  </p>
                  <p style={{ color: '#fff', fontSize: '16px' }}>
                    <strong>{itemName}</strong> ({category}) จำนวน <strong>{Number(quantity).toLocaleString()} {unit}</strong>
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? '⏳ กำลังบันทึก...' : 'ยืนยันการบันทึก (Confirm)'}
              </button>
            </form>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center'
            }}>
              💡 <strong>หมายเหตุ:</strong> ข้อมูลจะถูกบันทึกเข้าสู่ระบบคลังสินค้าทันที
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}