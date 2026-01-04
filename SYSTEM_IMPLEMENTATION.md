# ระบบจองก่อนตัดทีหลัง (Reserve-Then-Cut Stock System)

## 📋 สรุปการพัฒนา

ระบบได้ถูกปรับปรุงจาก **"ตัดเมื่ออนุมัติ"** (Cut-on-Approval) เป็น **"จองก่อนตัดทีหลัง"** (Reserve-Then-Cut) เพื่อแก้ไขปัญหาการจัดการสต็อกที่ไม่มีประสิทธิภาพ

---

## 🎯 ปัญหาเดิมและวิธีแก้ไข

### ❌ ปัญหาเดิม
- **ไม่มีระบบจอง**: สต็อกไม่ถูกจองจนกว่าจะอนุมัติคำร้อง
- **ข้อมูลไม่ถูกต้อง**: หลายศูนย์สามารถเห็นและขอสต็อกเดียวกันได้พร้อมกัน
- **ข้อผิดพลาดในการตัดสต็อก**: คำร้องที่อนุมัติภายหลังอาจขาดสต็อก

### ✅ วิธีแก้ไข
- **จองสต็อกตั้งแต่สร้างคำร้อง**: ป้องกันศูนย์อื่นขอสต็อกเดียวกัน
- **แสดงสต็อกพร้อมใช้แบบแยก**: Total (รวมทั้งหมด) vs Reserved (จองแล้ว) vs Available (พร้อมใช้)
- **ตัดสต็อกเมื่อยืนยันรับของจริง**: ประกันว่าสต็อกเพียงพอเมื่อต้องนำไปใช้

---

## 🏗️ โครงสร้าง Database

### InventoryItem (เพิ่มเติม)
```typescript
{
    _id: ObjectId;
    itemName: string;
    category: string;
    quantity: number;        // 📌 Total Stock
    reserved: number;        // 📌 NEW: Reserved Stock (จองแล้ว)
    unit: string;
    lastUpdated: Date;
}

// Computed:
// available = quantity - reserved
```

### DistributionRequest (เพิ่มเติม)
```typescript
{
    _id: ObjectId;
    shelterId: string;
    items: { itemName: string; quantity: number }[];
    status: 'รอดำเนินการ' | 'อนุมัติแล้ว' | 'กำลังจัดส่ง' | 'สำเร็จ' | 'ยกเลิก';
    urgency: string;
    requestBy: string;
    approvedBy?: string;
    cancelledBy?: string;    // 📌 NEW
    cancellationReason?: string;  // 📌 NEW
    cancelledAt?: Date;      // 📌 NEW
    createdAt: Date;
    updatedAt: Date;
}
```

### StockLog (สร้างใหม่)
```typescript
{
    _id: ObjectId;
    itemName: string;
    itemId: string;
    action: 'reserve' | 'unreserve' | 'cut' | 'manual-adjustment';
    previousQuantity: number;
    newQuantity: number;
    change: number;
    relatedRequestId?: string;
    performedBy: string;
    notes?: string;
    createdAt: Date;
}
```

---

## 🔄 Flow การทำงาน

### ขั้นตอนที่ 1: สร้างคำร้อง (จองสต็อก)
**API**: `POST /api/distribution-requests`

```
Input:
{
  shelterId: "...",
  items: [{ itemName: "ข้าวสาร", quantity: 20 }],
  urgency: "สูง",
  requestBy: "เจ้าหน้าที่"
}

Process:
1. ตรวจสอบสต็อก Available (quantity - reserved)
2. ถ้าไม่พอ → ส่ง 409 Conflict
3. ถ้าพอ → Update Inventory.reserved += quantity
4. สร้าง DistributionRequest (status: รอดำเนินการ)
5. เพิ่ม StockLog (action: reserve)

Result:
- สต็อกถูกจองแล้ว
- ศูนย์อื่นเห็นสต็อก Available ลดลง
- คำร้องอยู่ในสถานะ "รอดำเนินการ"
```

### ขั้นตอนที่ 2: อนุมัติคำร้อง
**API**: `PUT /api/distribution-requests/{id}/approve`

```
Input:
{ approvedBy: "ผู้จัดการ" }

Process:
1. ตรวจสอบ status = "รอดำเนินการ"
2. อัพเดท status → "อนุมัติแล้ว"
3. ไม่มีการเปลี่ยนแปลงสต็อก (สต็อกจองไปแล้ว)

Result:
- คำร้องเปลี่ยนเป็น "อนุมัติแล้ว"
- สต็อก Reserved ยังคงเหมือนเดิม
```

### ขั้นตอนที่ 3: จัดส่ง
**API**: `PUT /api/distribution-requests/{id}/ship`

