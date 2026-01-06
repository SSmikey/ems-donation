'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import CreateRequestModal from '@/app/distribution/CreateRequestModal';
import FormSelect from '@/components/FormSelect';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [loading, setLoading] = useState(true);

  // Shelters Table State
  const [shelters, setShelters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
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

        // Fetch shelters for table
        const sheltersRes = await fetch('/api/shelters');
        const sheltersData = await sheltersRes.json();
        if (sheltersData.success) {
          setShelters(sheltersData.data);
        }
      } catch (error) {
        console.warn('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extract unique values for filters
  const districts = [...new Set(shelters.map(s => s.district).filter(Boolean))].sort() as string[];
  const subdistricts = [...new Set(shelters.filter(s => !selectedDistrict || s.district === selectedDistrict).map(s => s.subdistrict).filter(Boolean))].sort() as string[];
  const types = [...new Set(shelters.map(s => s.shelterType).filter(Boolean))].sort() as string[];
  const statuses = [...new Set(shelters.map(s => s.capacityStatus).filter(Boolean))].sort() as string[];

  // Filter and Paginate Shelters
  const filteredShelters = shelters.filter(s => {
    const matchesSearch = !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = !selectedDistrict || s.district === selectedDistrict;
    const matchesSubdistrict = !selectedSubdistrict || s.subdistrict === selectedSubdistrict;
    const matchesType = !selectedType || s.shelterType === selectedType;
    const matchesStatus = !selectedStatus || s.capacityStatus === selectedStatus;

    return matchesSearch && matchesDistrict && matchesSubdistrict && matchesType && matchesStatus;
  });

  const isFiltered = !!(searchQuery || selectedDistrict || selectedSubdistrict || selectedType || selectedStatus);

  const totalPages = Math.ceil(filteredShelters.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredShelters.slice(indexOfFirstRecord, indexOfLastRecord);

  const handleCreateRequest = (shelterId: string) => {
    setSelectedShelterId(shelterId);
    setShowRequestModal(true);
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

                  // Map specific colors to categories for consistency and variety
                  const categoryColorMap: any = {
                    'อาหาร': 'green',
                    'ยาและเวชภัณฑ์': 'orange',
                    'เครื่องนุ่งห่ม': 'pink',
                    'น้ำดื่ม': 'indigo',
                    'อื่นๆ': 'gray'
                  };

                  const color = categoryColorMap[name] || 'cyan';
                  const progress = (totalQty / 50000) * 100;

                  return (
                    <div key={name} className="col">
                      <StatCard
                        title={name}
                        value={totalQty.toLocaleString()}
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
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4" style={{ color: '#111827', fontSize: '18px' }}>ค้นหาศูนย์พักพิง</h5>

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
                          <div className="text-muted fw-500">กรุณาพิมพ์ชื่อหรือเลือกตัวกรองเพื่อเรียกดูข้อมูลศูนย์พักพิง</div>
                        </td>
                      </tr>
                    ) : currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-5 text-muted">ไม่พบข้อมูลศูนย์พักพิงที่ตรงตามเงื่อนไข</td>
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
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
                  <div className="text-muted small order-2 order-md-1">
                    แสดง <span className="fw-bold" style={{ color: '#374151' }}>{indexOfFirstRecord + 1}</span> ถึง{' '}
                    <span className="fw-bold" style={{ color: '#374151' }}>{Math.min(indexOfLastRecord, filteredShelters.length)}</span> จาก{' '}
                    <span className="fw-bold" style={{ color: '#374151' }}>{filteredShelters.length}</span> รายการ
                  </div>
                  <nav className="order-1 order-md-2">
                    <ul className="pagination pagination-sm mb-0 gap-1">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link border-0 rounded-2 px-3 py-2"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          style={{ color: '#4b5563', background: '#f3f4f6' }}
                        >
                          ก่อนหน้า
                        </button>
                      </li>

                      {/* Page Numbers with Ellipsis */}
                      {(() => {
                        const pages = [];
                        const maxVisible = 5;
                        let start = Math.max(1, currentPage - 2);
                        let end = Math.min(totalPages, start + maxVisible - 1);

                        if (end - start < maxVisible - 1) {
                          start = Math.max(1, end - maxVisible + 1);
                        }

                        if (start > 1) {
                          pages.push(
                            <li key={1} className="page-item">
                              <button className="page-link border-0 rounded-2 px-3 py-2" onClick={() => setCurrentPage(1)} style={{ color: '#4b5563' }}>1</button>
                            </li>
                          );
                          if (start > 2) pages.push(<li key="e1" className="page-item disabled"><span className="page-link border-0">...</span></li>);
                        }

                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                              <button
                                className="page-link border-0 rounded-2 px-3 py-2"
                                onClick={() => setCurrentPage(i)}
                                style={currentPage === i ? { backgroundColor: '#2563eb', color: '#fff', fontWeight: 600 } : { color: '#4b5563' }}
                              >
                                {i}
                              </button>
                            </li>
                          );
                        }

                        if (end < totalPages) {
                          if (end < totalPages - 1) pages.push(<li key="e2" className="page-item disabled"><span className="page-link border-0">...</span></li>);
                          pages.push(
                            <li key={totalPages} className="page-item">
                              <button className="page-link border-0 rounded-2 px-3 py-2" onClick={() => setCurrentPage(totalPages)} style={{ color: '#4b5563' }}>{totalPages}</button>
                            </li>
                          );
                        }
                        return pages;
                      })()}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link border-0 rounded-2 px-3 py-2"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          style={{ color: '#4b5563', background: '#f3f4f6' }}
                        >
                          ถัดไป
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRequestModal && (
        <CreateRequestModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            // Optional: refresh dashboard data if needed
          }}
          initialShelterId={selectedShelterId}
        />
      )}
    </div>
  );
}
