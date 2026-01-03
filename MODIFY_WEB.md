📋 แผนพัฒนาระบบจัดการทรัพยากรบริจาคศูนย์พักพิง
ฉบับสมบูรณ์สำหรับทีมพัฒนา

1. ภาพรวมโครงการ (Project Overview)
1.1 วัตถุประสงค์
ระบบนี้ถูกออกแบบเพื่อจัดการและกระจายทรัพยากรบริจาคให้กับศูนย์พักพิงผู้ประสบภัยกว่า 500 แห่ง โดยมีเป้าหมายหลักคือทำให้ผู้ใช้งานสามารถดำเนินการได้ภายใน 2-3 คลิก และมีระบบติดตามสถานะที่โปร่งใส
1.2 ขอบเขตงาน (Scope)
ในขอบเขตนอกขอบเขตDashboard แสดงสถานะศูนย์ทั้งหมดระบบ Login/Authentication (ใช้ของเดิม)ระบบคำร้องขอเบิกของระบบบันทึกผู้อพยพ (มีอยู่แล้ว)ระบบ Reserved StockMobile App (Phase 2)ระบบยกเลิกคำร้องระบบแจ้งเตือน SMSรายงานและกราฟสรุประบบ Logistics/ขนส่ง
1.3 ผู้ใช้งานระบบ (User Roles)
┌─────────────────────────────────────────────────────────────────────┐
│  👤 USER ROLES                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. เจ้าหน้าที่ศูนย์ (Center Staff)                                  │
│     ├─ ดูสถานะศูนย์ของตนเอง                                          │
│     ├─ สร้างคำร้องขอเบิกของ                                          │
│     ├─ ยกเลิกคำร้องของตนเอง (เฉพาะ Pending)                          │
│     └─ ยืนยันรับของ                                                  │
│                                                                     │
│  2. เจ้าหน้าที่กองกลาง (Central Admin)                               │
│     ├─ ดู Dashboard ภาพรวมทั้งหมด                                    │
│     ├─ อนุมัติ/ปฏิเสธคำร้อง                                          │
│     ├─ ยกเลิกคำร้อง (Pending, Approved)                              │
│     ├─ จัดการสต็อกกองกลาง                                            │
│     └─ ยืนยันส่งมอบของ                                               │
│                                                                     │
│  3. ผู้บริหาร (Manager)                                              │
│     ├─ ดู Dashboard และรายงาน                                       │
│     └─ Export ข้อมูล                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

2. Technology Stack
2.1 Frontend
┌─────────────────────────────────────────────────────────────────────┐
│  🎨 FRONTEND STACK                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Framework:     Next.js 14 (App Router)                             │
│  Language:      TypeScript                                          │
│  Styling:       Tailwind CSS                                        │
│  UI Components: shadcn/ui                                           │
│  State:         Zustand หรือ React Query                            │
│  Charts:        Recharts                                            │
│  Forms:         React Hook Form + Zod                               │
│  Icons:         Lucide React                                        │
│  HTTP Client:   Axios                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
2.2 Backend
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️ BACKEND STACK                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Framework:     Node.js + Express.js                                │
│                 หรือ Next.js API Routes                             │
│  Language:      TypeScript                                          │
│  Database:      MySQL 8.0                                           │
│  ORM:           Prisma                                              │
│  Validation:    Zod                                                 │
│  Auth:          ใช้ API ของอาจารย์ที่มีอยู่                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
2.3 Infrastructure
┌─────────────────────────────────────────────────────────────────────┐
│  🏗️ INFRASTRUCTURE                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Hosting:       Vercel (Frontend) + VPS (Backend)                   │
│  Database:      MySQL on VPS หรือ PlanetScale                       │
│  File Storage:  Local หรือ S3-compatible                            │
│  Monitoring:    Vercel Analytics                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

