# NCSA Zero Trust Cyber Mission — ภาพรวมโปรเจค

โปรเจคนี้เป็นงานออกแบบ UI (Claude Design canvas / artifact) สำหรับหน่วยงาน **NCSA** (สำนักงานคณะกรรมการการรักษาความมั่นคงปลอดภัยไซเบอร์แห่งชาติ) มีเนื้อหาเกี่ยวกับ **Zero Trust Security** โดยแบ่งเป็น 2 ส่วนหลัก คือเว็บแอดมิน และเกมฝึกอบรมด้านความปลอดภัยไซเบอร์

## ไฟล์หลัก (root)

- **`NCSA Admin Console (standalone).html`** — ไฟล์ HTML แบบ "bundled/standalone" ที่แพ็กทุกอย่าง (ฟอนต์, สคริปต์, asset) ไว้ในไฟล์เดียว เพื่อเปิดดูได้โดยไม่ต้องพึ่งอินเทอร์เน็ต/เซิร์ฟเวอร์ เป็น export ของไฟล์ `NCSA Admin Console.dc.html`
- **`NCSA Zero Trust Cyber Mission (standalone).html`** — ไฟล์ HTML แบบ standalone เช่นกัน เป็น export ของไฟล์ `NCSA Zero Trust Cyber Mission.dc.html`

ทั้งสองไฟล์นี้เป็น "ตัวห่อ" (bundler wrapper) ที่โหลด asset แบบ base64 แล้ว unpack ตอนรันบนเบราว์เซอร์ — เนื้อหา/ดีไซน์จริงอยู่ในไฟล์ `.dc.html` ในโฟลเดอร์ `UI mockups scope questions/`

## โฟลเดอร์ `UI mockups scope questions/`

- **`NCSA Admin Console.dc.html`** — ต้นแบบ (source) ของหน้าเว็บ **"NCSA · Admin Console (Website)"**
  ธีมสี navy/แดง (#0d1a33, #e2231c) ใช้ฟอนต์ Chakra Petch + Noto Sans Thai
  มีแท็บเมนูด้านบน และหน้า Home แบบ dashboard พร้อมเนื้อหาสอน/อธิบายเรื่อง Zero Trust เช่น:
  - Multi-Factor Authentication (MFA)
  - Device Verification
  - Least Privilege Access
  - Temporary Access (Just-In-Time)
  - Session Control
  - Continuous Monitoring
  แต่ละหัวข้อมีคำอธิบาย + คำถามแบบเลือกตอบ (quiz) เป็นภาษาไทย ดูเหมือนเป็นหน้า **แอดมิน/เนื้อหาให้ความรู้** เกี่ยวกับหลักการ Zero Trust

- **`NCSA Zero Trust Cyber Mission.dc.html`** — ต้นแบบของ **เกม/สถานการณ์จำลอง (mission-based training game)** มีหน้าจอลำดับ:
  1. `Join + Lobby` — เข้าร่วมเกม/ห้อง
  2. `Mission Select` — เลือกภารกิจ
  3. `Mission Alert` — แจ้งเตือนสถานการณ์ (มีตัวอย่าง alert: login ผิดปกติจากต่างประเทศ, มือถือที่ไม่ลงทะเบียน, ยังไม่ผ่าน MFA)
  4. `Security Decision` — ให้ผู้เล่นตัดสินใจมาตรการรับมือ (ระงับ session, block, แจ้งทีม security ฯลฯ) พร้อมระดับความเสี่ยง (low/medium/high/critical) และรูปแบบคำถาม (เลือก 1 ข้อ / เลือกหลายข้อ / เรียงลำดับ / วิเคราะห์หลักฐาน)
  5. `Mission Outcome` — ผลลัพธ์ของภารกิจ (จัดระดับคำตอบเป็น recommended/acceptable/risky/dangerous)
  6. `Security Debrief` — สรุปบทเรียนท้ายเกม
  รองรับหลายผู้เล่น (มี `players`, `isMe` เป็นต้น) — คล้ายเกมกลุ่ม/ห้องเรียนสำหรับฝึกตัดสินใจด้าน Zero Trust

- **`support.js`** — ไลบรารี runtime เบื้องหลัง (~1900 บรรทัด) ของ Claude Design canvas framework (`<x-dc>`, `sc-if`, `sc-for` เป็นต้น) ใช้เรนเดอร์ไฟล์ `.dc.html` ทั้งสองข้างต้น ไม่ใช่โค้ดเฉพาะโปรเจค

- **`.thumbnail`** — ไฟล์ภาพตัวอย่าง (WebP) ของแคนวาสดีไซน์

- **โฟลเดอร์ `uploads/`** — ไฟล์รูปภาพที่ใช้ประกอบงานออกแบบ ได้แก่:
  - `NCSA logo.png` — โลโก้ NCSA
  - `images.jpg`, `LINE_ALBUM_2026.2.9 _1_260209_2.jpg` — รูปอ้างอิง/ภาพประกอบ
  - `draw-*.png` (9 ไฟล์) — ภาพร่าง/สเก็ตช์หรือภาพหน้าจอที่วาดประกอบการออกแบบ UI

## สรุป

โปรเจคนี้คือ **งานออกแบบ (UI mockup)** สำหรับระบบให้ความรู้และฝึกอบรมด้าน **Zero Trust Cybersecurity** ของ NCSA ประกอบด้วย 2 ส่วน:
1. **Admin Console** — หน้าเว็บให้ความรู้/จัดการเนื้อหาเกี่ยวกับหลักการ Zero Trust (MFA, Device Verification, Least Privilege ฯลฯ)
2. **Zero Trust Cyber Mission** — เกมสถานการณ์จำลอง (mission-based game) ให้ผู้เล่นฝึกตัดสินใจรับมือภัยไซเบอร์ตามหลัก Zero Trust แบบ real-time พร้อมระบบให้คะแนน/สรุปผล

ยังไม่พบเอกสาร requirement/spec แยกต่างหาก — เนื้อหาทั้งหมด (ข้อความ, คำถาม, ตัวเลือก) ฝังอยู่ในไฟล์ `.dc.html` โดยตรง
