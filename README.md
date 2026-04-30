# เว็บไซต์ Private Violin School

เปิด `index.html` เพื่อดูหน้าเว็บไซต์หลัก และเปิด `online-course.html` เพื่อดูหน้าแผนคอร์สออนไลน์

## สิ่งที่ควรแก้ก่อนใช้งานจริง

- เปลี่ยนชื่อโรงเรียนใน `index.html` และ `online-course.html`
- ใช้ Facebook Page หลักที่ `https://www.facebook.com/profile.php?id=61561505157841`, LINE ID `pun1852` และเปลี่ยน `hello@yourviolinschool.com`, `+66 00 000 0000` เป็นช่องทางจริงของคุณ
- ฟอร์มสมัครเรียนส่งผ่าน Formspree endpoint `https://formspree.io/f/xwvajdvg` แล้ว
- เปลี่ยน `assets/hero-violin-school.png` เป็นรูปครูหรือสตูดิโอจริงเมื่อพร้อม
- เปลี่ยนรูปโปรไฟล์ผู้สอน 3 รูปใน `assets/profile/` ได้ โดยใช้ชื่อไฟล์เดิม:
  - `teacher-profile-01.png`
  - `teacher-profile-02.png`
  - `teacher-profile-03.png`
- เปลี่ยนภาพบรรยากาศการเรียน 6 รูปใน `assets/gallery/` ได้ โดยใช้ชื่อไฟล์เดิม:
  - `learning-atmosphere-01.png`
  - `learning-atmosphere-02.png`
  - `learning-atmosphere-03.png`
  - `learning-atmosphere-04.png`
  - `learning-atmosphere-05.png`
  - `learning-atmosphere-06.png`
- เปลี่ยนวิดีโอ 3 ไฟล์ใน `videos/` เป็นคลิปจริง โดยใช้ชื่อไฟล์เดิม:
  - `violin-performance.mp4`
  - `ensemble-orchestra.mp4`
  - `teaching-motivation.mp4`
- ตารางเวลาครูในหน้าแรกใช้ slot 1 ชั่วโมงเป็นค่าเริ่มต้น แก้ตารางรายสัปดาห์ได้ที่ `teacherWeeklySlots` และแก้วันพิเศษได้ที่ `teacherDateOverrides` ใน `script.js`; หน้าเว็บมีแผง `จัดการตารางครู` สำหรับบันทึก override ลง browser ด้วย

## แนวทางคอร์สออนไลน์

หน้า online course แยกออกเป็น 3 หน้า:

- `online-course.html` สำหรับแนะนำคอร์ส เลือกคอร์ส ค้นหา และดู lesson outline
- `student-login.html` สำหรับนักเรียน login หลังชำระเงิน
- `student-course.html` สำหรับหน้าเรียนจริงหลัง login มี Vimeo player และรายการบทเรียน
- ระบบยืนยันสิทธิ์หลังชำระเงิน โดยบัญชี demo ตอนนี้คือ `student@ohmviolin.com` / `violin2026`
- บทเรียนสั้นเป็นตอน
- เอกสารประกอบการซ้อมให้ดาวน์โหลด
- ระบบติดตามความก้าวหน้า
- ช่องทางติดต่อสอบถามแทนระบบลงทะเบียนรอล่วงหน้า
- เส้นทางต่อยอดเข้าสู่คอร์สส่วนตัว

## Vimeo สำหรับคอร์สออนไลน์

- หน้า `online-course.html` มี Vimeo player ตัวอย่างอยู่ในระบบนักเรียนแล้ว
- เปลี่ยนค่า `data-vimeo-id="76979871"` เป็น Vimeo video ID จริงของแต่ละบทเรียน
- ตัว iframe จะเริ่มเป็น `about:blank` และโหลด Vimeo หลังนักเรียนที่มีสถานะ paid login สำเร็จ
- สำหรับคอร์สเสียเงินจริง แนะนำใช้ Vimeo privacy แบบจำกัดโดเมนเว็บไซต์ และใช้ระบบ backend ตรวจสิทธิ์นักเรียนก่อนแสดงบทเรียน
- Prototype นี้จำลองสถานะจ่ายเงินด้วย JavaScript/localStorage เท่านั้น ยังไม่ใช่ระบบป้องกันวิดีโอสำหรับ production
