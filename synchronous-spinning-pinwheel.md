# แผนการปรับปรุง UX/UI Flow สำหรับระบบจัดการทรัพยากรบริจาคศูนย์พักพิง

## 🎯 วัตถุประสงค์
ปรับปรุง UX/UI Flow การใช้งานเกือบทั้งหมดตามเอกสาร MODIFY_WEB.md ให้สอดคล้องกับเป้าหมาย: **ให้ผู้ใช้งานสามารถดำเนินการได้ภายใน 2-3 คลิก**

---

## 📊 การวิเคราะห์ระบบปัจจุบัน

### 1. โครงสร้างโปรเจค

**Technology Stack:**
- ✅ Next.js 16.1.0 (App Router)
- ✅ React 19.2.3 + TypeScript
- ⚠️ CSS Modules (แผนแนะนำ Tailwind CSS)
- ✅ MongoDB (แผนแนะนำ MySQL + Prisma)
- ❌ ไม่มี shadcn/ui, React Hook Form, Zod, Zustand

**หน้าจอที่มีอยู่:**
- ✅ Dashboard ([src/app/dashboard/page.tsx](src/app/dashboard/page.tsx))
- ✅ จัดการศูนย์พักพิง ([src/app/centers/page.tsx](src/app/centers/page.tsx))
- ✅ คลังสินค้าส่วนกลาง ([src/app/warehouse/page.tsx](src/app/warehouse/page.tsx))
- ✅ สร้างคำขอเบิก ([src/app/create-request/page.tsx](src/app/create-request/page.tsx))
- ✅ รายการคำขอเบิก ([src/app/distribution/page.tsx](src/app/distribution/page.tsx))
- ✅ บันทึกของเข้าด่วน ([src/app/quick-donation/page.tsx](src/app/quick-donation/page.tsx))
- ✅ จัดการผู้ใช้งาน ([src/app/users/page.tsx](src/app/users/page.tsx))

### 2. ปัญหา UX/UI ที่พบ (เทียบกับเป้าหมาย 2-3 คลิก)

| Task | คลิกปัจจุบัน | เป้าหมาย | ปัญหา |
|------|--------------|----------|-------|
| **สร้างคำขอเบิก** | 8-15+ คลิก | 3-5 คลิก | ต้องเลือกสินค้าทีละรายการ, มี 2 entry points ซ้ำซ้อน |
| **บันทึกของเข้าด่วน** | 5 คลิก | 2-3 คลิก | ยังไม่ "quick" พอ, ต้องเลือก category ก่อน |
| **อนุมัติคำขอ** | 4-5 คลิก | 2-3 คลิก | มี filter ที่ไม่จำเป็น |
| **เพิ่มสินค้า** | 6-7 คลิก | 3-4 คลิก | Modal มีฟิลด์เยอะ |

### 3. ฟีเจอร์สำคัญที่ยังขาด (ตาม MODIFY_WEB.md)

**🔴 Critical:**
- ❌ Reserved Stock System (reserve → release → deduct)
- ❌ Stock Transactions History
- ❌ Cancel Request with Stock Release
- ❌ Center Items Management

**🟡 Important:**
- ❌ Request Timeline/History
- ❌ Request Number Generation (R2501030001)
- ❌ Complete Request Status Workflow

---

## 🎨 แผนการปรับปรุงแบบครอบคลุม

จากคำตอบของคุณ จะทำการปรับปรุงทุกด้านพร้อมกัน:
- ✅ ปรับปรุง UX/UI ให้ใช้งานง่ายขึ้น (ลดจำนวนคลิก)
- ✅ เพิ่มฟีเจอร์สำคัญที่ขาด (Reserved Stock, Stock Transactions)
- ✅ Migrate ไป Tailwind CSS + shadcn/ui
- ✅ ปรับปรุง Navigation และ Information Architecture
- ✅ เก็บ MongoDB แต่ปรับ schema ใหม่

---

## 📝 แผนการดำเนินงาน

### Phase 1: Foundation & Setup (สัปดาห์ที่ 1-2)

