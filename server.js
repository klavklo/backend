const express = require('express');
const cors = require('cors');
const knex = require('knex');

const app = express();
const port = 3000;

// 1. อนุญาตให้ Angular (ซึ่งมักรันอยู่พอร์ต 4200) ส่งข้อมูลเข้ามาได้
app.use(cors());
// 2. ให้ Express อ่านข้อมูลที่ส่งมาเป็น JSON ได้
app.use(express.json());

// 3. ตั้งค่าเชื่อมต่อ Database ด้วย Knex (ใส่ IP, User, Pass ที่นี่!)
const db = knex({
  client: 'mysql2',
  connection: {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',      // เช่น gateway01.ap-southeast...
    port: 4000,                        // TiDB ใช้พอร์ต 4000
    user: '9mtjDPHMj3SjPTb.root',      // เช่น xxxxxx.root
    password: 'flFlYxgbQwrLAN5s',     
    database: 'test',                  // ชื่อฐานข้อมูลเริ่มต้นคือ test
    ssl: {
      rejectUnauthorized: true         // สำคัญ! ต้องใส่บรรทัดนี้ ไม่งั้น TiDB จะเตะออก
    }
  }
});

// ==========================================
// 4. สร้าง API Endpoints (ให้ Angular มาเรียกใช้)
// ==========================================

// GET (ดึงข้อมูลพนักงานทั้งหมด) - แทนที่ MockAPI เดิม
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db('employees').select('*'); // ดึงข้อมูลจากตาราง employees
    res.json(employees);
  } catch (err) {
    console.error("Database Error:", err); // <--- เพิ่มบรรทัดนี้
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
  }
});

// POST (เพิ่มข้อมูล)
app.post('/api/employees', async (req, res) => {
  try {
    const newEmployee = req.body; // ข้อมูลที่ Angular ส่งมา
    await db('employees').insert(newEmployee);
    res.json({ message: 'บันทึกสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'บันทึกไม่สำเร็จ' });
  }
});

// PUT (อัปเดตข้อมูล)
app.put('/api/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    await db('employees').where('id', id).update(updateData);
    res.json({ message: 'แก้ไขสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'แก้ไขไม่สำเร็จ' });
  }
});

// DELETE (ลบข้อมูล)
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db('employees').where('id', id).del();
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'ลบไม่สำเร็จ' });
  }
});

// ==========================================

// 5. สั่งรันเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Backend API รันอยู่ที่ http://localhost:${port}`);
});