```
Input: (ไม่มี body)

Process:
1. ตรวจสอบ status = "อนุมัติแล้ว"
2. อัพเดท status → "กำลังจัดส่ง"
3. ไม่มีการเปลี่ยนแปลงสต็อก

Result:
- คำร้องเปลี่ยนเป็น "กำลังจัดส่ง"
```

### ขั้นตอนที่ 4: ยืนยันรับของ (ตัดสต็อก)
**API**: `PUT /api/distribution-requests/{id}/confirm`

```
Input:
{ confirmedBy: "ศูนย์พักพิง" }

Process:
1. ตรวจสอบ status = "กำลังจัดส่ง"
2. สำหรับแต่ละรายการ:
   - quantity -= requested_quantity
   - reserved -= requested_quantity
3. อัพเดท status → "สำเร็จ"
4. เพิ่ม StockLog (action: cut)

Result:
- สต็อก Total และ Reserved ลดลง
- คำร้องเปลี่ยนเป็น "สำเร็จ"
- สต็อก Available คงเหมือนเดิม (ลดแล้ว 2 ที่)
```

### ขั้นตอนที่ 5: ยกเลิกคำร้อง (คืนสต็อก)
**API**: `PUT /api/distribution-requests/{id}/cancel`

```
Input:
{
  cancelledBy: "ผู้บริหาร",
  cancellationReason: "เปลี่ยนความเห็น"
}

Process:
1. ตรวจสอบ status ∈ ["รอดำเนินการ", "อนุมัติแล้ว"]
2. สำหรับแต่ละรายการ:
   - reserved -= requested_quantity
3. อัพเดท status → "ยกเลิก"
4. เก็บ cancelledBy, cancellationReason
5. เพิ่ม StockLog (action: unreserve)

Result:
- สต็อก Reserved คืนแล้ว
- สต็อก Available เพิ่มขึ้น
- คำร้องเปลี่ยนเป็น "ยกเลิก"
```

---

## 📊 ตัวอย่าง Flow สมบูรณ์

```
เริ่มต้น: ข้าวสาร 1000 ถุง (รวม: 1000, จอง: 0, พร้อมใช้: 1000)

09:00 ศูนย์ A ขอ 300 ถุง
→ POST /api/distribution-requests
→ รวม: 1000, จอง: 300, พร้อมใช้: 700 ✅

09:05 ศูนย์ B ขอ 300 ถุง
→ POST /api/distribution-requests
→ รวม: 1000, จอง: 600, พร้อมใช้: 400 ✅

09:10 ศูนย์ C ขอ 500 ถุง
→ POST /api/distribution-requests
→ ❌ ไม่สามารถจอง (พร้อมใช้มีแค่ 400)

09:15 อนุมัติคำร้องของ A
→ PUT /api/distribution-requests/A/approve
→ รวม: 1000, จอง: 600, พร้อมใช้: 400 (ไม่เปลี่ยน)

09:20 ศูนย์ A รับของแล้ว
→ PUT /api/distribution-requests/A/confirm
→ รวม: 700, จอง: 300, พร้อมใช้: 400 (ตัดสต็อก 300)

09:25 ศูนย์ C ขอ 500 ถุงอีกครั้ง
→ POST /api/distribution-requests
→ รวม: 700, จอง: 800, ❌ (พร้อมใช้มีแค่ 400)

09:30 ยกเลิกคำร้องของ B
→ PUT /api/distribution-requests/B/cancel
→ รวม: 700, จอง: 300, พร้อมใช้: 400
→ สต็อก 300 ถุงคืนแล้ว
```

---

## 🔌 API Endpoints

### InventoryItem

#### GET /api/inventory/available
- ดูสต็อกพร้อมใช้ (Total, Reserved, Available)
- Query: `?category=...&search=...&limit=100&offset=0`

### DistributionRequest

#### POST /api/distribution-requests
- สร้างคำร้อง (จองสต็อก)
- Body: `{ shelterId, items, urgency, requestBy }`

#### GET /api/distribution-requests
- ดูคำร้องทั้งหมด
- Query: `?status=...&urgency=...&limit=100&offset=0`

#### PUT /api/distribution-requests/{id}/approve
- อนุมัติคำร้อง
- Body: `{ approvedBy }`

#### PUT /api/distribution-requests/{id}/ship
- จัดส่ง (เปลี่ยน status เป็น "กำลังจัดส่ง")

#### PUT /api/distribution-requests/{id}/confirm
- ยืนยันรับของ (ตัดสต็อก)
- Body: `{ confirmedBy }`