#### 1.1 Migrate Design System
**ไฟล์ที่ต้องแก้:**
- `package.json` - เพิ่ม Tailwind CSS, shadcn/ui dependencies
- `tailwind.config.ts` - ตั้งค่า Tailwind
- `src/app/globals.css` - เพิ่ม Tailwind directives
- สร้าง `src/components/ui/` - shadcn/ui components (button, dialog, input, table, etc.)
- สร้าง `src/lib/utils.ts` - cn() helper function

**Actions:**
- Install: `tailwindcss`, `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`
- Install shadcn/ui components: button, card, dialog, input, label, select, table, toast, etc.
- Remove CSS Modules ทีละหน้า

#### 1.2 ปรับปรุง Database Schema (MongoDB)
**Collections ที่ต้องปรับ/เพิ่ม:**

**1. Inventory (ปรับปรุง):**
```typescript
interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;                    // total_quantity
  reservedQuantity: number;            // 🆕 NEW
  availableQuantity: number;           // 🆕 computed: quantity - reservedQuantity
  unit: string;
  minThreshold: number;                // 🆕 NEW
  lastUpdated: Date;
  lastUpdatedBy: string;               // 🆕 NEW
}
```

**2. DistributionRequests (ปรับปรุง):**
```typescript
interface DistributionRequest {
  _id: string;
  requestNo: string;                   // 🆕 NEW: R2501030001
  shelterId: string;
  items: {
    itemId: string;                    // 🆕 เปลี่ยนจาก itemName
    itemName: string;
    quantity: number;
    reservedAt: Date;                  // 🆕 NEW
    releasedAt?: Date;                 // 🆕 NEW
    deductedAt?: Date;                 // 🆕 NEW
  }[];
  status: 'pending' | 'approved' | 'shipping' | 'completed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high';
  requestBy: string;
  approvedBy?: string;
  approvedAt?: Date;                   // 🆕 NEW
  shippedBy?: string;                  // 🆕 NEW
  shippedAt?: Date;                    // 🆕 NEW
  completedBy?: string;                // 🆕 NEW
  completedAt?: Date;                  // 🆕 NEW
  cancelledBy?: string;                // 🆕 NEW
  cancelledAt?: Date;                  // 🆕 NEW
  cancelReason?: string;               // 🆕 NEW
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**3. StockTransactions (สร้างใหม่):** 🆕
```typescript
interface StockTransaction {
  _id: string;
  itemId: string;
  transactionType: 'receive' | 'reserve' | 'release' | 'deduct' | 'adjust';
  quantity: number;
  referenceType: 'donation' | 'request' | 'adjustment';
  referenceId?: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}
