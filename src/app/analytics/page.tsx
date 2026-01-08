'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/charts/ChartCard';
import EmptyChartState from '@/components/charts/EmptyChartState';
import DateRangePicker from './DateRangePicker';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

const COLORS = {
  primary: '#6366f1',
  secondary: '#818cf8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  cyan: '#00d4ff',
  purple: '#c084fc',
  pink: '#ec4899',
  gray: '#9ca3af',
};

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  const [chartData, setChartData] = useState<any>({
    baseStats: null,
    requestsTrend: [],
    topItems: [],
    inventoryTurnover: [],
    requestsByLocation: [],
    inventoryActivity: [],
    responseTimes: [],
  });

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const [
          baseStats,
          requestsTrend,
          topItems,
          inventoryTurnover,
          requestsByLocation,
          inventoryActivity,
          responseTimes,
        ] = await Promise.all([
          fetch('/api/dashboard/stats').then((r) => r.json()),
          fetch(`/api/analytics/requests-trend?days=${selectedDays}`).then((r) => r.json()),
          fetch('/api/analytics/top-items?limit=10').then((r) => r.json()),
          fetch(`/api/analytics/inventory-turnover?days=${selectedDays}`).then((r) => r.json()),
          fetch('/api/analytics/requests-by-location').then((r) => r.json()),
          fetch('/api/analytics/inventory-activity?days=14').then((r) => r.json()),
          fetch('/api/analytics/response-times?days=30&groupBy=week').then((r) => r.json()),
        ]);

        setChartData({
          baseStats: baseStats.success ? baseStats.data : null,
          requestsTrend: requestsTrend.success ? requestsTrend.data : [],
          topItems: topItems.success ? topItems.data : [],
          inventoryTurnover: inventoryTurnover.success ? inventoryTurnover.data : [],
          requestsByLocation: requestsByLocation.success ? requestsByLocation.data : [],
          inventoryActivity: inventoryActivity.success ? inventoryActivity.data : [],
          responseTimes: responseTimes.success ? responseTimes.data : [],
        });
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedDays]);

  // Prepare data for Chart 1: Inventory by Category
  const inventoryByCategory = chartData.baseStats?.inventory?.byCategory
    ? Object.entries(chartData.baseStats.inventory.byCategory).map(([name, data]: [string, any]) => ({
        category: name,
        total: data.totalQuantity,
        reserved: data.totalReservedQuantity,
        available: data.totalQuantity - data.totalReservedQuantity,
      }))
    : [];

  // Prepare data for Chart 2: Request Status Breakdown
  const statusData = chartData.baseStats?.distribution?.byStatus
    ? Object.entries(chartData.baseStats.distribution.byStatus).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  const statusColors: any = {
    'รอดำเนินการ': COLORS.warning,
    'อนุมัติแล้ว': COLORS.info,
    'กำลังจัดส่ง': COLORS.primary,
    'ส่งมอบแล้ว': COLORS.success,
    'ยกเลิกแล้ว': COLORS.danger,
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                fontSize: '12px',
                color: entry.color,
                margin: '4px 0',
                fontWeight: 500,
              }}
            >
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-grow-1 d-flex flex-column">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div
          className="flex-grow-1 overflow-y-auto p-4"
          style={{ paddingTop: '30px', paddingBottom: '30px', backgroundColor: '#f8f9fa' }}
        >
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: '#111827' }}>
                รายงานและสถิติ
              </h4>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                วิเคราะห์ข้อมูลและติดตามประสิทธิภาพการจัดการคลังสินค้า
              </p>
            </div>
            <DateRangePicker onDaysChange={setSelectedDays} selectedDays={selectedDays} />
          </div>

          {/* Summary Cards */}
          <div className="mb-4">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="คำขอทั้งหมด"
                  value={loading ? '...' : (chartData.baseStats?.distribution?.totalRequests || 0).toLocaleString()}
                  color="blue"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="จำนวนพัสดุคงคลัง"
                  value={loading ? '...' : (chartData.baseStats?.inventory?.totalQuantity || 0).toLocaleString()}
                  color="cyan"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="คำขอรอดำเนินการ"
                  value={loading ? '...' : (chartData.baseStats?.distribution?.pendingCount || 0).toLocaleString()}
                  color="orange"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="ศูนย์พักพิงทั้งหมด"
                  value={loading ? '...' : (chartData.baseStats?.shelters?.totalShelters || 0).toLocaleString()}
                  color="purple"
                />
              </div>
            </div>
          </div>

          {/* Primary Charts Grid (2x2) */}
          <div className="row g-4 mb-4">
            {/* Chart 1: Inventory by Category */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="ยอดคงคลังแยกตามหมวดหมู่"
                subtitle="จำนวนสินค้าทั้งหมดเทียบกับยอดที่จองแล้ว"
                loading={loading}
                height={400}
              >
                {inventoryByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={{ stroke: '#e5e7eb' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                      <Bar dataKey="total" fill={COLORS.info} name="ยอดรวม" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="reserved" fill={COLORS.warning} name="จองแล้ว" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลคงคลัง" />
                )}
              </ChartCard>
            </div>

            {/* Chart 2: Request Status Breakdown */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="สัดส่วนคำขอแยกตามสถานะ"
                subtitle="ภาพรวมสถานะคำขอเบิกสิ่งของ"
                loading={loading}
                height={400}
              >
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                      >
                        {statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS.gray} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลคำขอ" />
                )}
              </ChartCard>
            </div>

            {/* Chart 3: Requests Trend */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title={`แนวโน้มคำขอเบิก ${selectedDays} วันย้อนหลัง`}
                subtitle="จำนวนคำขอเบิกแยกตามระดับความเร่งด่วน"
                loading={loading}
                height={400}
              >
                {chartData.requestsTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.requestsTrend}>
                      <defs>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={{ stroke: '#e5e7eb' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                      <Area
                        type="monotone"
                        dataKey="high"
                        stackId="1"
                        stroke={COLORS.danger}
                        fill="url(#colorHigh)"
                        name="เร่งด่วนสูง"
                      />
                      <Area
                        type="monotone"
                        dataKey="medium"
                        stackId="1"
                        stroke={COLORS.warning}
                        fill="url(#colorMedium)"
                        name="เร่งด่วนกลาง"
                      />
                      <Area
                        type="monotone"
                        dataKey="low"
                        stackId="1"
                        stroke={COLORS.success}
                        fill="url(#colorLow)"
                        name="เร่งด่วนต่ำ"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลแนวโน้มคำขอ" />
                )}
              </ChartCard>
            </div>

            {/* Chart 4: Top Items */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="Top 10 สินค้าที่ถูกขอมากที่สุด"
                subtitle="รายการสินค้าที่มีความต้องการสูง"
                loading={loading}
                height={400}
              >
                {chartData.topItems.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.topItems} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <YAxis
                        dataKey="itemName"
                        type="category"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="totalRequested" fill={COLORS.primary} name="จำนวนที่ขอ" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลสินค้าที่ถูกขอ" />
                )}
              </ChartCard>
            </div>
          </div>

          {/* Secondary Charts Row */}
          <div className="row g-4 mb-4">
            {/* Chart 5: Inventory Turnover */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="อัตราการหมุนเวียนสินค้าคงคลัง"
                subtitle="ติดตามประสิทธิภาพการจัดสรรสินค้า"
                loading={loading}
                height={350}
              >
                {chartData.inventoryTurnover.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.inventoryTurnover}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                      <ReferenceLine y={80} stroke={COLORS.gray} strokeDasharray="5 5" label="เป้าหมาย 80%" />
                      <Line
                        type="monotone"
                        dataKey="turnoverRate"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        name="อัตราหมุนเวียน"
                        dot={{ fill: COLORS.primary, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลการหมุนเวียน" />
                )}
              </ChartCard>
            </div>

            {/* Chart 6: Requests by Location */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="จำนวนคำขอแยกตามอำเภอ"
                subtitle="ระบุพื้นที่ที่มีความต้องการสูง"
                loading={loading}
                height={350}
              >
                {chartData.requestsByLocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.requestsByLocation.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="district" tick={{ fill: '#6b7280', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="totalRequests" fill={COLORS.primary} name="จำนวนคำขอ" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลพื้นที่" />
                )}
              </ChartCard>
            </div>

            {/* Chart 7: Inventory Activity */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="กิจกรรมคลังสินค้า 14 วันย้อนหลัง"
                subtitle="ติดตามการเคลื่อนไหวของสินค้าในคลัง"
                loading={loading}
                height={350}
              >
                {chartData.inventoryActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.inventoryActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                      <Area
                        type="monotone"
                        dataKey="RESERVE"
                        stackId="1"
                        stroke={COLORS.warning}
                        fill={COLORS.warning}
                        fillOpacity={0.6}
                        name="จอง"
                      />
                      <Area
                        type="monotone"
                        dataKey="DEDUCT"
                        stackId="1"
                        stroke={COLORS.danger}
                        fill={COLORS.danger}
                        fillOpacity={0.6}
                        name="เบิก"
                      />
                      <Area
                        type="monotone"
                        dataKey="RESTORE"
                        stackId="1"
                        stroke={COLORS.success}
                        fill={COLORS.success}
                        fillOpacity={0.6}
                        name="คืน"
                      />
                      <Area
                        type="monotone"
                        dataKey="MANUAL"
                        stackId="1"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.6}
                        name="เติมสต็อก"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลกิจกรรมคลัง" />
                )}
              </ChartCard>
            </div>

            {/* Chart 8: Response Times */}
            <div className="col-12 col-lg-6">
              <ChartCard
                title="เวลาตอบสนองคำขอเฉลี่ย"
                subtitle="ติดตามประสิทธิภาพการอนุมัติคำขอ (รายสัปดาห์)"
                loading={loading}
                height={350}
              >
                {chartData.responseTimes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.responseTimes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="period"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} label={{ value: 'ชม.', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                      <ReferenceLine yAxisId="left" y={24} stroke={COLORS.gray} strokeDasharray="5 5" label="เป้าหมาย 24 ชม." />
                      <Bar yAxisId="right" dataKey="requestCount" fill={COLORS.primary} fillOpacity={0.3} name="จำนวนคำขอ" radius={[8, 8, 0, 0]} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="avgResponseHours"
                        stroke={COLORS.pink}
                        strokeWidth={2}
                        name="เวลาเฉลี่ย (ชม.)"
                        dot={{ fill: COLORS.pink, r: 5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="ไม่มีข้อมูลเวลาตอบสนอง" />
                )}
              </ChartCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