#### PUT /api/distribution-requests/{id}/cancel
- ยกเลิกคำร้อง (คืนสต็อก)
- Body: `{ cancelledBy, cancellationReason }`

---

## 🎨 UI Changes

### Warehouse Page
- ✅ เพิ่มคอลัมน์ "รวมทั้งหมด" (Total)
- ✅ เพิ่มคอลัมน์ "จองแล้ว" (Reserved) - สีเหลือง
- ✅ เปลี่ยนคอลัมน์ "จำนวนคงเหลือ" เป็น "พร้อมใช้" (Available)

### Distribution Page
- ✅ เพิ่มปุ่ม "อนุมัติ" สำหรับ status "รอดำเนินการ"
- ✅ เพิ่มปุ่ม "จัดส่ง" สำหรับ status "อนุมัติแล้ว"
- ✅ เพิ่มปุ่ม "ยืนยันรับของ" สำหรับ status "กำลังจัดส่ง"
- ✅ เพิ่มปุ่ม "ยกเลิก" สำหรับ status "รอดำเนินการ" และ "อนุมัติแล้ว"
- ✅ เปลี่ยน status "ส่งมอบแล้ว" เป็น "สำเร็จ"
- ✅ เพิ่มฟอร์มเหตุผลสำหรับการยกเลิก

---

## 📁 Files Changed

### Models
- ✅ [src/lib/models/inventory.ts](src/lib/models/inventory.ts) - เพิ่ม `reserved` field
- ✅ [src/lib/models/distribution_request.ts](src/lib/models/distribution_request.ts) - เพิ่มสถานะใหม่และ cancellation fields
- ✅ [src/lib/models/stock_log.ts](src/lib/models/stock_log.ts) - สร้างใหม่

### API Routes
- ✅ [src/app/api/distribution-requests/route.ts](src/app/api/distribution-requests/route.ts) - อัพเดท POST เพื่อจองสต็อก
- ✅ [src/app/api/distribution-requests/[id]/approve/route.ts](src/app/api/distribution-requests/[id]/approve/route.ts) - เปลี่ยนเป็นเพียงเปลี่ยนสถานะ
- ✅ [src/app/api/distribution-requests/[id]/ship/route.ts](src/app/api/distribution-requests/[id]/ship/route.ts) - สร้างใหม่
- ✅ [src/app/api/distribution-requests/[id]/confirm/route.ts](src/app/api/distribution-requests/[id]/confirm/route.ts) - สร้างใหม่ (ตัดสต็อก)
- ✅ [src/app/api/distribution-requests/[id]/cancel/route.ts](src/app/api/distribution-requests/[id]/cancel/route.ts) - สร้างใหม่
- ✅ [src/app/api/inventory/available/route.ts](src/app/api/inventory/available/route.ts) - สร้างใหม่

### Frontend Components
- ✅ [src/app/warehouse/page.tsx](src/app/warehouse/page.tsx) - อัพเดท UI
- ✅ [src/app/distribution/page.tsx](src/app/distribution/page.tsx) - อัพเดท UI
- ✅ [src/app/distribution/CreateRequestModal.tsx](src/app/distribution/CreateRequestModal.tsx) - อัพเดท validation

---

## 🚀 ข้อดี

✅ **ป้องกันข้อมูลไม่ถูกต้อง**
- สต็อก Available ลดลงทันทีเมื่อสร้างคำร้อง

✅ **ยุติธรรม**
- ศูนย์ที่สร้างคำร้องก่อนจะได้จองสต็อกก่อน

✅ **ยืดหยุ่น**
- สามารถยกเลิกและตัดสต็อกได้ตามแต่ละขั้นตอน

✅ **โปร่งใส**
- เห็นสต็อก Total, Reserved, Available อย่างชัดเจน

✅ **ประวัติครบถ้วน**
- StockLog บันทึกทุกการเปลี่ยนแปลง

---

## ⚠️ ข้อควรระวัง

### หาก Inventory ไม่มี `reserved` field
ต้องอัพเดท document ใน MongoDB:
```javascript
db.Inventory.updateMany({}, { $set: { reserved: 0 } })
```

### หาก DistributionRequest มี status "ส่งมอบแล้ว"
ต้องแปลงเป็น "สำเร็จ" หรือเพิ่ม migration:
```javascript
db.DistributionRequests.updateMany(
  { status: 'ส่งมอบแล้ว' },
  { $set: { status: 'สำเร็จ' } }
)
```

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ StockLog เพื่อดูประวัติการเปลี่ยนแปลง
2. ตรวจสอบ Inventory.reserved vs Inventory.quantity
3. ตรวจสอบ API response เพื่อดูข้อมูลข้อผิดพลาด