```

**4. RequestTimeline (สร้างใหม่):** 🆕
```typescript
interface RequestTimeline {
  _id: string;
  requestId: string;
  status: string;
  note?: string;
  createdBy: string;
  createdAt: Date;
}
```

**5. CenterItems (สร้างใหม่):** 🆕
```typescript
interface CenterItem {
  _id: string;
  centerId: string;
  itemId: string;
  currentQuantity: number;
  requiredQuantity: number;
  status: 'normal' | 'warning' | 'critical' | 'excess';
  lastUpdatedBy: string;
  updatedAt: Date;
}
```

**Migration Script:**
- สร้าง `scripts/migrate-database.ts` เพื่อเพิ่มฟิลด์ใหม่ใน collections เดิม
- สร้าง collections ใหม่

---

### Phase 2: Core Business Logic (สัปดาห์ที่ 2-3)

#### 2.1 Reserved Stock System
**ไฟล์ใหม่:**
- `src/services/stockService.ts` - Stock management business logic
- `src/lib/models/StockTransaction.ts` - StockTransaction model
- `src/app/api/stock/reserve/route.ts` - API reserve stock
- `src/app/api/stock/release/route.ts` - API release stock
- `src/app/api/stock/deduct/route.ts` - API deduct stock
- `src/app/api/stock/transactions/route.ts` - API get transactions

**Logic:**
1. **Reserve Stock (เมื่อสร้างคำร้อง):**
   - ตรวจสอบ availableQuantity >= requested quantity
   - เพิ่ม reservedQuantity
   - สร้าง StockTransaction (type: reserve)
   - สร้าง RequestTimeline

2. **Release Stock (เมื่อยกเลิกคำร้อง):**
   - ลด reservedQuantity
   - สร้าง StockTransaction (type: release)
   - อัปเดต request.items[].releasedAt
   - สร้าง RequestTimeline

3. **Deduct Stock (เมื่อ complete คำร้อง):**
   - ลด quantity (total)
   - ลด reservedQuantity
   - เพิ่ม CenterItems.currentQuantity
   - สร้าง StockTransaction (type: deduct)
   - อัปเดต request.items[].deductedAt
   - สร้าง RequestTimeline

#### 2.2 Request Number Generation
**ไฟล์:**
- `src/lib/utils/requestNumberGenerator.ts`

**Logic:**
```typescript
// Generate: R2501030001 (R + yymmdd + sequential)
async function generateRequestNo(): Promise<string> {
  const today = new Date();
  const prefix = `R${today.getFullYear().toString().slice(2)}${
    (today.getMonth() + 1).toString().padStart(2, '0')
  }${today.getDate().toString().padStart(2, '0')}`;

  // Find last request of today
  const lastRequest = await DistributionRequest.findOne({
    requestNo: { $regex: `^${prefix}` }
  }).sort({ requestNo: -1 });

  const lastSeq = lastRequest
    ? parseInt(lastRequest.requestNo.slice(-4))
    : 0;

  return `${prefix}${(lastSeq + 1).toString().padStart(4, '0')}`;
}
```

#### 2.3 Update API Routes
**ไฟล์ที่ต้องแก้:**
- `src/app/api/distribution-requests/route.ts` - เพิ่ม reserve stock logic
- สร้าง `src/app/api/distribution-requests/[id]/cancel/route.ts` - Cancel + Release
- สร้าง `src/app/api/distribution-requests/[id]/ship/route.ts` - Ship
- สร้าง `src/app/api/distribution-requests/[id]/complete/route.ts` - Complete + Deduct
- สร้าง `src/app/api/distribution-requests/[id]/timeline/route.ts` - Get timeline

---

### Phase 3: UX/UI Improvements (สัปดาห์ที่ 3-5)

#### 3.1 ปรับปรุง Navigation
**ไฟล์:**
- `src/components/Sidebar.tsx` - ปรับโครงสร้างเมนูใหม่

**เมนูใหม่:**
```
ems-donation
├── 📊 Dashboard
├── 📦 คลังสินค้า
│   ├── ดูสต็อก (warehouse page)
│   └── บันทึกของเข้า (quick-donation - หรือรวมเป็น modal)
├── 🚚 คำขอเบิก
│   └── รวม create + list ในหน้าเดียว
├── 🏠 ศูนย์พักพิง
└── 👥 จัดการผู้ใช้ (Admin only)
```

**Actions:**
- ลบหน้า `/create-request` - รวมเข้า `/distribution`
- Quick Donation อาจเป็น floating button หรือ modal

#### 3.2 ปรับปรุง Distribution Page (Priority 1: ลด 8-15 คลิก → 3-5 คลิก)
**ไฟล์:**
- `src/app/distribution/page.tsx` - เพิ่ม floating action button "+ สร้างคำขอ"
- `src/app/distribution/CreateRequestModal.tsx` - ปรับปรุงใหญ่

**การปรับปรุง CreateRequestModal:**
1. **Multi-select Items:**
   - แสดงสินค้าทั้งหมดเป็น checkbox list
   - กรอกจำนวนได้ทันทีข้างๆ checkbox
   - แสดง available quantity แบบ real-time

2. **Quick Templates:** 🆕
   - "ชุดเร่งด่วน" (น้ำ + อาหาร + ยา)
   - "ชุดพื้นฐาน" (ข้าว + น้ำ + ผ้าห่ม)
   - บันทึก template ที่ใช้บ่อย

3. **Smart Suggestions:** 🆕
   - แสดงรายการที่ศูนย์นี้ขอบ่อย
   - แนะนำจำนวนตาม shortage ของศูนย์

4. **Single Step Form:**
   - ไม่ต้อง pagination
   - ทุกอย่างอยู่ในหน้าเดียว
   - Auto-save draft

**Flow ใหม่:**
```
1. คลิก "+ สร้างคำขอ" (1 คลิก)
2. เลือกศูนย์ (autocomplete) (1 คลิก)
3. เลือกหลายรายการพร้อมกัน + จำนวน (1-2 คลิก)
4. คลิก "ยืนยัน" (1 คลิก)
รวม: 4-5 คลิก
```

#### 3.3 ปรับปรุง Quick Donation (Priority 2: ลด 5 คลิก → 2-3 คลิก)
**ไฟล์:**
- `src/app/quick-donation/page.tsx` - อาจเปลี่ยนเป็น modal/drawer
- หรือสร้าง `src/components/QuickDonationWidget.tsx` - Floating widget

**การปรับปรุง:**
1. **Auto-complete Item Name:**
   - พิมพ์ชื่อ → แนะนำ items ที่มี
   - เลือกจาก dropdown → auto-fill category + unit

2. **Smart Defaults:**
   - จำ category ล่าสุด
   - จำ unit ตาม item

3. **Batch Input:** 🆕
   - เพิ่มได้หลายรายการก่อน submit
   - Submit 1 ครั้ง

**Flow ใหม่:**
```
1. กด Ctrl+D หรือคลิก floating button (1 คลิก)
2. พิมพ์ชื่อ + เลือก autocomplete (1 คลิก)
3. กรอกจำนวน + Enter (1 คลิก)
รวม: 3 คลิก
```

#### 3.4 เพิ่ม Components ใหม่

**3.4.1 CancelRequestModal** 🆕
- `src/components/requests/CancelRequestModal.tsx`
- เลือกเหตุผล (preset + custom)
- แสดงข้อมูลสต็อกที่จะถูกคืน
- Confirm dialog

**3.4.2 RequestDetailModal** 🆕
- `src/components/requests/RequestDetailModal.tsx`
- แสดงรายละเอียดคำร้อง
- แสดง Timeline
- Actions: Approve, Ship, Complete, Cancel (ตาม status)

**3.4.3 RequestTimeline** 🆕
- `src/components/requests/RequestTimeline.tsx`
- แสดงประวัติทุกขั้นตอน
- Vertical timeline UI

**3.4.4 ReservedStockModal** 🆕
- `src/components/stock/ReservedStockModal.tsx`
- แสดงรายการสต็อกที่ถูกจองทั้งหมด
- Group by request
- สามารถคลิกไปดู request detail

**3.4.5 StockTransactionHistory** 🆕
- `src/components/stock/StockTransactionHistory.tsx`
- แสดงประวัติการเคลื่อนไหวสต็อก
- Filter by date, type, item
- Export to CSV

**3.4.6 CriticalAlerts** 🆕
- `src/components/dashboard/CriticalAlerts.tsx`
- แสดงศูนย์วิกฤต
- แสดงสินค้าใกล้หมด
- Quick action: สร้างคำขอทันที

#### 3.5 ปรับปรุงหน้าอื่นๆ

**Dashboard:**
- `src/app/dashboard/page.tsx`
- เพิ่ม CriticalAlerts component
- เพิ่ม Quick Actions (สร้างคำขอด่วน, บันทึกของเข้า)
- แสดง Reserved vs Available stock

**Warehouse:**
- `src/app/warehouse/page.tsx`
- แสดง Total / Reserved / Available แยกชัด
- เพิ่มปุ่ม "ดูสต็อกที่จอง"
- เพิ่มปุ่ม "ประวัติการเคลื่อนไหว"

**Centers:**
- `src/app/centers/page.tsx`
- เพิ่มคอลัมน์ "ทรัพยากร" (normal/warning/critical count)
- คลิกดูรายละเอียดทรัพยากรแต่ละศูนย์
- Quick action: สร้างคำขอให้ศูนย์นี้

---

### Phase 4: Advanced Features (สัปดาห์ที่ 5-6)

#### 4.1 Keyboard Shortcuts
**ไฟล์:**
- `src/hooks/useKeyboardShortcuts.ts`

**Shortcuts:**
- `Ctrl/Cmd + K` - Global search
- `Ctrl/Cmd + N` - New request
- `Ctrl/Cmd + D` - Quick donation
- `Esc` - Close modal
- `/` - Focus search

#### 4.2 Filter Persistence
**ไฟล์:**
- `src/hooks/useFilterState.ts`
- `src/lib/utils/localStorage.ts`

**Features:**
- บันทึก filter preferences
- Remember pagination
- Sync across tabs

#### 4.3 Bulk Actions
**Features:**
- Approve หลายคำขอพร้อมกัน
- Export หลายรายการ

#### 4.4 Auto-complete & Smart Suggestions
**ไฟล์:**
- `src/components/ui/autocomplete.tsx`
- `src/hooks/useSuggestions.ts`

**Features:**
- Suggest based on history
- Fuzzy search
- Recent items

---

## 📂 ไฟล์ที่ต้องสร้างใหม่/แก้ไข

### ต้องสร้างใหม่ (Critical):
1. `src/services/stockService.ts` - Stock business logic
2. `src/lib/models/StockTransaction.ts` - Model
3. `src/lib/models/RequestTimeline.ts` - Model
4. `src/lib/models/CenterItem.ts` - Model
5. `src/app/api/stock/reserve/route.ts` - API
6. `src/app/api/stock/release/route.ts` - API
7. `src/app/api/stock/deduct/route.ts` - API
8. `src/app/api/distribution-requests/[id]/cancel/route.ts` - API
9. `src/app/api/distribution-requests/[id]/ship/route.ts` - API
10. `src/app/api/distribution-requests/[id]/complete/route.ts` - API
11. `src/components/requests/CancelRequestModal.tsx` - Component
12. `src/components/requests/RequestDetailModal.tsx` - Component
13. `src/components/requests/RequestTimeline.tsx` - Component
14. `src/components/stock/ReservedStockModal.tsx` - Component
15. `src/components/stock/StockTransactionHistory.tsx` - Component

### ต้องแก้ไข (Critical):
1. `package.json` - Add Tailwind, shadcn/ui
2. `tailwind.config.ts` - Configure
3. `src/lib/models/Inventory.ts` - Add reserved fields
4. `src/lib/models/DistributionRequest.ts` - Add new fields
5. `src/app/api/distribution-requests/route.ts` - Add reserve logic
6. `src/app/distribution/page.tsx` - Merge with create-request
7. `src/app/distribution/CreateRequestModal.tsx` - Major refactor
8. `src/components/Sidebar.tsx` - New navigation
9. `src/app/dashboard/page.tsx` - Add quick actions
10. `src/app/warehouse/page.tsx` - Show reserved stock

### ลบได้:
1. `src/app/create-request/page.tsx` - รวมเข้า distribution แล้ว
2. CSS Modules files - เปลี่ยนเป็น Tailwind แล้ว

---

## ✅ Success Criteria

เมื่อเสร็จแล้วควรได้:

### UX/UI:
- ✅ สร้างคำขอเบิก: 4-5 คลิก (จาก 8-15 คลิก)
- ✅ บันทึกของเข้า: 2-3 คลิก (จาก 5 คลิก)
- ✅ อนุมัติคำขอ: 2 คลิก (จาก 4-5 คลิก)
- ✅ ใช้ Tailwind CSS + shadcn/ui ทั้งหมด
- ✅ Navigation ที่เรียบง่าย ไม่ซ้ำซ้อน

### Business Logic:
- ✅ Reserve Stock เมื่อสร้างคำร้อง
- ✅ Release Stock เมื่อยกเลิก
- ✅ Deduct Stock เมื่อ complete
- ✅ Stock Transactions ทุก action
- ✅ Request Timeline ทุก status change
- ✅ Request Number generation

### Features:
- ✅ Cancel Request พร้อมคืนสต็อก
- ✅ Reserved Stock view
- ✅ Stock Transaction History
- ✅ Request Timeline
- ✅ Critical Alerts
- ✅ Keyboard Shortcuts
- ✅ Filter Persistence
- ✅ Multi-select Items
- ✅ Templates

---

## 🚀 การดำเนินงานทีละขั้นตอน

เมื่อพร้อม implement จะทำตามลำดับ:

1. **Week 1:** Setup Tailwind + shadcn/ui
2. **Week 2:** Database migration + Stock service
3. **Week 3:** API routes (reserve, release, deduct, cancel)
4. **Week 4:** UI components (modals, timeline)
5. **Week 5:** Distribution page refactor
6. **Week 6:** Other pages + advanced features
7. **Week 7:** Testing + bug fixes
8. **Week 8:** Final polish + documentation