3. Database Design
3.1 Entity Relationship Diagram (ERD)
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│   📊 ENTITY RELATIONSHIP DIAGRAM                                                        │
│                                                                                         │
│                                                                                         │
│   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐          │
│   │     centers     │         │  center_items   │         │     items       │          │
│   ├─────────────────┤         ├─────────────────┤         ├─────────────────┤          │
│   │ id (PK)         │────┐    │ id (PK)         │    ┌────│ id (PK)         │          │
│   │ name            │    │    │ center_id (FK)  │────┘    │ name            │          │
│   │ address         │    └───▶│ item_id (FK)    │◀────────│ category_id(FK) │          │
│   │ district        │         │ current_qty     │         │ unit            │          │
│   │ province        │         │ required_qty    │         │ description     │          │
│   │ contact_name    │         │ status          │         └─────────────────┘          │
│   │ contact_phone   │         │ updated_at      │                  ▲                   │
│   │ max_capacity    │         └─────────────────┘                  │                   │
│   │ current_evacuee │                                              │                   │
│   │ status          │                                              │                   │
│   │ created_at      │         ┌─────────────────┐         ┌───────┴─────────┐          │
│   │ updated_at      │         │   categories    │         │  central_stock  │          │
│   └─────────────────┘         ├─────────────────┤         ├─────────────────┤          │
│            │                  │ id (PK)         │         │ id (PK)         │          │
│            │                  │ name            │         │ item_id (FK)    │          │
│            │                  │ icon            │         │ total_qty       │          │
│            │                  │ sort_order      │         │ reserved_qty    │          │
│            │                  └─────────────────┘         │ available_qty   │          │
│            │                                              │ updated_at      │          │
│            │                                              └─────────────────┘          │
│            │                                                       ▲                   │
│            │                                                       │                   │
│            │                  ┌─────────────────┐                  │                   │
│            │                  │    requests     │                  │                   │
│            │                  ├─────────────────┤                  │                   │
│            └─────────────────▶│ id (PK)         │                  │                   │
│                               │ request_no      │                  │                   │
│                               │ center_id (FK)  │                  │                   │
│                               │ status          │                  │                   │
│                               │ note            │                  │                   │
│                               │ cancel_reason   │                  │                   │
│                               │ created_by      │                  │                   │
│                               │ approved_by     │                  │                   │
│                               │ created_at      │                  │                   │
│                               │ updated_at      │                  │                   │
│                               └─────────────────┘                  │                   │
│                                        │                           │                   │
│                                        │                           │                   │
│                                        ▼                           │                   │
│                               ┌─────────────────┐                  │                   │
│                               │  request_items  │                  │                   │
│                               ├─────────────────┤                  │                   │
│                               │ id (PK)         │                  │                   │
│                               │ request_id (FK) │                  │                   │
│                               │ item_id (FK)    │──────────────────┘                   │
│                               │ quantity        │                                      │
│                               │ reserved_at     │                                      │
│                               └─────────────────┘                                      │
│                                                                                         │
│                                                                                         │
│                               ┌─────────────────┐                                      │
│                               │ request_timeline│                                      │
│                               ├─────────────────┤                                      │
│                               │ id (PK)         │                                      │
│                               │ request_id (FK) │                                      │
│                               │ status          │                                      │
│                               │ note            │                                      │
│                               │ created_by      │                                      │
│                               │ created_at      │                                      │
│                               └─────────────────┘                                      │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
3.2 Table Definitions
3.2.1 categories (หมวดหมู่สินค้า)
sqlCREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ข้อมูลเริ่มต้น
INSERT INTO categories (name, icon, sort_order) VALUES
('อาหาร', 'utensils', 1),
('น้ำดื่ม', 'droplets', 2),
('ยา/เวชภัณฑ์', 'pill', 3),
('เสื้อผ้า', 'shirt', 4),
('ของใช้', 'package', 5),
('ที่นอน', 'bed', 6),
('ของเด็กอ่อน', 'baby', 7);
3.2.2 items (รายการสินค้า)
sqlCREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ข้อมูลเริ่มต้น
INSERT INTO items (category_id, name, unit) VALUES
(1, 'ข้าวสาร 5 กก.', 'ถุง'),
(1, 'บะหมี่กึ่งสำเร็จรูป', 'ซอง'),
(1, 'ปลากระป๋อง', 'กระป๋อง'),
(2, 'น้ำดื่ม 600ml', 'ขวด'),
(2, 'น้ำดื่ม 1.5L', 'ขวด'),
(3, 'ยาพาราเซตามอล', 'แผง'),
(3, 'ผ้าพันแผล', 'ม้วน'),
(4, 'เสื้อผ้าผู้ใหญ่', 'ชุด'),
(4, 'เสื้อผ้าเด็ก', 'ชุด'),
(5, 'สบู่', 'ก้อน'),
(5, 'ยาสีฟัน', 'หลอด'),
(6, 'เสื่อ', 'ผืน'),
(6, 'ผ้าห่ม', 'ผืน'),
(7, 'ผ้าอ้อมสำเร็จรูป', 'ห่อ'),
(7, 'นมผง', 'กระป๋อง');
3.2.3 centers (ศูนย์พักพิง)
sqlCREATE TABLE centers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    external_id VARCHAR(50) UNIQUE,  -- ID จาก API ของอาจารย์
    name VARCHAR(200) NOT NULL,
    address TEXT,
    subdistrict VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100) DEFAULT 'ศรีสะเกษ',
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    max_capacity INT DEFAULT 0,
    current_evacuees INT DEFAULT 0,
    status ENUM('normal', 'warning', 'critical', 'excess') DEFAULT 'normal',
    is_active BOOLEAN DEFAULT TRUE,
    synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_district (district)
);
3.2.4 center_items (ทรัพยากรแต่ละศูนย์)
sqlCREATE TABLE center_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    center_id INT NOT NULL,
    item_id INT NOT NULL,
    current_quantity INT DEFAULT 0,
    required_quantity INT DEFAULT 0,
    status ENUM('normal', 'warning', 'critical', 'excess') DEFAULT 'normal',
    last_updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_center_item (center_id, item_id),
    INDEX idx_status (status)
);

-- Trigger สำหรับคำนวณ status อัตโนมัติ
DELIMITER //
CREATE TRIGGER update_center_item_status
BEFORE UPDATE ON center_items
FOR EACH ROW
BEGIN
    DECLARE percentage DECIMAL(5,2);
    
    IF NEW.required_quantity > 0 THEN
        SET percentage = (NEW.current_quantity / NEW.required_quantity) * 100;
        
        IF percentage >= 120 THEN
            SET NEW.status = 'excess';
        ELSEIF percentage >= 80 THEN
            SET NEW.status = 'normal';
        ELSEIF percentage >= 50 THEN
            SET NEW.status = 'warning';
        ELSE
            SET NEW.status = 'critical';
        END IF;
    ELSE
        SET NEW.status = 'normal';
    END IF;
END//
DELIMITER ;
3.2.5 central_stock (สต็อกกองกลาง)
sqlCREATE TABLE central_stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL UNIQUE,
    total_quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (total_quantity - reserved_quantity) STORED,
    min_threshold INT DEFAULT 0,
    last_updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_available (available_quantity)
);
3.2.6 requests (คำร้องขอเบิก)
sqlCREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_no VARCHAR(20) NOT NULL UNIQUE,
    center_id INT NOT NULL,
    status ENUM('pending', 'approved', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('normal', 'urgent') DEFAULT 'normal',
    note TEXT,
    cancel_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    cancelled_by INT,
    approved_at TIMESTAMP NULL,
    approved_by INT,
    shipped_at TIMESTAMP NULL,
    shipped_by INT,
    completed_at TIMESTAMP NULL,
    completed_by INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (center_id) REFERENCES centers(id),
    INDEX idx_status (status),
    INDEX idx_center (center_id),
    INDEX idx_created_at (created_at)
);

-- Function สร้างเลขที่คำร้อง
DELIMITER //
CREATE FUNCTION generate_request_no() RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE new_no VARCHAR(20);
    DECLARE last_no INT;
    DECLARE today_prefix VARCHAR(10);
    
    SET today_prefix = DATE_FORMAT(NOW(), 'R%y%m%d');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_no, 8) AS UNSIGNED)), 0) + 1
    INTO last_no
    FROM requests
    WHERE request_no LIKE CONCAT(today_prefix, '%');
    
    SET new_no = CONCAT(today_prefix, LPAD(last_no, 4, '0'));
    
    RETURN new_no;
