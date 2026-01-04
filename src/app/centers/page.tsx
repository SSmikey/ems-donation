'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shelter } from '@/lib/models/shelter';
import ShelterModal from './ShelterModal';

export default function CentersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [filteredShelters, setFilteredShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterName, setFilterName] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterSubdistrict, setFilterSubdistrict] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toastMessage, setToastMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [errorInfo, setErrorInfo] = useState<any>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ shelterName: string; shelterId: string } | null>(null);

    const fetchShelters = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/shelters');
            const result = await res.json();

            if (result.data && Array.isArray(result.data)) {
                setShelters(result.data);
                setFilteredShelters(result.data);
            } else if (Array.isArray(result)) {
                setShelters(result);
                setFilteredShelters(result);
            } else if (result.error) {
                setErrorInfo(result);
            }
        } catch (error) {
            console.error('Error fetching shelters:', error);
            setErrorInfo({ error: 'Failed to connect to API', details: String(error) });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchShelters();
    }, []);

    useEffect(() => {
        const results = shelters.filter(s => {
            const matchName = !filterName || s.name.toLowerCase().includes(filterName.toLowerCase());
            const matchDistrict = !filterDistrict || s.district?.toLowerCase().includes(filterDistrict.toLowerCase());
            const matchSubdistrict = !filterSubdistrict || s.subdistrict?.toLowerCase().includes(filterSubdistrict.toLowerCase());
            const matchType = !filterType || s.shelterType === filterType;
            const matchStatus = filterStatus === 'all' || s.capacityStatus === filterStatus;
            return matchName && matchDistrict && matchSubdistrict && matchType && matchStatus;
        });
        setFilteredShelters(results);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus, shelters]);

    const handleDelete = async (id: string, name: string) => {
        setConfirmDialog({ shelterName: name, shelterId: id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog) return;

        try {
            const res = await fetch(`/api/shelters`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: confirmDialog.shelterId })
            });

            if (res.ok) {
                setToastMessage({ message: 'ลบศูนย์พักพิงสำเร็จ', type: 'success' });
                fetchShelters();
            } else {
                const data = await res.json();
                setToastMessage({ message: data.error || 'ลบไม่สำเร็จ', type: 'error' });
            }
        } catch (error) {
            setToastMessage({ message: 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
        } finally {
            setConfirmDialog(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'รองรับได้': return 'bg-green-100 text-green-800';
            case 'ใกล้เต็ม': return 'bg-amber-100 text-amber-800';
            case 'เต็มแล้ว': return 'bg-red-100 text-red-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'รองรับได้': return '✓';
            case 'ใกล้เต็ม': return '⚠';
            case 'เต็มแล้ว': return '✕';
            default: return '●';
        }
    };

    const uniqueDistricts = Array.from(new Set(shelters.map(s => s.district).filter(Boolean))).sort();
    const uniqueSubdistricts = Array.from(new Set(
        shelters
            .filter(s => !filterDistrict || s.district === filterDistrict)
            .map(s => s.subdistrict)
            .filter(Boolean)
    )).sort();
    const uniqueTypes = Array.from(new Set(shelters.map(s => s.shelterType).filter(Boolean))).sort();

    // Pagination logic
    const totalPages = Math.ceil(filteredShelters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedShelters = filteredShelters.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterName, filterDistrict, filterSubdistrict, filterType, filterStatus]);

    const readyShelters = shelters.filter(s => s.capacityStatus === 'รองรับได้').length;
    const almostFullShelters = shelters.filter(s => s.capacityStatus === 'ใกล้เต็ม').length;
    const fullShelters = shelters.filter(s => s.capacityStatus === 'เต็มแล้ว').length;

    return (
        <div className="flex h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Page Header */}
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">จัดการศูนย์พักพิง</h1>
                            <p className="text-muted-foreground mt-1">ดูแลและจัดการข้อมูลศูนย์พักพิงและสถานะสิ่งอำนวยความสะดวก</p>
                        </div>
                        <Button onClick={() => {
                            setEditingShelter(null);
                            setIsModalOpen(true);
                        }}>
                            + เพิ่มศูนย์พักพิงใหม่
                        </Button>
                    </div>

                    {/* Capacity Status Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">พร้อมรองรับ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{readyShelters}</div>
                                <p className="text-xs text-muted-foreground mt-1">ศูนย์พักพิง</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">ใกล้เต็ม</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">{almostFullShelters}</div>
                                <p className="text-xs text-muted-foreground mt-1">ศูนย์พักพิง</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">เต็มแล้ว</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{fullShelters}</div>
                                <p className="text-xs text-muted-foreground mt-1">ศูนย์พักพิง</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="flex gap-3 flex-wrap">
                            <div className="flex-1 min-w-64">
                                <Input
                                    placeholder="ค้นหาชื่อศูนย์พักพิง..."
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                />
                            </div>
                            <select
                                value={filterDistrict}
                                onChange={(e) => setFilterDistrict(e.target.value)}
                                className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="">อำเภอทั้งหมด</option>
                                {uniqueDistricts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            <select
                                value={filterSubdistrict}
                                onChange={(e) => setFilterSubdistrict(e.target.value)}
                                disabled={!filterDistrict}
                                className="px-3 py-2 rounded-md border border-input bg-background text-foreground disabled:opacity-50"
                            >
                                <option value="">ตำบลทั้งหมด</option>
                                {uniqueSubdistricts.map(subdistrict => (
                                    <option key={subdistrict} value={subdistrict}>{subdistrict}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="">ประเภททั้งหมด</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="all">สถานะทั้งหมด</option>
                                <option value="รองรับได้">พร้อมรองรับ</option>
                                <option value="ใกล้เต็ม">ใกล้เต็ม</option>
                                <option value="เต็มแล้ว">เต็มแล้ว</option>
                            </select>
                        </div>
                    </div>

                    {/* Centers Table */}
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    กำลังโหลดข้อมูลศูนย์พักพิง...
                                </div>
                            ) : filteredShelters.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    ไม่พบข้อมูลศูนย์พักพิง
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ชื่อศูนย์พักพิง</TableHead>
                                                <TableHead>ตำบล/อำเภอ</TableHead>
                                                <TableHead>ประเภท</TableHead>
                                                <TableHead>เบอร์โทร</TableHead>
                                                <TableHead>ผู้ดูแล</TableHead>
                                                <TableHead>สถานะความจุ</TableHead>
                                                <TableHead className="text-right">การจัดการ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedShelters.map((s) => (
                                                <TableRow key={s._id}>
                                                    <TableCell className="font-medium">{s.name}</TableCell>
                                                    <TableCell className="text-sm">
                                                        ต.{s.subdistrict} อ.{s.district}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{s.shelterType}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{s.phoneNumbers?.[0] || '-'}</TableCell>
                                                    <TableCell className="text-sm">{s.responsible?.[0]?.firstName || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(s.capacityStatus || '')}>
                                                            {getStatusIcon(s.capacityStatus || '')} {s.capacityStatus || 'ปกติ'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingShelter(s);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            แก้ไข
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => s._id && handleDelete(s._id, s.name)}
                                                            className="text-destructive"
                                                        >
                                                            ลบ
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {filteredShelters.length > itemsPerPage && (
                                        <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                            >
                                                ⇤
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                ←
                                            </Button>
                                            <span className="text-sm text-muted-foreground px-4">
                                                หน้า {currentPage} / {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            >
                                                →
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                            >
                                                ⇥
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <ShelterModal
                    shelter={editingShelter}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setToastMessage({ message: editingShelter ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มศูนย์พักพิงสำเร็จ', type: 'success' });
                        fetchShelters();
                    }}
                />
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg text-white max-w-sm z-50 transition-all ${
                    toastMessage.type === 'success'
                        ? 'bg-green-500 dark:bg-green-600'
                        : 'bg-red-500 dark:bg-red-600'
                }`}>
                    <p className="text-sm font-medium">{toastMessage.message}</p>
                    <button
                        onClick={() => setToastMessage(null)}
                        className="absolute top-2 right-2 text-white/70 hover:text-white text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>ยืนยันการลบ</CardTitle>
                            <CardDescription>
                                คุณต้องการลบศูนย์พักพิง "{confirmDialog.shelterName}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                                ยกเลิก
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                ลบ
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
