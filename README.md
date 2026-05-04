# เว็บไซต์ Private Violin School

เปิด `index.html` เพื่อดูหน้าเว็บไซต์หลัก และเปิด `online-course.html` เพื่อดูหน้าแผนคอร์สออนไลน์

## สิ่งที่ควรแก้ก่อนใช้งานจริง

- เปลี่ยนชื่อโรงเรียนใน `index.html` และ `online-course.html`
- ใช้ Facebook Page หลักที่ `https://www.facebook.com/profile.php?id=61561505157841`, LINE ID `pun1852` และเปลี่ยน `hello@yourviolinschool.com`, `+66 00 000 0000` เป็นช่องทางจริงของคุณ
- ฟอร์มสมัครเรียนส่งผ่าน Formspree endpoint `https://formspree.io/f/xwvajdvg` แล้ว
- เปลี่ยน `assets/hero-violin-school.png` เป็นรูปครูหรือสตูดิโอจริงเมื่อพร้อม
- เปลี่ยนรูปโปรไฟล์ผู้สอน 3 รูปใน `assets/profile/` ได้ โดยใช้ชื่อไฟล์เดิม
- เปลี่ยนภาพบรรยากาศการเรียน 6 รูปใน `assets/gallery/` ได้ โดยใช้ชื่อไฟล์เดิม
- เปลี่ยนวิดีโอ 3 ไฟล์ใน `videos/` เป็นคลิปจริง โดยใช้ชื่อไฟล์เดิมในโฟลเดอร์ `videos/`

## ตารางเวลาครู + Supabase

หน้า `index.html#schedule` เชื่อม Supabase แล้วด้วย Project URL:

```text
https://zouaheonywnpygxageyl.supabase.co
```

ตารางที่ใช้:

- `profiles` สำหรับเก็บ role ของครู
- `teacher_availability` สำหรับวันว่าง/วันเต็มและช่วงเวลา

ตารางหน้า `index.html#schedule` จะอ่านจาก Supabase ให้ทุกคนดูได้ ส่วนการบันทึกตารางให้ครูใช้หน้าแยก:

- `teacher-login.html` สำหรับเข้าสู่ระบบครู
- `teacher-schedule.html` สำหรับจัดการวันว่าง วันเต็ม และช่วงเวลา

ถ้ายังไม่ได้ตั้ง policy ให้ครบ ให้รัน SQL ใน `supabase-schedule-policies.sql` หรือใช้ชุดนี้ใน Supabase SQL Editor:

```sql
alter table public.profiles enable row level security;
alter table public.teacher_availability enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Everyone can view teacher availability"
on public.teacher_availability
for select
to anon, authenticated
using (true);

create policy "Teachers can insert availability"
on public.teacher_availability
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
);

create policy "Teachers can update availability"
on public.teacher_availability
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
);

create policy "Teachers can delete availability"
on public.teacher_availability
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'teacher'
  )
);
```

หลังสร้าง user ครูใน Supabase Authentication แล้ว ให้เอา User UID มาเพิ่มสิทธิ์:

```sql
insert into public.profiles (id, display_name, role)
values ('USER_UID_ของครู', 'ครูโอม', 'teacher');
```

ถ้า Supabase ยังเชื่อมไม่ได้ หน้าเว็บจะกลับไปใช้ตารางตัวอย่างและ localStorage ชั่วคราว

## แนวทางคอร์สออนไลน์

หน้า online course แยกออกเป็น 3 หน้า:

- `online-course.html` สำหรับแนะนำคอร์ส เลือกคอร์ส ค้นหา และดู lesson outline
- `student-login.html` สำหรับนักเรียน login หลังชำระเงิน
- `student-course.html` สำหรับหน้าเรียนจริงหลัง login มี Vimeo player และรายการบทเรียน
- ระบบยืนยันสิทธิ์หลังชำระเงิน โดยบัญชี demo ตอนนี้คือ `student@ohmviolin.com` / `violin2026`
- Prototype นี้จำลองสถานะจ่ายเงินด้วย JavaScript/localStorage เท่านั้น ยังไม่ใช่ระบบป้องกันวิดีโอสำหรับ production
