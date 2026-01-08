'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import CreateRequestModal from '@/app/distribution/CreateRequestModal';
import FormSelect from '@/components/FormSelect';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import QuickDonationModal from '@/components/QuickDonationModal';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    shelterCount: 0,
    totalInventoryItems: 0,
    pendingRequests: 0,
    lowStockCount: 0,
    highUrgencyCount: 0,
    approvedRequests: 0,
    inTransitRequests: 0,
    totalDeliveries: 0,
  });

  const [categories, setCategories] = useState<any>({});
  const [shelters, setShelters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Requests Table/Feed State
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredReqs, setFilteredReqs] = useState<any[]>([]);
  const [reqUrgencyFilter, setReqUrgencyFilter] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('');

  // Modal & UI State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showQuickDonationModal, setShowQuickDonationModal] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ requestId: string; shelterName: string } | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ requestId: string; shelterName: string } | null>(null);

  const router = useRouter();

  const fetchRequests = useCallback(async () => {
    try {
      const requestsRes = await fetch('/api/distribution-requests?limit=50');
      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setRequests(requestsData.data);
      }
    } catch (error) {
      console.warn('Error fetching requests:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();

      if (statsData.success) {
        const { summary, inventory, distribution } = statsData.data;
        const byStatus = distribution?.byStatus || {};

        setStats(prev => ({
          ...prev,
          shelterCount: summary.totalShelters,
          totalInventoryItems: inventory.totalQuantity,
          pendingRequests: summary.pendingDistributions,
          lowStockCount: summary.lowStockAlerts,
          highUrgencyCount: summary.highUrgencyCount || 0,
          approvedRequests: byStatus['อนุมัติแล้ว'] || 0,
          inTransitRequests: byStatus['กำลังจัดส่ง'] || 0,
          totalDeliveries: byStatus['ส่งมอบแล้ว'] || 0,
        }));
        setCategories(inventory.byCategory || {});
      }

      // Fetch shelters
      const sheltersRes = await fetch('/api/shelters');
      const sheltersData = await sheltersRes.json();
      if (sheltersData.success) {
        setShelters(sheltersData.data);
      }

      // Fetch distribution requests
      await fetchRequests();
    } catch (error) {
      console.warn('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update filtered requests when filters or source requests change
  useEffect(() => {
    // Dashboard logic: strictly show only pending requests that need approval
    let result = requests.filter(r => r.status === 'รอดำเนินการ');

    if (reqUrgencyFilter) {
      result = result.filter(r => r.urgency === reqUrgencyFilter);
    }
    // We remove reqStatusFilter from this useEffect because dashboard is now fixed to pending

    // Sort: High Urgency first, then by date
    result.sort((a, b) => {
      const urgencyScore: any = { 'สูง': 3, 'กลาง': 2, 'ต่ำ': 1 };
      const scoreA = urgencyScore[a.urgency] || 0;
      const scoreB = urgencyScore[b.urgency] || 0;

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredReqs(result);
  }, [reqUrgencyFilter, requests]);

  // Extract unique values for filters
  const districts = [...new Set(shelters.map(s => s.district).filter(Boolean))].sort() as string[];
  const subdistricts = [...new Set(shelters.filter(s => !selectedDistrict || s.district === selectedDistrict).map(s => s.subdistrict).filter(Boolean))].sort() as string[];
  const types = [...new Set(shelters.map(s => s.shelterType).filter(Boolean))].sort() as string[];
  const statuses = [...new Set(shelters.map(s => s.certificationStatus).filter(Boolean))].sort() as string[];

  // Filter Logic
  const filteredShelters = shelters.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = !selectedDistrict || s.district === selectedDistrict;
    const matchesSubdistrict = !selectedSubdistrict || s.subdistrict === selectedSubdistrict;
    const matchesType = !selectedType || s.shelterType === selectedType;
    const matchesStatus = !selectedStatus || s.certificationStatus === selectedStatus;
    return matchesSearch && matchesDistrict && matchesSubdistrict && matchesType && matchesStatus;
  });

  const isFiltered = searchQuery !== '' || selectedDistrict !== '' || selectedSubdistrict !== '' || selectedType !== '' || selectedStatus !== '';

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredShelters.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredShelters.length / recordsPerPage);

  const handleCreateRequest = (id: string) => {
    setSelectedShelterId(id);
    setShowRequestModal(true);
  };

  const handleApproveRequest = (id: string, shelterName: string) => {
    setConfirmDialog({ requestId: id, shelterName });
  };

  const confirmApproveRequest = async () => {
    if (!confirmDialog) return;
    try {
      const res = await fetch(`/api/distribution-requests/${confirmDialog.requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: {
            userId: 'admin-001',
            username: 'admin',
            firstName: 'เจ้าหน้าที่',
            lastName: 'ดูแลคลัง',
            role: 'ADMIN',
            approvedAt: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        setToast({ message: 'อนุมัติคำขอสำเร็จ ยอดจองจะถูกตัดออกจากสต็อกจริง', type: 'success' });
        fetchData();
        fetchRequests();
      } else {
        const errorData = await res.json();
        setToast({ message: errorData.error || 'ไม่สามารถอนุมัติคำขอได้', type: 'error' });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      setToast({ message: 'เกิดข้อผิดพลาดในการอนุมัติคำขอ', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleCancelRequest = (id: string, shelterName: string) => {
    setCancelDialog({ requestId: id, shelterName });
  };

  const confirmCancelRequest = async () => {
    if (!cancelDialog) return;
    try {
      const res = await fetch(`/api/distribution-requests/${cancelDialog.requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelledBy: { userId: 'admin-001', username: 'admin' },
          note: 'ยกเลิกโดยผู้ดูแลระบบ'
        })
      });

      if (res.ok) {
        setToast({ message: 'ยกเลิกคำขอเบิกสิ่งของคืนเรียบร้อยแล้ว', type: 'success' });
        fetchData();
        fetchRequests();
      } else {
        const errorData = await res.json();
        setToast({ message: errorData.error || 'ไม่สามารถยกเลิกคำขอได้', type: 'error' });
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      setToast({ message: 'เกิดข้อผิดพลาดในการยกเลิกคำขอ', type: 'error' });
    } finally {
      setCancelDialog(null);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-grow-1 overflow-y-auto p-4" style={{ paddingTop: '30px', paddingBottom: '30px', backgroundColor: '#f8f9fa' }}>
          {/* Main Statistics */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#374151' }}>สถิติภาพรวม</h5>
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="จำนวนศูนย์พักพิงทั้งหมด"
                  value={loading ? '...' : stats.shelterCount.toLocaleString()}
                  color="blue"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="จำนวนพัสดุในคลังทั้งหมด"
                  value={loading ? '...' : stats.totalInventoryItems.toLocaleString()}
                  color="cyan"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="คำขอรอดำเนินการ"
                  value={loading ? '...' : stats.pendingRequests.toLocaleString()}
                  color="purple"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="คำขอที่มีความเร่งด่วนสูง"
                  value={loading ? '...' : stats.highUrgencyCount.toLocaleString()}
                  color="red"
                />
              </div>
            </div>
          </div>

          {/* Items by Category as StatCards */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#374151' }}>จำนวนพัสดุคงคลังแยกตามหมวดหมู่</h5>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3">
              {Object.keys(categories).length > 0 ? (
                Object.entries(categories).map(([name, data]: [string, any]) => {
                  const totalQty = data.totalQuantity;
                  const reservedQty = data.totalReservedQuantity || 0;

                  const categoryColorMap: any = {
                    'อาหาร': 'green',
                    'ยาและเวชภัณฑ์': 'orange',
                    'เครื่องนุ่งห่ม': 'pink',
                    'น้ำดื่ม': 'indigo',
                    'อื่นๆ': 'gray'
                  };

                  const color = categoryColorMap[name] || 'cyan';
                  const progress = totalQty > 0 ? ((totalQty - reservedQty) / totalQty) * 100 : 100;

                  return (
                    <div key={name} className="col">
                      <StatCard
                        title={name}
                        value={totalQty.toLocaleString()}
                        subtitle={`จองแล้ว: ${reservedQty.toLocaleString()}`}
                        color={color as any}
                        progress={progress}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-12">
                  <div className="card shadow-sm p-4 text-center text-muted" style={{ background: '#ffffff', border: '1px solid #e9ecef' }}>
                    ไม่มีข้อมูลพัสดุในหมวดหมู่
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shelter Search Table */}
          <div className="card border-0 shadow-sm mt-4 mb-5">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ color: '#111827', fontSize: '18px' }}>ค้นหาศูนย์พักพิง</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm px-3 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => setShowQuickDonationModal(true)}
                    style={{ backgroundColor: '#10b981', border: 'none' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    บันทึกของเข้าด่วน
                  </button>
                  <button
                    className="btn btn-primary btn-sm px-3 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => setShowRequestModal(true)}
                    style={{ backgroundColor: '#2563eb', border: 'none' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    สร้างคำขอเบิกใหม่
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-3">
                  <label className="filter-label">ระบุชื่อศูนย์</label>
                  <input
                    type="text"
                    className="form-control filter-control"
                    placeholder="ค้นหาชื่อศูนย์พักพิง..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-2">
                  <FormSelect
                    label="อำเภอ"
                    value={selectedDistrict}
                    onChange={(val) => { setSelectedDistrict(val); setSelectedSubdistrict(''); setCurrentPage(1); }}
                    options={[
                      { value: '', label: 'ทั้งหมด (อำเภอ)' },
                      ...districts.map(d => ({ value: d, label: d }))
                    ]}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-2">
                  <FormSelect
                    label="ตำบล"
                    value={selectedSubdistrict}
                    onChange={(val) => { setSelectedSubdistrict(val); setCurrentPage(1); }}
                    options={[
                      { value: '', label: 'ทั้งหมด (ตำบล)' },
                      ...subdistricts.map(sd => ({ value: sd, label: sd }))
                    ]}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-2">
                  <FormSelect
                    label="ประเภทสถานที่"
                    value={selectedType}
                    onChange={(val) => { setSelectedType(val); setCurrentPage(1); }}
                    options={[
                      { value: '', label: 'ทั้งหมด (ประเภท)' },
                      ...types.map(t => ({ value: t, label: t }))
                    ]}
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <FormSelect
                    label="สถานะการรับรอง"
                    value={selectedStatus}
                    onChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
                    options={[
                      { value: '', label: 'ทั้งหมด (สถานะ)' },
                      ...statuses.map(st => ({ value: st, label: st }))
                    ]}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="bg-light">
                    <tr style={{ color: '#6b7280', fontSize: '14px' }}>
                      <th className="border-0 p-3">ชื่อศูนย์พักพิง</th>
                      <th className="border-0 p-3">ตำบล/อำเภอ</th>
                      <th className="border-0 p-3">ประเภท</th>
                      <th className="border-0 p-3 text-center">สถานะ</th>
                      <th className="border-0 p-3 text-end">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center p-5 text-muted">
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : !isFiltered ? (
                      <tr>
                        <td colSpan={5} className="text-center p-5">
                          <div className="mb-2">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                          </div>
                          <div className="text-muted fw-500">กรุณาพิมพ์ชื่อหรือเลือกตัวกรองเพื่อนเรียกดูข้อมูล</div>
                        </td>
                      </tr>
                    ) : currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-5 text-muted">ไม่พบข้อมูลที่ตรงตามเงื่อนไข</td>
                      </tr>
                    ) : (
                      currentRecords.map((s) => (
                        <tr key={s._id} style={{ fontSize: '15px' }}>
                          <td className="p-3 fw-500">{s.name}</td>
                          <td className="p-3 text-muted">ต.{s.subdistrict} อ.{s.district}</td>
                          <td className="p-3">{s.shelterType}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`badge rounded-pill px-3 py-2`}
                              style={{
                                backgroundColor: s.capacityStatus === 'รองรับได้' ? '#10b981' : '#f59e0b',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                            >
                              {s.capacityStatus}
                            </span>
                          </td>
                          <td className="p-3 text-end">
                            <button
                              onClick={() => handleCreateRequest(s._id)}
                              className="btn btn-primary btn-sm px-3"
                              style={{
                                backgroundColor: '#2563eb',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 500
                              }}
                            >
                              สร้างคำขอ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {isFiltered && totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    แสดง {indexOfFirstRecord + 1} ถึง {Math.min(indexOfLastRecord, filteredShelters.length)} จาก {filteredShelters.length} รายการ
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0 gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                          <button
                            className="page-link border-0 rounded-2"
                            onClick={() => setCurrentPage(p)}
                            style={currentPage === p ? { backgroundColor: '#2563eb', color: '#fff' } : { color: '#4b5563' }}
                          >
                            {p}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Distribution Request Feed Section */}
          <div className="mb-5 mt-5">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#111827' }}>
              <div style={{ width: '4px', height: '24px', backgroundColor: '#2563eb', borderRadius: '4px' }}></div>
              รายการคำขอเบิกสิ่งของ (รายการด่วน)
            </h5>

            <div className="row g-4">
              {/* Left Side: Filters */}
              <div className="col-lg-3">
                <div className="card border-0 shadow-sm p-4 rounded-4 sticky-top" style={{ top: '100px', backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#374151', fontSize: '14px' }}>
                      ตัวกรองรายการ
                    </h6>
                    {(reqUrgencyFilter || reqStatusFilter) && (
                      <button
                        className="btn btn-link btn-sm p-0 m-0 text-decoration-none text-muted"
                        onClick={() => { setReqUrgencyFilter(''); setReqStatusFilter(''); }}
                        style={{ fontSize: '11px' }}
                      >
                        ล้างตัวกรอง
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="filter-label mb-2 fw-600 d-block px-1" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>ความเร่งด่วน</label>
                    <div className="d-flex flex-column gap-2">
                      {['', 'ต่ำ', 'กลาง', 'สูง'].map(val => (
                        <button
                          key={val}
                          onClick={() => setReqUrgencyFilter(val)}
                          className={`btn btn-sm text-start py-2 px-3 rounded-3 border-0 ${reqUrgencyFilter === val ? 'shadow-sm' : ''}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: reqUrgencyFilter === val ? '#2563eb' : '#f9fafb',
                            color: reqUrgencyFilter === val ? '#ffffff' : '#4b5563'
                          }}
                        >
                          {val === '' ? 'ทั้งหมด' : `เร่งด่วน${val}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="filter-label mb-2 fw-600 d-block px-1" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>สถานะ</label>
                    <div className="d-flex flex-column gap-2">
                      {['', 'รอดำเนินการ', 'อนุมัติแล้ว', 'ยกเลิกแล้ว'].map(val => (
                        <button
                          key={val}
                          onClick={() => setReqStatusFilter(val)}
                          className={`btn btn-sm text-start py-2 px-3 rounded-3 border-0 ${reqStatusFilter === val ? 'shadow-sm' : ''}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: reqStatusFilter === val ? '#2563eb' : '#f9fafb',
                            color: reqStatusFilter === val ? '#ffffff' : '#4b5563'
                          }}
                        >
                          {val === '' ? 'ทั้งหมด' : val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Request Cards */}
              <div className="col-lg-9">
                <div className="d-flex flex-column gap-3">
                  {loading ? (
                    <div className="text-center py-5">กำลังโหลดข้อมูล...</div>
                  ) : filteredReqs.length === 0 ? (
                    <div className="text-center py-5 text-muted border border-dashed rounded-4">ไม่พบรายการคำขอเบิกที่รอดำเนินการ</div>
                  ) : filteredReqs.map(req => (
                    <div key={req._id} className="card border-0 shadow-sm rounded-4 hov-lift overflow-hidden" style={{ transition: 'all 0.3s ease', backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}>
                      <div className="card-body p-0">
                        <div className="d-flex">
                          <div style={{ width: '6px', backgroundColor: req.urgency === 'สูง' ? '#ef4444' : req.urgency === 'กลาง' ? '#f59e0b' : '#10b981' }}></div>
                          <div className="flex-grow-1 p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="fw-bold mb-1" style={{ color: '#111827' }}>{req.shelterName || 'ไม่ระบุชื่อศูนย์'}</h6>
                                <div className="text-muted small">#{req._id.substring(req._id.length - 6).toUpperCase()} • {new Date(req.createdAt).toLocaleDateString('th-TH')}</div>
                              </div>
                              <div className="d-flex gap-2">
                                <span className="badge bg-white rounded-pill px-3 py-2 border shadow-sm"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: req.urgency === 'สูง' ? '#dc2626' : req.urgency === 'กลาง' ? '#d97706' : '#059669',
                                    borderColor: req.urgency === 'สูง' ? 'rgba(239, 68, 68, 0.3)' : req.urgency === 'กลาง' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                  }}>
                                  เร่งด่วน{req.urgency}
                                </span>
                                <span className="badge bg-white text-dark border rounded-pill px-3 py-2 shadow-sm" style={{ fontSize: '11px', fontWeight: 600 }}>
                                  {req.status}
                                </span>
                              </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {req.items?.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="bg-light px-3 py-2 rounded-3 border d-flex gap-2 align-items-center" style={{ fontSize: '12px' }}>
                                  <span className="fw-bold">{item.itemName}</span>
                                  <span className="text-primary fw-bold text-nowrap">{item.quantity} {item.unit}</span>
                                </div>
                              ))}
                              {req.items?.length > 4 && <div className="text-muted small align-self-center">+ อีก {req.items.length - 4} รายการ</div>}
                            </div>
                          </div>
                          <div className="p-3 border-start bg-light bg-opacity-10 d-flex flex-column justify-content-center gap-2" style={{ minWidth: '150px' }}>
                            {req.status === 'รอดำเนินการ' && (
                              <button
                                onClick={() => handleApproveRequest(req._id, req.shelterName)}
                                className="btn btn-success btn-sm rounded-pill fw-bold"
                              >
                                อนุมัติ
                              </button>
                            )}
                            {['รอดำเนินการ', 'อนุมัติแล้ว'].includes(req.status) && (
                              <button
                                onClick={() => handleCancelRequest(req._id, req.shelterName)}
                                className="btn btn-danger btn-sm rounded-pill fw-bold"
                              >
                                ยกเลิก
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/distribution?highlightId=${req._id}`)}
                              className="btn btn-white btn-sm rounded-pill border fw-600 shadow-sm"
                            >
                              รายละเอียด
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        showQuickDonationModal && (
          <QuickDonationModal
            onClose={() => setShowQuickDonationModal(false)}
            onSuccess={() => {
              setShowQuickDonationModal(false);
              fetchData();
            }}
          />
        )
      }

      {
        showRequestModal && (
          <CreateRequestModal
            onClose={() => setShowRequestModal(false)}
            onSuccess={() => {
              setShowRequestModal(false);
              fetchData();
              fetchRequests();
            }}
            initialShelterId={selectedShelterId}
          />
        )
      }

      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }

      {
        confirmDialog && (
          <ConfirmDialog
            title="อนุมัติคำขอเบิกสิ่งของ"
            message={`ยืนยันการอนุมัติคำขอเบิกสิ่งของสำหรับ "${confirmDialog.shelterName}"? ระบบจะตัดยอดสินค้าที่ "จองไว้" ออกจากคลังสินค้าจริงทันที`}
            confirmText="ยืนยันอนุมัติ"
            cancelText="ยกเลิก"
            isDangerous={false}
            onConfirm={confirmApproveRequest}
            onCancel={() => setConfirmDialog(null)}
          />
        )
      }

      {
        cancelDialog && (
          <ConfirmDialog
            title="ยกเลิกคำขอเบิกสิ่งของ"
            message={`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอของ "${cancelDialog.shelterName}"? ระบบจะทำการคืนสินค้าที่จองไว้หรือที่หักไปแล้วกลับเข้าคลัง`}
            confirmText="ยืนยันการยกเลิก"
            cancelText="ไม่ยกเลิก"
            isDangerous={true}
            onConfirm={confirmCancelRequest}
            onCancel={() => setCancelDialog(null)}
          />
        )
      }
    </div >
  );
}