END//
DELIMITER ;
3.2.7 request_items (รายการในคำร้อง)
sqlCREATE TABLE request_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL,
    deducted_at TIMESTAMP NULL,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_request (request_id)
);
3.2.8 request_timeline (ประวัติการดำเนินการ)
sqlCREATE TABLE request_timeline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    INDEX idx_request (request_id)
);
3.2.9 stock_transactions (ประวัติการเคลื่อนไหวสต็อก)
sqlCREATE TABLE stock_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    transaction_type ENUM('receive', 'reserve', 'release', 'deduct', 'adjust') NOT NULL,
    quantity INT NOT NULL,
    reference_type ENUM('donation', 'request', 'adjustment') NOT NULL,
    reference_id INT,
    note TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_item (item_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created_at (created_at)
);
```

---

## 4. API Design

### 4.1 API Endpoints Overview
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  📡 API ENDPOINTS                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  Base URL: /api/v1                                                                      │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │  📊 Dashboard                                                                   │   │
│  │  GET    /dashboard/summary          สรุปภาพรวม                                 │   │
│  │  GET    /dashboard/charts           ข้อมูลสำหรับกราฟ                            │   │
│  │  GET    /dashboard/alerts           ศูนย์ที่ต้องการความช่วยเหลือเร่งด่วน          │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │  🏕️ Centers (ศูนย์พักพิง)                                                       │   │
│  │  GET    /centers                    รายการศูนย์ทั้งหมด (with filters)           │   │
│  │  GET    /centers/:id                รายละเอียดศูนย์                             │   │
│  │  GET    /centers/:id/items          ทรัพยากรของศูนย์                            │   │
│  │  PUT    /centers/:id/items          อัพเดททรัพยากรของศูนย์                       │   │
│  │  POST   /centers/sync               Sync ข้อมูลจาก API อาจารย์                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │  📦 Central Stock (กองกลาง)                                                     │   │
│  │  GET    /stock                      รายการสต็อกทั้งหมด                          │   │
│  │  GET    /stock/:itemId              รายละเอียดสต็อกรายการ                        │   │
│  │  POST   /stock/receive              รับของบริจาคเข้า                            │   │
│  │  PUT    /stock/:itemId/adjust       ปรับปรุงสต็อก                               │   │
│  │  GET    /stock/reserved             รายการที่จองไว้ทั้งหมด                       │   │
│  │  GET    /stock/transactions         ประวัติการเคลื่อนไหว                         │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │  📝 Requests (คำร้อง)                                                           │   │
│  │  GET    /requests                   รายการคำร้องทั้งหมด (with filters)          │   │
│  │  GET    /requests/:id               รายละเอียดคำร้อง                            │   │
│  │  POST   /requests                   สร้างคำร้องใหม่                             │   │
│  │  PUT    /requests/:id/approve       อนุมัติคำร้อง                               │   │
│  │  PUT    /requests/:id/ship          ยืนยันส่งของ                                │   │
│  │  PUT    /requests/:id/complete      ยืนยันรับของสำเร็จ                           │   │
│  │  PUT    /requests/:id/cancel        ยกเลิกคำร้อง                                │   │
│  │  GET    /requests/:id/timeline      ประวัติการดำเนินการ                          │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │  📚 Master Data                                                                 │   │
│  │  GET    /categories                 หมวดหมู่ทั้งหมด                             │   │
│  │  GET    /items                      รายการสินค้าทั้งหมด                          │   │
│  │  GET    /items?category=:id         รายการสินค้าตามหมวดหมู่                      │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
4.2 API Specifications
4.2.1 Dashboard APIs
typescript// GET /api/v1/dashboard/summary
// Response
{
  "success": true,
  "data": {
    "centers": {
      "total": 515,
      "normal": 298,
      "warning": 142,
      "critical": 75,
      "excess": 12
    },
    "stock": {
      "total_items": 1847,
      "total_quantity": 5000,
      "reserved_quantity": 500,
      "available_quantity": 4500
    },
    "requests": {
      "pending": 23,
      "approved": 15,
      "shipping": 8,
      "completed_today": 12
    },
    "last_updated": "2025-01-03T10:30:00Z"
  }
}

// GET /api/v1/dashboard/alerts
// Response
{
  "success": true,
  "data": {
    "critical_centers": [
      {
        "id": 1,
        "name": "ศูนย์วัดป่ามหาชัย",
        "evacuees": 312,
        "critical_items": [
          { "name": "น้ำดื่ม", "shortage": 420 },
          { "name": "อาหาร", "shortage": 80 }
        ]
      }
    ],
    "low_stock_items": [
      {
        "item_id": 6,
        "name": "ที่นอน",
        "available": 250,
        "total_required": 1200
      }
    ]
  }
}
4.2.2 Centers APIs
typescript// GET /api/v1/centers?status=critical&district=เมือง&page=1&limit=20
// Response
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "ศูนย์พักพิงวัดป่ามหาชัย",
        "district": "อ.เมือง",
        "evacuees": 312,
        "max_capacity": 350,
        "status": "critical",
        "contact_name": "นายสมชาย ใจดี",
        "contact_phone": "089-xxx-xxxx",
        "items_summary": {
          "normal": 3,
          "warning": 2,
          "critical": 2,
          "excess": 0
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 75,
      "total_pages": 4
    }
  }
}

// GET /api/v1/centers/:id/items
// Response
{
  "success": true,
  "data": {
    "center": {
      "id": 1,
      "name": "ศูนย์พักพิงวัดป่ามหาชัย"
    },
    "items": [
      {
        "item_id": 1,
        "name": "ข้าวสาร 5 กก.",
        "category": "อาหาร",
        "unit": "ถุง",
        "current_quantity": 120,
        "required_quantity": 200,
        "percentage": 60,
        "status": "warning",
        "shortage": 80
      }
    ]
  }
}
4.2.3 Stock APIs
typescript// GET /api/v1/stock?category=1
// Response
{
  "success": true,
  "data": {
    "summary": {
      "total_quantity": 5000,
      "reserved_quantity": 500,
      "available_quantity": 4500
    },
    "items": [
      {
        "item_id": 1,
        "name": "ข้าวสาร 5 กก.",
        "category": "อาหาร",
        "unit": "ถุง",
        "total_quantity": 1200,
        "reserved_quantity": 100,
        "available_quantity": 1100,
        "min_threshold": 200
      }
    ]
  }
}

// POST /api/v1/stock/receive
// Request
{
  "items": [
    { "item_id": 1, "quantity": 500 },
    { "item_id": 4, "quantity": 1000 }
  ],
  "donor_name": "มูลนิธิช่วยเหลือผู้ประสบภัย",
  "note": "บริจาควันที่ 3 ม.ค. 68"
}

// Response
{
  "success": true,
  "message": "รับของบริจาคเรียบร้อย",
  "data": {
    "transaction_ids": [101, 102],
    "updated_stock": [
      { "item_id": 1, "new_total": 1700 },
      { "item_id": 4, "new_total": 6600 }
    ]
  }
}
4.2.4 Requests APIs
typescript// POST /api/v1/requests
// Request
{
  "center_id": 1,
  "priority": "urgent",
  "items": [
    { "item_id": 4, "quantity": 420 },
    { "item_id": 1, "quantity": 80 }
  ],
  "note": "ต้องการน้ำดื่มเร่งด่วน มีผู้ป่วยเด็กหลายคน"
}

// Response
{
  "success": true,
  "message": "สร้างคำร้องเรียบร้อย",
  "data": {
    "request_id": 245,
    "request_no": "R2501030001",
    "status": "pending",
    "reserved_items": [
      { "item_id": 4, "quantity": 420, "available_after": 4680 },
      { "item_id": 1, "quantity": 80, "available_after": 1020 }
    ]
  }
}

// PUT /api/v1/requests/:id/cancel
// Request
{
  "reason": "ศูนย์ได้รับของจากที่อื่นแล้ว"
}

// Response
{
  "success": true,
  "message": "ยกเลิกคำร้องเรียบร้อย สต็อกถูกคืนแล้ว",
  "data": {
    "request_id": 245,
    "status": "cancelled",
    "released_items": [
      { "item_id": 4, "quantity": 420, "available_after": 5100 },
      { "item_id": 1, "quantity": 80, "available_after": 1100 }
    ]
  }
}

// PUT /api/v1/requests/:id/complete
// Response
{
  "success": true,
  "message": "ยืนยันรับของสำเร็จ สต็อกถูกตัดเรียบร้อย",
  "data": {
    "request_id": 245,
    "status": "completed",
    "deducted_items": [
      { "item_id": 4, "quantity": 420, "new_total": 5180 },
      { "item_id": 1, "quantity": 80, "new_total": 1120 }
    ],
    "center_items_updated": true
  }
}
4.3 Business Logic: Stock Management
typescript// services/stockService.ts

class StockService {
  
  /**
   * จองสต็อก (เมื่อสร้างคำร้อง)
   */
  async reserveStock(items: RequestItem[]): Promise<ReserveResult> {
    const transaction = await db.transaction();
    
    try {
      for (const item of items) {
        // ตรวจสอบว่ามีสต็อกพอไหม
        const stock = await this.getStock(item.item_id);
        
        if (stock.available_quantity < item.quantity) {
          throw new Error(`สต็อก ${stock.name} ไม่เพียงพอ (มี ${stock.available_quantity} ต้องการ ${item.quantity})`);
        }
        
        // เพิ่ม reserved_quantity
        await db.centralStock.update({
          where: { item_id: item.item_id },
          data: {
            reserved_quantity: { increment: item.quantity }
          }
        });
        
        // บันทึก transaction
        await db.stockTransactions.create({
          data: {
            item_id: item.item_id,
            transaction_type: 'reserve',
            quantity: item.quantity,
            reference_type: 'request',
            reference_id: item.request_id
          }
        });
      }
      
      await transaction.commit();
      return { success: true };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * คืนสต็อก (เมื่อยกเลิกคำร้อง)
   */
  async releaseStock(requestId: number): Promise<ReleaseResult> {
    const transaction = await db.transaction();
    
    try {
      const requestItems = await db.requestItems.findMany({
        where: { request_id: requestId }
      });
      
      for (const item of requestItems) {
        // ลด reserved_quantity
        await db.centralStock.update({
          where: { item_id: item.item_id },
          data: {
            reserved_quantity: { decrement: item.quantity }
          }
        });
        
        // อัพเดท released_at
        await db.requestItems.update({
          where: { id: item.id },
          data: { released_at: new Date() }
        });
        
        // บันทึก transaction
        await db.stockTransactions.create({
          data: {
            item_id: item.item_id,
            transaction_type: 'release',
            quantity: item.quantity,
            reference_type: 'request',
            reference_id: requestId,
            note: 'คืนสต็อกจากการยกเลิกคำร้อง'
          }
        });
      }
      
      await transaction.commit();
      return { success: true, released_items: requestItems };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * ตัดสต็อกจริง (เมื่อส่งมอบสำเร็จ)
   */
  async deductStock(requestId: number): Promise<DeductResult> {
    const transaction = await db.transaction();
    
    try {
      const request = await db.requests.findUnique({
        where: { id: requestId },
        include: { items: true, center: true }
      });
      
      for (const item of request.items) {
        // ลด total_quantity และ reserved_quantity
        await db.centralStock.update({
          where: { item_id: item.item_id },
          data: {
            total_quantity: { decrement: item.quantity },
            reserved_quantity: { decrement: item.quantity }
          }
        });
        
        // เพิ่มของให้ศูนย์
        await db.centerItems.upsert({
          where: {
            center_id_item_id: {
              center_id: request.center_id,
              item_id: item.item_id
            }
          },
          update: {
            current_quantity: { increment: item.quantity }
          },
          create: {
            center_id: request.center_id,
            item_id: item.item_id,
            current_quantity: item.quantity,
            required_quantity: item.quantity
          }
        });
        
        // อัพเดท deducted_at
        await db.requestItems.update({
          where: { id: item.id },
          data: { deducted_at: new Date() }
        });
        
        // บันทึก transaction
        await db.stockTransactions.create({
          data: {
            item_id: item.item_id,
            transaction_type: 'deduct',
            quantity: item.quantity,
            reference_type: 'request',
            reference_id: requestId
          }
        });
      }
      
      // อัพเดทสถานะศูนย์
      await this.updateCenterStatus(request.center_id);
      
      await transaction.commit();
      return { success: true };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

---

## 5. Frontend Components

### 5.1 Component Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Dashboard
│   ├── centers/
│   │   └── page.tsx                  # รายการศูนย์ (List View)
│   ├── requests/
│   │   └── page.tsx                  # คำร้องทั้งหมด
│   └── stock/
│       └── page.tsx                  # จัดการสต็อกกองกลาง
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── NotificationPanel.tsx
│   │
│   ├── dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── CriticalAlerts.tsx
│   │   ├── StatusChart.tsx
│   │   └── ResourceChart.tsx
│   │
│   ├── centers/
│   │   ├── CenterList.tsx
│   │   ├── CenterCard.tsx
│   │   ├── CenterDetailModal.tsx
│   │   └── CenterItemsTable.tsx
│   │
│   ├── requests/
│   │   ├── RequestList.tsx
│   │   ├── RequestCard.tsx
│   │   ├── RequestDetailModal.tsx
│   │   ├── CreateRequestModal.tsx
│   │   ├── CancelRequestModal.tsx
│   │   └── RequestTimeline.tsx
│   │
│   └── stock/
│       ├── StockDrawer.tsx
│       ├── StockList.tsx
│       ├── ReservedStockModal.tsx
│       ├── ReceiveStockModal.tsx
│       └── StockTransactionHistory.tsx
│
├── hooks/
│   ├── useCenters.ts
│   ├── useRequests.ts
│   ├── useStock.ts
│   └── useDashboard.ts
│
├── services/
│   ├── api.ts
│   ├── centerService.ts
│   ├── requestService.ts
│   └── stockService.ts
│
├── stores/
│   ├── filterStore.ts
│   └── notificationStore.ts
│
├── types/
│   ├── center.ts
│   ├── request.ts
│   ├── stock.ts
│   └── common.ts
│
└── utils/
    ├── constants.ts
    ├── helpers.ts
    └── formatters.ts
5.2 Key Components Specifications
5.2.1 SummaryCards Component
tsx// components/dashboard/SummaryCards.tsx

interface SummaryCardsProps {
  data: {
    totalCenters: number;
    normalCenters: number;
    warningCenters: number;
    criticalCenters: number;
    availableStock: number;
    reservedStock: number;
  };
  onCardClick: (filter: string) => void;
}

export function SummaryCards({ data, onCardClick }: SummaryCardsProps) {
  const cards = [
    {
      title: 'ศูนย์ทั้งหมด',
      value: data.totalCenters,
      icon: Building,
      color: 'bg-slate-100',
      filter: 'all'
    },
    {
      title: 'ปกติ',
      value: data.normalCenters,
      percentage: ((data.normalCenters / data.totalCenters) * 100).toFixed(1),
      icon: CheckCircle,
      color: 'bg-green-100',
      textColor: 'text-green-600',
      filter: 'normal'
    },
    {
      title: 'เริ่มขาด',
      value: data.warningCenters,
      percentage: ((data.warningCenters / data.totalCenters) * 100).toFixed(1),
      icon: AlertTriangle,
      color: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      filter: 'warning'
    },
    {
      title: 'วิกฤต',
      value: data.criticalCenters,
      percentage: ((data.criticalCenters / data.totalCenters) * 100).toFixed(1),
      icon: XCircle,
      color: 'bg-red-100',
      textColor: 'text-red-600',
      filter: 'critical'
    },
    {
      title: 'พร้อมใช้งาน',
      value: data.availableStock,
      subtitle: `(จอง: ${data.reservedStock})`,
      icon: Package,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      filter: 'stock'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.filter}
          className={`${card.color} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => onCardClick(card.filter)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <card.icon className={`h-8 w-8 ${card.textColor || 'text-slate-600'}`} />
              <span className="text-2xl font-bold">{card.value.toLocaleString()}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{card.title}</p>
            {card.percentage && (
              <p className={`text-xs ${card.textColor}`}>{card.percentage}%</p>
            )}
            {card.subtitle && (
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
5.2.2 CreateRequestModal Component
tsx// components/requests/CreateRequestModal.tsx

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerId?: number;
  onSuccess: () => void;
}

export function CreateRequestModal({ 
  isOpen, 
  onClose, 
  centerId, 
  onSuccess 
}: CreateRequestModalProps) {
  const [selectedCenter, setSelectedCenter] = useState<number | null>(centerId || null);
  const [selectedItems, setSelectedItems] = useState<RequestItem[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: centers } = useCenters();
  const { data: stock } = useStock();
  const { data: centerItems } = useCenterItems(selectedCenter);

  const handleAddItem = (itemId: number, quantity: number) => {
    const stockItem = stock?.items.find(s => s.item_id === itemId);
    
    if (!stockItem) return;
    
    if (quantity > stockItem.available_quantity) {
      toast.error(`สต็อกไม่เพียงพอ (มี ${stockItem.available_quantity} ${stockItem.unit})`);
      return;
    }

    setSelectedItems(prev => {
      const existing = prev.find(i => i.item_id === itemId);
      if (existing) {
        return prev.map(i => 
          i.item_id === itemId ? { ...i, quantity } : i
        );
      }
      return [...prev, { item_id: itemId, quantity }];
    });
  };

  const handleSubmit = async () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('กรุณาเลือกศูนย์และรายการที่ต้องการ');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await requestService.create({
        center_id: selectedCenter,
        items: selectedItems,
        note
      });
      
      toast.success('สร้างคำร้องเรียบร้อย');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 คำร้องขอเบิกของ</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Center Selection */}
          <div>
            <Label>🏕️ ศูนย์พักพิง</Label>
            <CenterSelect
              value={selectedCenter}
              onChange={setSelectedCenter}
              centers={centers?.items || []}
            />
          </div>

          {/* Items Selection */}
          {selectedCenter && (
            <div>
              <Label>📦 เลือกรายการที่ต้องการ</Label>
              <div className="space-y-3 mt-2">
                {stock?.items.map(item => {
                  const centerItem = centerItems?.find(c => c.item_id === item.item_id);
                  const shortage = centerItem 
                    ? Math.max(0, centerItem.required_quantity - centerItem.current_quantity)
                    : 0;
                  const selected = selectedItems.find(s => s.item_id === item.item_id);

                  return (
                    <ItemSelector
                      key={item.item_id}
                      item={item}
                      shortage={shortage}
                      selectedQuantity={selected?.quantity || 0}
                      onQuantityChange={(qty) => handleAddItem(item.item_id, qty)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📋 สรุปคำร้อง</h4>
              <div className="space-y-1">
                {selectedItems.map(item => {
                  const stockItem = stock?.items.find(s => s.item_id === item.item_id);
                  return (
                    <div key={item.item_id} className="flex justify-between text-sm">
                      <span>{stockItem?.name}</span>
                      <span>{item.quantity} {stockItem?.unit}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t">
                <span className="text-sm text-slate-600">
                  รวม {selectedItems.length} รายการ
                </span>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <Label>📝 หมายเหตุ</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            ⚡ เมื่อยืนยัน: ระบบจะ "จอง" สต็อกไว้ก่อน
            สต็อกจะถูกตัดจริงเมื่อยืนยันส่งมอบสำเร็จ
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || selectedItems.length === 0}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : '✅ ยืนยันคำร้อง'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
5.2.3 CancelRequestModal Component
tsx// components/requests/CancelRequestModal.tsx

interface CancelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  'ขอผิดจำนวน',
  'ศูนย์ได้รับของจากที่อื่นแล้ว',
  'เปลี่ยนใจ/ไม่ต้องการแล้ว',
  'อื่นๆ'
];

export function CancelRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: CancelRequestModalProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const finalReason = reason === 'อื่นๆ' ? customReason : reason;
    
    if (!finalReason) {
      toast.error('กรุณาระบุเหตุผลในการยกเลิก');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await requestService.cancel(request.id, finalReason);
      toast.success('ยกเลิกคำร้องเรียบร้อย สต็อกถูกคืนแล้ว');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⚠️ ยืนยันการยกเลิกคำร้อง</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>คุณต้องการยกเลิกคำร้อง #{request.request_no} หรือไม่?</p>

          {/* Request Details */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📋 รายละเอียดคำร้อง</h4>
            <div className="space-y-1 text-sm">
              <p>🏕️ ศูนย์: {request.center.name}</p>
              <p>📅 วันที่ขอ: {formatDate(request.created_at)}</p>
              <p>📦 รายการ:</p>
              <ul className="ml-4 list-disc">
                {request.items.map(item => (
                  <li key={item.item_id}>
                    {item.name}: {item.quantity} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Impact */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-green-700">
              🔄 ผลกระทบเมื่อยกเลิก
            </h4>
            <p className="text-sm text-green-600">
              ✅ สต็อกที่จองไว้จะถูกคืนสู่กองกลางอัตโนมัติ
            </p>
            <ul className="mt-2 space-y-1 text-sm text-green-600">
              {request.items.map(item => (
                <li key={item.item_id}>
                  • {item.name}: +{item.quantity} {item.unit} → พร้อมใช้งานทันที
                </li>
              ))}
            </ul>
          </div>

          {/* Reason Selection */}
          <div>
            <Label>📝 เหตุผลในการยกเลิก *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {CANCEL_REASONS.map(r => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r}>{r}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {reason === 'อื่นๆ' && (
              <Input
                className="mt-2"
                placeholder="ระบุเหตุผล..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ◀️ กลับ
          </Button>
          <Button 
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : '❌ ยืนยันยกเลิก'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Development Timeline

### 6.1 Phase Overview
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│   📅 DEVELOPMENT TIMELINE (8 สัปดาห์)                                                   │
│                                                                                         │
│   Week 1-2: Foundation & Setup                                                          │
│   ════════════════════════════════════════════════════════════════════════════════════ │
│   │████████████████████████████████████████│                                           │
│   │ - Project setup                        │                                           │
│   │ - Database design & migration          │                                           │
│   │ - API structure                        │                                           │
│   │ - UI component library setup           │                                           │
│   └────────────────────────────────────────┘                                           │
│                                                                                         │
│   Week 3-4: Core Features                                                               │
│   ════════════════════════════════════════════════════════════════════════════════════ │
│                       │████████████████████████████████████████│                       │
│                       │ - Dashboard & Summary                  │                       │
│                       │ - Center list & detail                 │                       │
│                       │ - Stock management                     │                       │
│                       │ - API integration                      │                       │
│                       └────────────────────────────────────────┘                       │
│                                                                                         │
│   Week 5-6: Request System                                                              │
│   ════════════════════════════════════════════════════════════════════════════════════ │
│                                             │████████████████████████████████████████│ │
│                                             │ - Create request flow                  │ │
│                                             │ - Reserved stock system                │ │
│                                             │ - Cancel & release flow                │ │
│                                             │ - Request management                   │ │
│                                             └────────────────────────────────────────┘ │
│                                                                                         │
│   Week 7: Integration & Testing                                                         │
│   ════════════════════════════════════════════════════════════════════════════════════ │
│                                                                 │████████████████████│ │
│                                                                 │ - API integration  │ │
│                                                                 │ - E2E testing      │ │
│                                                                 │ - Bug fixes        │ │
│                                                                 └────────────────────┘ │
│                                                                                         │
│   Week 8: Deployment & Documentation                                                    │
│   ════════════════════════════════════════════════════════════════════════════════════ │
│                                                                       │██████████████│ │
│                                                                       │ - Deployment │ │
│                                                                       │ - User guide │ │
│                                                                       │ - Training   │ │
│                                                                       └──────────────┘ │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Detailed Task Breakdown

#### Week 1-2: Foundation & Setup

| วัน | งาน | รายละเอียด | ผู้รับผิดชอบ |
|-----|-----|-----------|-------------|
| 1 | Project Setup | สร้าง Next.js project, ติดตั้ง dependencies | Dev |
| 2 | Database Setup | ติดตั้ง MySQL, สร้าง Prisma schema | Dev |
| 3 | Database Migration | สร้างตาราง, seed ข้อมูลเริ่มต้น | Dev |
| 4-5 | API Structure | สร้าง API routes, middleware, error handling | Dev |
| 6-7 | UI Components | ติดตั้ง shadcn/ui, สร้าง base components | Dev |
| 8-9 | Layout | Header, Sidebar, main layout structure | Dev |
| 10 | API Integration Test | ทดสอบเชื่อมต่อกับ API ของอาจารย์ | Dev |

#### Week 3-4: Core Features

| วัน | งาน | รายละเอียด |
|-----|-----|-----------|
| 11-12 | Dashboard API | สร้าง summary, charts, alerts APIs |
| 13-14 | Dashboard UI | SummaryCards, Charts, CriticalAlerts |
| 15-16 | Centers API | CRUD operations, filters, pagination |
| 17-18 | Centers UI | CenterList, CenterCard, FilterPanel |
| 19 | Center Detail | CenterDetailModal, ItemsTable |
| 20-21 | Stock API | Stock CRUD, receive, transactions |
| 22 | Stock UI | StockDrawer, StockList |

#### Week 5-6: Request System

| วัน | งาน | รายละเอียด |
|-----|-----|-----------|
| 23-24 | Request API | Create request with reservation |
| 25 | Request Flow | Approve, ship, complete APIs |
| 26 | Cancel Flow | Cancel with stock release |
| 27-28 | Request UI | CreateRequestModal |
| 29 | Request List | RequestList, filters |
| 30 | Request Detail | RequestDetailModal, Timeline |
| 31-32 | Cancel UI | CancelRequestModal |
| 33 | Reserved Stock | ReservedStockModal |

#### Week 7: Integration & Testing

| วัน | งาน | รายละเอียด |
|-----|-----|-----------|
| 34-35 | Integration | เชื่อมต่อทุก module |
| 36 | Center Sync | Sync data from external API |
| 37-38 | Testing | Unit tests, integration tests |
| 39 | Bug Fixes | แก้ไข bugs |
| 40 | Performance | Optimization |

#### Week 8: Deployment

| วัน | งาน | รายละเอียด |
|-----|-----|-----------|
| 41 | Production Build | Build และ test |
| 42 | Deployment | Deploy to production |
| 43 | Documentation | User guide, API docs |
| 44-45 | Training | Training sessions |

---

## 7. Testing Strategy

### 7.1 Test Categories
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│   🧪 TESTING STRATEGY                                                                   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │  Unit Tests (Jest)                                                              │  │
│   │  ─────────────────────────────────────────────────────────────────────────────  │  │
│   │  • Utility functions                                                            │  │
│   │  • Business logic (stock calculations, status determination)                    │  │
│   │  • Data transformations                                                         │  │
│   │  • Form validations                                                             │  │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │  Integration Tests (Jest + Supertest)                                           │  │
│   │  ─────────────────────────────────────────────────────────────────────────────  │  │
│   │  • API endpoints                                                                │  │
│   │  • Database operations                                                          │  │
│   │  • Stock reservation/release flow                                               │  │
│   │  • Request state transitions                                                    │  │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│   │  E2E Tests (Playwright)                                                         │  │
│   │  ─────────────────────────────────────────────────────────────────────────────  │  │
│   │  • Complete user flows                                                          │  │
│   │  • Create request → Approve → Ship → Complete                                   │  │
│   │  • Create request → Cancel → Verify stock released                              │  │
│   │  • Dashboard data accuracy                                                      │  │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
7.2 Critical Test Cases
typescript// tests/stock.test.ts

describe('Stock Management', () => {
  
  describe('Reserve Stock', () => {
    it('should reserve stock when creating request', async () => {
      const initialStock = await getStock(itemId);
      
      await createRequest({
        center_id: 1,
        items: [{ item_id: itemId, quantity: 100 }]
      });
      
      const updatedStock = await getStock(itemId);
      
      expect(updatedStock.reserved_quantity)
        .toBe(initialStock.reserved_quantity + 100);
      expect(updatedStock.available_quantity)
        .toBe(initialStock.available_quantity - 100);
      expect(updatedStock.total_quantity)
        .toBe(initialStock.total_quantity); // ไม่เปลี่ยน
    });

    it('should reject if insufficient stock', async () => {
      const stock = await getStock(itemId);
      
      await expect(
        createRequest({
          center_id: 1,
          items: [{ item_id: itemId, quantity: stock.available_quantity + 1 }]
        })
      ).rejects.toThrow('สต็อกไม่เพียงพอ');
    });
  });

  describe('Release Stock', () => {
    it('should release reserved stock when cancelling request', async () => {
      // Create request first
      const request = await createRequest({
        center_id: 1,
        items: [{ item_id: itemId, quantity: 100 }]
      });
      
      const stockAfterReserve = await getStock(itemId);
      
      // Cancel request
      await cancelRequest(request.id, 'Test cancellation');
      
      const stockAfterCancel = await getStock(itemId);
      
      expect(stockAfterCancel.reserved_quantity)
        .toBe(stockAfterReserve.reserved_quantity - 100);
      expect(stockAfterCancel.available_quantity)
        .toBe(stockAfterReserve.available_quantity + 100);
    });
  });

  describe('Deduct Stock', () => {
    it('should deduct stock when request completed', async () => {
      const request = await createRequest({
        center_id: 1,
        items: [{ item_id: itemId, quantity: 100 }]
      });
      
      await approveRequest(request.id);
      await shipRequest(request.id);
      
      const stockBeforeComplete = await getStock(itemId);
      
      await completeRequest(request.id);
      
      const stockAfterComplete = await getStock(itemId);
      
      expect(stockAfterComplete.total_quantity)
        .toBe(stockBeforeComplete.total_quantity - 100);
      expect(stockAfterComplete.reserved_quantity)
        .toBe(stockBeforeComplete.reserved_quantity - 100);
    });

    it('should update center items when request completed', async () => {
      const centerItemBefore = await getCenterItem(centerId, itemId);
      
      // ... complete request flow
      
      const centerItemAfter = await getCenterItem(centerId, itemId);
      
      expect(centerItemAfter.current_quantity)
        .toBe(centerItemBefore.current_quantity + 100);
    });
  });
});

8. Deployment
8.1 Environment Configuration
bash# .env.production

# Database
DATABASE_URL="mysql://user:password@host:3306/disaster_relief"

# External API
EXTERNAL_API_URL="https://api.example.com"
EXTERNAL_API_KEY="xxx"

# App
NEXT_PUBLIC_APP_URL="https://relief.example.com"
NODE_ENV="production"

# Auth (if needed)
JWT_SECRET="xxx"
```

### 8.2 Deployment Checklist
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│   ✅ DEPLOYMENT CHECKLIST                                                               │
│                                                                                         │
│   Pre-deployment                                                                        │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│   ☐ All tests passing                                                                  │
│   ☐ Environment variables configured                                                   │
│   ☐ Database migrations ready                                                          │
│   ☐ Build successful                                                                   │
│   ☐ Security review completed                                                          │
│                                                                                         │
│   Database                                                                              │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│   ☐ Production database created                                                        │
│   ☐ Migrations applied                                                                 │
│   ☐ Initial data seeded                                                                │
│   ☐ Backup configured                                                                  │
│                                                                                         │
│   Deployment                                                                            │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│   ☐ Deploy to staging first                                                            │
│   ☐ Smoke tests on staging                                                             │
│   ☐ Deploy to production                                                               │
│   ☐ Verify all features working                                                        │
│   ☐ Monitor logs for errors                                                            │
│                                                                                         │
│   Post-deployment                                                                       │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│   ☐ Documentation updated                                                              │
│   ☐ User training completed                                                            │
│   ☐ Support handoff                                                                    │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. User Guide (คู่มือผู้ใช้ฉบับย่อ)

### 9.1 การใช้งานสำหรับเจ้าหน้าที่ศูนย์
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│   📖 คู่มือการใช้งาน: เจ้าหน้าที่ศูนย์พักพิง                                               │
│                                                                                         │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│                                                                                         │
│   🔹 การขอเบิกของ (2 ขั้นตอน)                                                           │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│                                                                                         │
│   ขั้นตอนที่ 1: เลือกรายการ                                                              │
│   ┌───────────────────────────────────────────────────────────┐                        │
│   │  1. คลิกปุ่ม "สร้างคำร้องขอเบิก" ด้านซ้าย                    │                        │
│   │  2. เลือกศูนย์ของคุณ (ถ้ายังไม่ได้เลือก)                      │                        │
│   │  3. เลือกรายการที่ต้องการ โดยกดเครื่องหมาย ☑️               │                        │
│   │  4. ระบุจำนวนที่ต้องการ                                      │                        │
│   │     💡 ระบบจะแนะนำจำนวนตามที่ศูนย์ขาด                       │                        │
│   │     💡 ระบบจะแสดงว่ากองกลางมีพอหรือไม่                       │                        │
│   └───────────────────────────────────────────────────────────┘                        │
│                                                                                         │
│   ขั้นตอนที่ 2: ยืนยัน                                                                   │
│   ┌───────────────────────────────────────────────────────────┐                        │
│   │  1. ตรวจสอบรายการในส่วน "สรุปคำร้อง"                        │                        │
│   │  2. เพิ่มหมายเหตุ (ถ้ามี)                                     │                        │
│   │  3. คลิก "ยืนยันคำร้อง"                                       │                        │
│   │     ✅ ระบบจะจองของไว้ให้ทันที                               │                        │
│   │     📧 รอการอนุมัติจากกองกลาง                                │                        │
│   └───────────────────────────────────────────────────────────┘                        │
│                                                                                         │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│                                                                                         │
│   🔹 การยกเลิกคำร้อง                                                                    │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│   ┌───────────────────────────────────────────────────────────┐                        │
│   │  1. ไปที่แท็บ "คำร้องทั้งหมด"                                 │                        │
│   │  2. หาคำร้องที่ต้องการยกเลิก                                   │                        │
│   │  3. คลิกปุ่ม "ยกเลิก"                                         │                        │
│   │  4. เลือกเหตุผลในการยกเลิก                                    │                        │
│   │  5. คลิก "ยืนยันยกเลิก"                                       │                        │
│   │     ✅ ของที่จองไว้จะถูกคืนกลับกองกลางทันที                   │                        │
│   │                                                             │                        │
│   │  ⚠️ ยกเลิกได้เฉพาะคำร้องที่ยังไม่ถูกส่ง                        │                        │
│   └───────────────────────────────────────────────────────────┘                        │
│                                                                                         │
│   ═══════════════════════════════════════════════════════════════════════════════════  │
│                                                                                         │
│   🔹 การยืนยันรับของ                                                                    │
│   ──────────────────────────────────────────────────────────────────────────────────── │
│   ┌───────────────────────────────────────────────────────────┐                        │
│   │  1. เมื่อได้รับของจากกองกลาง                                  │                        │
│   │  2. ไปที่คำร้องที่มีสถานะ "กำลังส่ง"                            │                        │
│   │  3. ตรวจสอบของที่ได้รับ                                       │                        │
│   │  4. คลิก "ยืนยันรับของ"                                       │                        │
│   │     ✅ สต็อกของศูนย์จะถูกอัพเดททันที                          │                        │
│   └───────────────────────────────────────────────────────────┘                        │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

10. Appendix
10.1 Status Definitions
Statusรหัสสีเงื่อนไขคำอธิบาย🟢 Normal#10B981มี ≥ 80%มีของเพียงพอ🟡 Warning#F59E0Bมี 50-79%เริ่มขาดแคลน ควรเตรียมเบิก🔴 Critical#EF4444มี < 50%วิกฤต ต้องการความช่วยเหลือเร่งด่วน🔵 Excess#3B82F6มี > 120%มีเกิน สามารถกระจายให้ศูนย์อื่นได้
10.2 Request Status Flow
StatusคำอธิบายActions ที่ทำได้⏳ Pendingรอการอนุมัติอนุมัติ, ยกเลิก✅ Approvedอนุมัติแล้ว รอจัดส่งส่งของ, ยกเลิก🚚 Shippingกำลังจัดส่งยืนยันรับของ✓ Completedส่งสำเร็จแล้ว-❌ Cancelledยกเลิกแล้ว-
10.3 Stock Transaction Types
Typeคำอธิบายผลกระทบreceiveรับของบริจาคเข้า+total, +availablereserveจองของ (สร้างคำร้อง)+reserved, -availablereleaseคืนของ (ยกเลิกคำร้อง)-reserved, +availabledeductตัดของ (ส่งสำเร็จ)-total, -reservedadjustปรับปรุงสต็อก±total

📞 Contact & Support
หากมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อได้ที่ทีมพัฒนา

เอกสารนี้จัดทำเมื่อ: มกราคม 2568
Version: 1.0