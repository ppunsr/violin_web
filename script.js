const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const profileFlipCard = document.querySelector(".profile-flip-card");

if (profileFlipCard) {
  const profileImages = Array.from(profileFlipCard.querySelectorAll(".profile-flip-stage img"));
  const profileDots = Array.from(profileFlipCard.querySelectorAll(".profile-flip-dots span"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const advanceProfileCard = () => {
    if (profileFlipCard.dataset.flipping === "true" || profileImages.length < 2) {
      return;
    }

    const currentIndex = Math.max(0, profileImages.findIndex((image) => image.classList.contains("is-active")));
    const nextIndex = (currentIndex + 1) % profileImages.length;

    profileFlipCard.dataset.flipping = "true";
    profileFlipCard.classList.add("is-flipping");

    window.setTimeout(() => {
      profileImages[currentIndex].classList.remove("is-active");
      profileDots[currentIndex]?.classList.remove("is-active");
      profileImages[nextIndex].classList.add("is-active");
      profileDots[nextIndex]?.classList.add("is-active");
    }, 240);

    window.setTimeout(() => {
      profileFlipCard.classList.remove("is-flipping");
      profileFlipCard.dataset.flipping = "false";
    }, 540);
  };

  profileFlipCard.addEventListener("click", advanceProfileCard);

  if (!prefersReducedMotion) {
    window.setInterval(advanceProfileCard, 5200);
  }
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function isPlaceholderFormEndpoint(endpoint) {
  return !endpoint || endpoint.includes("REPLACE_WITH_FORM_ID") || endpoint.includes("your-form-id");
}

function bindApplicationForm(formId, statusId) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  const successPanel = document.getElementById("applicationSuccessPanel");
  const submitButton = form?.querySelector("[type='submit']");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = form.getAttribute("action") || "";

    if (isPlaceholderFormEndpoint(endpoint)) {
      status.textContent = "ฟอร์มพร้อมใช้งานแล้ว เหลือใส่ Formspree endpoint จริงใน action ของ applyForm";
      return;
    }

    status.textContent = "กำลังส่งใบสมัคร...";
    if (successPanel) {
      successPanel.hidden = true;
    }
    if (submitButton) {
      submitButton.disabled = true;
    }

    const formData = new FormData(form);
    formData.append("submittedAt", new Date().toISOString());

    try {
      const response = await fetch(endpoint, {
        method: form.method || "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      status.textContent = "ส่งใบสมัครเรียบร้อยแล้ว";

      if (successPanel) {
        successPanel.hidden = false;
      }
    } catch {
      status.textContent = "ยังส่งใบสมัครไม่สำเร็จ กรุณาลองอีกครั้ง หรือทัก LINE / Facebook โดยตรง";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

bindApplicationForm("applyForm", "formStatus");

const todayAvailabilityDate = document.getElementById("todayAvailabilityDate");
const todaySlotList = document.getElementById("todaySlotList");
const selectedSlotNote = document.getElementById("selectedSlotNote");
const scheduleApplyLink = document.getElementById("scheduleApplyLink");
const preferredTimeInput = document.getElementById("preferredTimeInput");
const preferredTimePreview = document.getElementById("preferredTimePreview");
const preferredTimePreviewText = preferredTimePreview?.querySelector("strong");
const scheduleMonthLabel = document.getElementById("scheduleMonthLabel");
const availabilityCalendar = document.getElementById("availabilityCalendar");
const scheduleMonthButtons = Array.from(document.querySelectorAll("[data-schedule-month]"));
const scheduleManageDate = document.getElementById("scheduleManageDate");
const scheduleStatusButtons = Array.from(document.querySelectorAll("[data-schedule-status]"));
const hourlySlotPicker = document.getElementById("hourlySlotPicker");
const customSlotInput = document.getElementById("customSlotInput");
const scheduleSaveButton = document.getElementById("scheduleSaveButton");
const scheduleResetButton = document.getElementById("scheduleResetButton");
const scheduleManagerStatus = document.getElementById("scheduleManagerStatus");
const scheduleConnectionStatus = document.getElementById("scheduleConnectionStatus");
const teacherAuthCard = document.getElementById("teacherAuthCard");
const teacherLoginEmail = document.getElementById("teacherLoginEmail");
const teacherLoginPassword = document.getElementById("teacherLoginPassword");
const teacherLoginButton = document.getElementById("teacherLoginButton");
const teacherLogoutButton = document.getElementById("teacherLogoutButton");
const teacherAuthStatus = document.getElementById("teacherAuthStatus");
const teacherSessionBar = document.getElementById("teacherSessionBar");
const teacherSessionText = document.getElementById("teacherSessionText");

const SUPABASE_URL = "https://zouaheonywnpygxageyl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWFoZW9ueXducHlneGFnZXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTcxNjgsImV4cCI6MjA5Mjg3MzE2OH0.Tf_NJG32h2gC2LvJK5eT3gse6B1rdsK84EeYbnzQgQQ";
const SCHEDULE_STORAGE_KEY = "violinTeacherScheduleOverrides";
const hourlySlotOptions = [
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00"
];

const teacherWeeklySlots = {
  0: [],
  1: ["16:00-17:00", "17:00-18:00", "18:00-19:00"],
  2: ["18:00-19:00", "19:00-20:00"],
  3: [],
  4: ["17:00-18:00", "18:00-19:00", "19:00-20:00"],
  5: ["16:00-17:00", "17:00-18:00"],
  6: ["10:00-11:00", "11:00-12:00", "14:00-15:00", "15:00-16:00"]
};

const teacherDateOverrides = {
  "2026-05-02": { status: "full", slots: [] },
  "2026-05-07": { status: "open", slots: ["17:00-18:00", "19:00-20:00"] },
  "2026-05-09": { status: "open", slots: ["11:00-12:00", "15:00-16:00"] },
  "2026-05-15": { status: "full", slots: [] },
  "2026-05-23": { status: "open", slots: ["10:00-11:00", "11:00-12:00", "14:00-15:00"] }
};

const thaiMonthFormatter = new Intl.DateTimeFormat("th-TH", {
  month: "long",
  year: "numeric"
});

const thaiFullDateFormatter = new Intl.DateTimeFormat("th-TH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let visibleScheduleMonth = new Date();
let selectedScheduleDate = new Date();
let selectedScheduleSlot = "";
let teacherScheduleOverrides = loadTeacherScheduleOverrides();
let teacherAuthSession = null;
let teacherProfile = null;
let scheduleUsesSupabase = false;

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeScheduleSlots(slots) {
  const uniqueSlots = Array.from(new Set(slots.filter(Boolean)));
  const hourlySlots = hourlySlotOptions.filter((slot) => uniqueSlots.includes(slot));
  const customSlots = uniqueSlots.filter((slot) => !hourlySlotOptions.includes(slot));
  return [...hourlySlots, ...customSlots];
}

function loadTeacherScheduleOverrides() {
  return {
    ...teacherDateOverrides,
    ...loadStoredTeacherScheduleOverrides()
  };
}

function loadStoredTeacherScheduleOverrides() {
  try {
    const savedOverrides = JSON.parse(window.localStorage.getItem(SCHEDULE_STORAGE_KEY) || "{}");
    return savedOverrides && typeof savedOverrides === "object" ? savedOverrides : {};
  } catch {
    return {};
  }
}

function saveTeacherScheduleOverrides() {
  try {
    window.localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(teacherScheduleOverrides));
    return true;
  } catch {
    return false;
  }
}

function setScheduleConnectionStatus(message, tone = "warning") {
  if (!scheduleConnectionStatus) {
    return;
  }

  scheduleConnectionStatus.textContent = message;
  scheduleConnectionStatus.classList.toggle("is-connected", tone === "connected");
  scheduleConnectionStatus.classList.toggle("is-warning", tone === "warning");
  scheduleConnectionStatus.classList.toggle("is-error", tone === "error");
}

function updateTeacherAuthStatus(message = "") {
  if (teacherAuthStatus) {
    teacherAuthStatus.textContent = message;
  }
}

function scheduleRowToOverride(row) {
  return {
    status: row.status === "full" ? "full" : "open",
    slots: normalizeScheduleSlots(Array.isArray(row.slots) ? row.slots : [])
  };
}

function applyRemoteScheduleRows(rows = []) {
  const remoteOverrides = rows.reduce((overrides, row) => {
    if (row.date) {
      overrides[row.date] = scheduleRowToOverride(row);
    }
    return overrides;
  }, {});

  teacherScheduleOverrides = {
    ...teacherDateOverrides,
    ...remoteOverrides
  };
}

async function loadSupabaseSchedule() {
  if (!supabaseClient || !availabilityCalendar) {
    return false;
  }

  setScheduleConnectionStatus("กำลังโหลดตารางเวลาจาก Supabase...", "warning");
  const { data, error } = await supabaseClient
    .from("teacher_availability")
    .select("date,status,slots")
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  applyRemoteScheduleRows(data || []);
  scheduleUsesSupabase = true;
  setScheduleConnectionStatus("เชื่อมต่อ Supabase แล้ว ตารางนี้อ่านข้อมูลจากฐานข้อมูลจริง", "connected");
  return true;
}

async function loadTeacherProfile(session) {
  if (!supabaseClient || !session?.user?.id) {
    teacherProfile = null;
    return null;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("display_name,role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    teacherProfile = null;
    updateTeacherAuthStatus("เข้าสู่ระบบแล้ว แต่ยังตรวจสิทธิ์ครูไม่ได้ ถ้าบันทึกไม่ผ่านให้เช็ก policy ของ profiles");
    return null;
  }

  teacherProfile = data;
  return data;
}

function renderTeacherAuthState() {
  const isSignedIn = Boolean(teacherAuthSession?.user);
  const displayName = teacherProfile?.display_name || teacherAuthSession?.user?.email || "ครู";

  if (teacherAuthCard) {
    teacherAuthCard.hidden = isSignedIn;
  }

  if (teacherSessionBar) {
    teacherSessionBar.hidden = !isSignedIn;
  }

  if (teacherSessionText && isSignedIn) {
    const roleText = teacherProfile?.role === "teacher" ? "พร้อมแก้ตาราง" : "รอตรวจสิทธิ์ครู";
    teacherSessionText.textContent = `เข้าสู่ระบบ: ${displayName} (${roleText})`;
  }

  updateScheduleManagerDisabledState();
}

function maybeRedirectTeacherAfterLogin() {
  const redirect = teacherLoginButton?.dataset.loginRedirect;

  if (redirect && teacherAuthSession?.user && teacherProfile?.role === "teacher") {
    window.location.href = redirect;
  }
}

async function refreshTeacherSession() {
  if (!supabaseClient) {
    renderTeacherAuthState();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  teacherAuthSession = data.session;

  if (teacherAuthSession) {
    await loadTeacherProfile(teacherAuthSession);
  } else {
    teacherProfile = null;
  }

  renderTeacherAuthState();
}

function canSaveScheduleToSupabase() {
  return Boolean(supabaseClient && teacherAuthSession?.user && teacherProfile?.role === "teacher");
}

async function saveScheduleOverride(dateKey, override) {
  teacherScheduleOverrides[dateKey] = override;

  if (canSaveScheduleToSupabase()) {
    const { error } = await supabaseClient
      .from("teacher_availability")
      .upsert(
        {
          date: dateKey,
          status: override.status,
          slots: override.slots || [],
          updated_by: teacherAuthSession.user.id,
          updated_at: new Date().toISOString()
        },
        { onConflict: "date" }
      );

    if (error) {
      throw error;
    }

    scheduleUsesSupabase = true;
    return "supabase";
  }

  return saveTeacherScheduleOverrides() ? "local" : "memory";
}

async function resetScheduleOverride(dateKey) {
  delete teacherScheduleOverrides[dateKey];

  if (canSaveScheduleToSupabase()) {
    const { error } = await supabaseClient
      .from("teacher_availability")
      .delete()
      .eq("date", dateKey);

    if (error) {
      throw error;
    }

    scheduleUsesSupabase = true;
    return "supabase";
  }

  return saveTeacherScheduleOverrides() ? "local" : "memory";
}

function getAvailableSlotsForDate(date) {
  const dateKey = formatDateKey(date);
  const dayOverride = teacherScheduleOverrides[dateKey];

  if (dayOverride) {
    if (dayOverride.status === "full") {
      return [];
    }

    return normalizeScheduleSlots([...(dayOverride.slots || []), ...(dayOverride.customSlots || [])]);
  }

  return normalizeScheduleSlots(teacherWeeklySlots[date.getDay()] || []);
}

function getScheduleStatus() {
  return scheduleStatusButtons.find((button) => button.classList.contains("is-active"))?.dataset.scheduleStatus || "open";
}

function isScheduleEditorLocked() {
  return Boolean(supabaseClient && !canSaveScheduleToSupabase());
}

function updateScheduleManagerDisabledState() {
  const isFull = getScheduleStatus() === "full";
  const isLocked = isScheduleEditorLocked();

  if (scheduleManageDate) {
    scheduleManageDate.disabled = isLocked;
  }

  scheduleStatusButtons.forEach((button) => {
    button.disabled = isLocked;
  });

  if (hourlySlotPicker) {
    hourlySlotPicker.classList.toggle("is-disabled", isFull || isLocked);
    hourlySlotPicker.querySelectorAll("input").forEach((input) => {
      input.disabled = isFull || isLocked;
    });
  }

  if (customSlotInput) {
    customSlotInput.disabled = isFull || isLocked;
  }

  if (scheduleSaveButton) {
    scheduleSaveButton.disabled = isLocked;
  }

  if (scheduleResetButton) {
    scheduleResetButton.disabled = isLocked;
  }
}

function setScheduleStatus(status) {
  scheduleStatusButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scheduleStatus === status);
  });
  updateScheduleManagerDisabledState();
}

function renderHourlySlotPicker(selectedSlots = []) {
  if (!hourlySlotPicker) {
    return;
  }

  hourlySlotPicker.replaceChildren(...hourlySlotOptions.map((slot) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const span = document.createElement("span");

    input.type = "checkbox";
    input.value = slot;
    input.checked = selectedSlots.includes(slot);
    span.textContent = slot;
    label.append(input, span);
    return label;
  }));

  updateScheduleManagerDisabledState();
}

function renderScheduleManager(date = selectedScheduleDate) {
  if (!scheduleManageDate || !hourlySlotPicker) {
    return;
  }

  const dateKey = formatDateKey(date);
  const dayOverride = teacherScheduleOverrides[dateKey];
  const defaultSlots = normalizeScheduleSlots(teacherWeeklySlots[date.getDay()] || []);
  const selectedSlots = dayOverride
    ? normalizeScheduleSlots([...(dayOverride.slots || []), ...(dayOverride.customSlots || [])])
    : defaultSlots;
  const status = dayOverride?.status || (selectedSlots.length ? "open" : "full");
  const customSlots = selectedSlots.filter((slot) => !hourlySlotOptions.includes(slot));

  scheduleManageDate.value = dateKey;
  renderHourlySlotPicker(selectedSlots);
  setScheduleStatus(status);

  if (customSlotInput) {
    customSlotInput.value = customSlots.join(", ");
  }

  if (scheduleManagerStatus) {
    scheduleManagerStatus.textContent = "";
  }
}

function clearSelectedScheduleSlot() {
  selectedScheduleSlot = "";

  if (preferredTimeInput) {
    preferredTimeInput.value = "";
  }

  if (preferredTimePreview) {
    preferredTimePreview.hidden = true;
  }

  if (selectedSlotNote) {
    selectedSlotNote.textContent = "เลือกช่วงเวลาว่างเพื่อแนบไปกับใบสมัคร";
  }
}

function setSelectedScheduleSlot(slot) {
  selectedScheduleSlot = slot;

  const selectedDateText = thaiFullDateFormatter.format(selectedScheduleDate);
  const preferredTime = `${selectedDateText} เวลา ${slot}`;

  if (preferredTimeInput) {
    preferredTimeInput.value = preferredTime;
  }

  if (preferredTimePreview && preferredTimePreviewText) {
    preferredTimePreview.hidden = false;
    preferredTimePreviewText.textContent = preferredTime;
  }

  if (selectedSlotNote) {
    selectedSlotNote.textContent = `เลือกไว้: ${preferredTime}`;
  }

  renderSelectedDayAvailability();
}

function renderSelectedDayAvailability() {
  if (!todayAvailabilityDate || !todaySlotList) {
    return;
  }

  const availableSlots = getAvailableSlotsForDate(selectedScheduleDate);

  todayAvailabilityDate.textContent = thaiFullDateFormatter.format(selectedScheduleDate);

  if (!availableSlots.length) {
    const fullMessage = document.createElement("div");
    fullMessage.className = "today-slot is-full";
    fullMessage.innerHTML = "<span>วันนั้นไม่มีช่วงว่าง</span><small>เลือกวันสีเขียวในปฏิทิน</small>";
    todaySlotList.replaceChildren(fullMessage);
    return;
  }

  todaySlotList.replaceChildren(...availableSlots.map((slot) => {
    const slotItem = document.createElement("button");
    slotItem.type = "button";
    slotItem.className = `today-slot${slot === selectedScheduleSlot ? " is-selected" : ""}`;
    slotItem.innerHTML = `<span>${slot}</span><small>ว่าง</small>`;
    slotItem.addEventListener("click", () => setSelectedScheduleSlot(slot));
    return slotItem;
  }));
}

function renderAvailabilityCalendar() {
  if (!scheduleMonthLabel || !availabilityCalendar) {
    return;
  }

  const year = visibleScheduleMonth.getFullYear();
  const month = visibleScheduleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = formatDateKey(new Date());
  const selectedDateKey = formatDateKey(selectedScheduleDate);
  const weekdayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const calendarItems = weekdayLabels.map((label) => {
    const weekday = document.createElement("div");
    weekday.className = "calendar-weekday";
    weekday.textContent = label;
    return weekday;
  });

  scheduleMonthLabel.textContent = thaiMonthFormatter.format(firstDay);

  for (let emptyIndex = 0; emptyIndex < firstDay.getDay(); emptyIndex += 1) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day is-empty";
    calendarItems.push(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const availableSlots = getAvailableSlotsForDate(date);
    const isAvailable = availableSlots.length > 0;
    const dateKey = formatDateKey(date);
    const dayButton = document.createElement("button");
    const isSelected = dateKey === selectedDateKey;

    dayButton.className = `calendar-day ${isAvailable ? "is-available" : "is-full"}${dateKey === todayKey ? " is-today" : ""}${isSelected ? " is-selected" : ""}`;
    dayButton.type = "button";
    dayButton.innerHTML = `
      <strong>${day}</strong>
      <small>${isAvailable ? `ว่าง ${availableSlots.length} ช่วง` : "เต็ม"}</small>
    `;
    dayButton.addEventListener("click", () => {
      selectedScheduleDate = date;
      clearSelectedScheduleSlot();
      renderSelectedDayAvailability();
      renderAvailabilityCalendar();
      renderScheduleManager(date);
    });

    calendarItems.push(dayButton);
  }

  availabilityCalendar.replaceChildren(...calendarItems);
}

function findFirstSelectableDateInMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    if (getAvailableSlotsForDate(date).length) {
      return date;
    }
  }

  return new Date(year, month, 1);
}

scheduleMonthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = Number(button.dataset.scheduleMonth || 1);
    visibleScheduleMonth = new Date(
      visibleScheduleMonth.getFullYear(),
      visibleScheduleMonth.getMonth() + direction,
      1
    );
    selectedScheduleDate = findFirstSelectableDateInMonth(
      visibleScheduleMonth.getFullYear(),
      visibleScheduleMonth.getMonth()
    );
    clearSelectedScheduleSlot();
    renderSelectedDayAvailability();
    renderAvailabilityCalendar();
    renderScheduleManager(selectedScheduleDate);
  });
});

if (scheduleApplyLink) {
  scheduleApplyLink.addEventListener("click", () => {
    if (selectedScheduleSlot) {
      return;
    }

    const firstAvailableSlot = getAvailableSlotsForDate(selectedScheduleDate)[0];
    if (firstAvailableSlot) {
      setSelectedScheduleSlot(firstAvailableSlot);
    }
  });
}

scheduleStatusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setScheduleStatus(button.dataset.scheduleStatus || "open");
  });
});

if (scheduleManageDate) {
  scheduleManageDate.addEventListener("change", () => {
    if (!scheduleManageDate.value) {
      return;
    }

    selectedScheduleDate = parseDateKey(scheduleManageDate.value);
    visibleScheduleMonth = new Date(
      selectedScheduleDate.getFullYear(),
      selectedScheduleDate.getMonth(),
      1
    );
    clearSelectedScheduleSlot();
    renderSelectedDayAvailability();
    renderAvailabilityCalendar();
    renderScheduleManager(selectedScheduleDate);
  });
}

if (scheduleSaveButton) {
  scheduleSaveButton.addEventListener("click", async () => {
    const dateKey = scheduleManageDate?.value;
    const status = getScheduleStatus();
    let nextOverride;

    if (!dateKey) {
      return;
    }

    if (status === "full") {
      nextOverride = { status: "full", slots: [] };
    } else {
      const selectedHourlySlots = hourlySlotPicker
        ? Array.from(hourlySlotPicker.querySelectorAll("input:checked")).map((input) => input.value)
        : [];
      const customSlots = (customSlotInput?.value || "")
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean) || [];
      const slots = normalizeScheduleSlots([...selectedHourlySlots, ...customSlots]);

      if (!slots.length) {
        if (scheduleManagerStatus) {
          scheduleManagerStatus.textContent = "เลือกอย่างน้อย 1 ช่วงเวลา หรือเปลี่ยนสถานะเป็นเต็ม";
        }
        return;
      }

      nextOverride = { status: "open", slots };
    }

    if (scheduleManagerStatus) {
      scheduleManagerStatus.textContent = canSaveScheduleToSupabase()
        ? "กำลังบันทึกลง Supabase..."
        : "กำลังบันทึกลงเครื่องนี้...";
    }

    if (scheduleSaveButton) {
      scheduleSaveButton.disabled = true;
    }

    try {
      const savedMode = await saveScheduleOverride(dateKey, nextOverride);
      selectedScheduleDate = parseDateKey(dateKey);
      visibleScheduleMonth = new Date(
        selectedScheduleDate.getFullYear(),
        selectedScheduleDate.getMonth(),
        1
      );
      clearSelectedScheduleSlot();
      renderSelectedDayAvailability();
      renderAvailabilityCalendar();
      renderScheduleManager(selectedScheduleDate);

      if (scheduleManagerStatus) {
        scheduleManagerStatus.textContent =
          savedMode === "supabase"
            ? "บันทึกตารางลง Supabase แล้ว"
            : savedMode === "local"
              ? "บันทึกตารางในเครื่องนี้แล้ว"
              : "บันทึกในเครื่องไม่ได้ แต่ตารางถูกอัปเดตในหน้านี้แล้ว";
      }
    } catch (error) {
      if (scheduleManagerStatus) {
        scheduleManagerStatus.textContent = `ยังบันทึกไม่สำเร็จ: ${error.message || "กรุณาเช็กสิทธิ์ครูใน Supabase"}`;
      }
    } finally {
      updateScheduleManagerDisabledState();
    }
  });
}

if (scheduleResetButton) {
  scheduleResetButton.addEventListener("click", async () => {
    const dateKey = scheduleManageDate?.value;

    if (!dateKey) {
      return;
    }

    if (scheduleManagerStatus) {
      scheduleManagerStatus.textContent = canSaveScheduleToSupabase()
        ? "กำลังลบ override ใน Supabase..."
        : "กำลังกลับไปใช้ค่าเริ่มต้น...";
    }

    if (scheduleResetButton) {
      scheduleResetButton.disabled = true;
    }

    try {
      const resetMode = await resetScheduleOverride(dateKey);
      selectedScheduleDate = parseDateKey(dateKey);
      clearSelectedScheduleSlot();
      renderSelectedDayAvailability();
      renderAvailabilityCalendar();
      renderScheduleManager(selectedScheduleDate);

      if (scheduleManagerStatus) {
        scheduleManagerStatus.textContent =
          resetMode === "supabase"
            ? "ลบ override ใน Supabase แล้ว และกลับไปใช้ค่าเริ่มต้น"
            : "กลับไปใช้ค่าเริ่มต้นแล้ว";
      }
    } catch (error) {
      if (scheduleManagerStatus) {
        scheduleManagerStatus.textContent = `ยังกลับไปใช้ค่าเริ่มต้นไม่ได้: ${error.message || "กรุณาเช็ก delete policy"}`;
      }
    } finally {
      updateScheduleManagerDisabledState();
    }
  });
}

if (teacherLoginButton) {
  teacherLoginButton.addEventListener("click", async () => {
    if (!supabaseClient) {
      updateTeacherAuthStatus("ยังโหลด Supabase client ไม่สำเร็จ กรุณาเช็กอินเทอร์เน็ตหรือ CDN");
      return;
    }

    const email = teacherLoginEmail?.value.trim();
    const password = teacherLoginPassword?.value || "";

    if (!email || !password) {
      updateTeacherAuthStatus("กรุณากรอกอีเมลและรหัสผ่านครู");
      return;
    }

    teacherLoginButton.disabled = true;
    updateTeacherAuthStatus("กำลังเข้าสู่ระบบ...");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      teacherLoginButton.disabled = false;
      updateTeacherAuthStatus(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
      return;
    }

    teacherAuthSession = data.session;
    await loadTeacherProfile(teacherAuthSession);
    renderTeacherAuthState();
    updateTeacherAuthStatus("");
    teacherLoginButton.disabled = false;
    maybeRedirectTeacherAfterLogin();
  });
}

if (teacherLogoutButton) {
  teacherLogoutButton.addEventListener("click", async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    teacherAuthSession = null;
    teacherProfile = null;
    renderTeacherAuthState();
    updateTeacherAuthStatus("ออกจากระบบครูแล้ว");

    const redirect = teacherLogoutButton.dataset.logoutRedirect;
    if (redirect && window.location.pathname.endsWith("teacher-schedule.html")) {
      window.location.href = redirect;
    }
  });
}

async function initializeTeacherAuthOnly() {
  if (!teacherLoginButton && !teacherLogoutButton && !teacherSessionBar) {
    return;
  }

  renderTeacherAuthState();

  if (!supabaseClient) {
    updateTeacherAuthStatus("ยังโหลด Supabase client ไม่สำเร็จ กรุณาเช็กอินเทอร์เน็ตหรือ CDN");
    return;
  }

  await refreshTeacherSession();
  maybeRedirectTeacherAfterLogin();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    teacherAuthSession = session;
    if (session) {
      await loadTeacherProfile(session);
    } else {
      teacherProfile = null;
    }
    renderTeacherAuthState();
  });
}

async function initializeSupabaseSchedule() {
  if (!availabilityCalendar) {
    return;
  }

  renderTeacherAuthState();

  if (!supabaseClient) {
    setScheduleConnectionStatus("ยังไม่ได้โหลด Supabase client จึงใช้ตารางตัวอย่างและ localStorage ชั่วคราว", "warning");
    return;
  }

  try {
    await refreshTeacherSession();
    await loadSupabaseSchedule();
    renderSelectedDayAvailability();
    renderAvailabilityCalendar();
    renderScheduleManager(selectedScheduleDate);

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      teacherAuthSession = session;
      if (session) {
        await loadTeacherProfile(session);
      } else {
        teacherProfile = null;
      }
      renderTeacherAuthState();
    });
  } catch (error) {
    scheduleUsesSupabase = false;
    teacherScheduleOverrides = loadTeacherScheduleOverrides();
    setScheduleConnectionStatus(
      `ยังเชื่อม Supabase ไม่สำเร็จ จึงใช้ตารางตัวอย่างก่อน: ${error.message || "กรุณาเช็ก RLS policy"}`,
      "error"
    );
    renderSelectedDayAvailability();
    renderAvailabilityCalendar();
    renderScheduleManager(selectedScheduleDate);
  }
}

renderSelectedDayAvailability();
renderAvailabilityCalendar();
renderScheduleManager(selectedScheduleDate);
initializeSupabaseSchedule();
if (!availabilityCalendar) {
  initializeTeacherAuthOnly();
}

const courseSearch = document.getElementById("courseSearch");
const courseCards = Array.from(document.querySelectorAll("[data-course-card]"));
const courseFilters = Array.from(document.querySelectorAll("[data-course-filter]"));
const courseResultStatus = document.getElementById("courseResultStatus");
const courseChipTrack = document.getElementById("courseChipTrack");
const courseChipArrows = Array.from(document.querySelectorAll("[data-chip-scroll]"));
const courseCarouselTrack = document.querySelector("[data-course-carousel-track]");
const courseCarouselButtons = Array.from(document.querySelectorAll("[data-course-carousel]"));
const courseDetailTriggers = Array.from(document.querySelectorAll("[data-course-detail-trigger]"));
const courseDetailTitle = document.getElementById("courseDetailTitle");
const courseDetailDescription = document.getElementById("courseDetailDescription");
const courseStatusLabel = document.getElementById("courseStatusLabel");
const courseStatusTitle = document.getElementById("courseStatusTitle");
const courseStatusText = document.getElementById("courseStatusText");
const lessonOutlineTitle = document.getElementById("lessonOutlineTitle");
const lessonOutlineModules = document.getElementById("lessonOutlineModules");

const courseDetailContent = {
  foundation: {
    title: "คอร์สไวโอลินพื้นฐาน 21 วัน",
    description:
      "โครงสร้างคอร์สออกแบบให้เรียนง่าย เห็นลำดับชัด และเหมาะกับนักเรียนที่ต้องการเริ่มอย่างถูกวิธี ก่อนต่อยอดไปคอร์สส่วนตัวหรือคลาสสตูดิโอ",
    statusLabel: "สถานะคอร์ส",
    statusTitle: "พร้อมสำหรับนักเรียนที่มีบัญชี",
    statusText: "ระบบจริงสามารถต่อ payment gateway และ Vimeo privacy ภายหลังได้",
    outlineTitle: "บทเรียน คอร์สไวโอลินพื้นฐาน 21 วัน",
    modules: [
      {
        title: "Lesson 1 : Day 1-3",
        summary: "พื้นฐานท่าทางและเสียงแรก",
        items: [
          {
            heading: "Day 1 : พื้นฐานการวางท่าและการจับคันชัก",
            text: "Posture, violin hold และ bow hold",
            duration: "18 นาที"
          },
          {
            heading: "Day 2 : เสียงสายเปล่าและจุดสัมผัสคันชัก",
            text: "Open string tone และ bow lane",
            duration: "22 นาที"
          },
          {
            heading: "Day 3 : วิธีซ้อมให้เสียงนิ่งขึ้น",
            text: "Daily warm-up และ practice checklist",
            duration: "25 นาที"
          },
          {
            heading: "เช็คความเข้าใจ Day 1-3",
            text: "Post Test และส่งวิดีโอสั้นเพื่อประเมิน",
            duration: "10 นาที"
          }
        ]
      },
      {
        title: "Lesson 2 : Day 4-10",
        summary: "น้ำเสียง ความแม่นยำ และระบบซ้อม",
        items: [
          {
            heading: "Day 4-6 : คุมคันชักและไดนามิก",
            text: "Bow speed, bow weight และ contact point",
            duration: "40 นาที"
          },
          {
            heading: "Day 7-10 : Intonation และการซ้อมสเกล",
            text: "Slow practice, listening routine และ scale map",
            duration: "52 นาที"
          }
        ]
      },
      {
        title: "Lesson 3 : Day 11-21",
        summary: "เตรียมเพลงและ performance routine",
        items: [
          {
            heading: "Day 11-17 : เก็บเพลงเป็นช่วง",
            text: "Phrase work, rhythm check และ recording feedback",
            duration: "1 ชม. 05 นาที"
          },
          {
            heading: "Day 18-21 : ก่อนอัดวิดีโอหรือขึ้นเวที",
            text: "Performance checklist และ mindset ก่อนเล่นจริง",
            duration: "36 นาที"
          }
        ]
      }
    ]
  },
  tone: {
    title: "Tone Lab เสียงสวยและคันชักนิ่ง",
    description:
      "คอร์สสำหรับนักเรียนที่เริ่มเล่นได้แล้วและอยากทำให้เสียงนิ่งขึ้น คุมคันชักได้สะอาดขึ้น และเข้าใจว่าคุณภาพเสียงเกิดจากอะไร",
    statusLabel: "สถานะคอร์ส",
    statusTitle: "กำลังจัดทำ",
    statusText: "เหมาะสำหรับต่อยอดหลังจบพื้นฐาน 21 วัน โครงสร้างนี้ใช้ดูทิศทางบทเรียนก่อนเปิดจริง",
    outlineTitle: "บทเรียน Tone Lab เสียงสวยและคันชักนิ่ง",
    modules: [
      {
        title: "Lesson 1 : Bow Foundation",
        summary: "วางมือขวาให้เสียงนิ่ง",
        items: [
          {
            heading: "บทเรียน 01 : Bow lane และจุดสัมผัสคันชัก",
            text: "ฝึกเส้นทางคันชักให้ตรงและคุม contact point ให้เสียงไม่แกว่ง",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 02 : Bow speed และน้ำหนักมือขวา",
            text: "เข้าใจความสัมพันธ์ระหว่างความเร็วคันชัก น้ำหนัก และความยาวเสียง",
            duration: "กำลังจัดทำ"
          }
        ]
      },
      {
        title: "Lesson 2 : Tone Control",
        summary: "ปรับสีเสียงให้คุมได้",
        items: [
          {
            heading: "บทเรียน 03 : เล่นเสียงเบาให้ยังมีแกนเสียง",
            text: "ควบคุม piano tone โดยไม่ให้เสียงบางหรือหลุดโฟกัส",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 04 : เล่นเสียงดังโดยไม่บีบเสียง",
            text: "ฝึก forte tone ให้เปิดและมั่นคงโดยไม่กดคันชักมากเกินไป",
            duration: "กำลังจัดทำ"
          }
        ]
      },
      {
        title: "Lesson 3 : Musical Tone",
        summary: "นำเสียงไปใช้กับเพลง",
        items: [
          {
            heading: "บทเรียน 05 : Legato และการต่อประโยคเสียง",
            text: "ฝึกเชื่อมเสียงให้เนียนและฟังเป็นวลีดนตรี",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 06 : Tone checklist สำหรับอัดวิดีโอ",
            text: "เช็คคุณภาพเสียงก่อนส่งงานหรือก่อนบันทึก performance",
            duration: "กำลังจัดทำ"
          }
        ]
      }
    ]
  },
  practice: {
    title: "Practice System ซ้อมให้เห็นผล",
    description:
      "คอร์สนี้ช่วยจัดระบบการซ้อมให้ชัดขึ้น แยกปัญหาออกเป็นชิ้นเล็ก วางเป้าหมายรายวัน และใช้ feedback จากการอัดวิดีโอให้เกิดผลจริง",
    statusLabel: "สถานะคอร์ส",
    statusTitle: "กำลังจัดทำ",
    statusText: "เหมาะกับนักเรียนที่ซ้อมแล้วรู้สึกวนอยู่ที่เดิม และอยากมีระบบซ้อมที่วัดผลได้",
    outlineTitle: "บทเรียน Practice System ซ้อมให้เห็นผล",
    modules: [
      {
        title: "Lesson 1 : Practice Setup",
        summary: "ตั้งระบบซ้อมก่อนเริ่ม",
        items: [
          {
            heading: "บทเรียน 01 : แยก warm-up, technique และเพลง",
            text: "จัดเวลาซ้อมให้แต่ละส่วนมีเป้าหมาย ไม่ซ้อมทุกอย่างปนกัน",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 02 : ตั้งโจทย์ซ้อมรายวัน",
            text: "เลือกปัญหาหลักเพียงไม่กี่จุดและวาง checklist ที่ทำตามได้",
            duration: "กำลังจัดทำ"
          }
        ]
      },
      {
        title: "Lesson 2 : Fixing Method",
        summary: "แก้ปัญหาอย่างเป็นขั้นตอน",
        items: [
          {
            heading: "บทเรียน 03 : Slow practice ที่ไม่ใช่แค่เล่นช้า",
            text: "ใช้ tempo ช้าเพื่อเช็คเสียง ท่าทาง นิ้ว และคันชักอย่างละเอียด",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 04 : Recording feedback",
            text: "อัดวิดีโอสั้นและดู feedback ด้วย checklist เพื่อแก้จุดที่มองไม่เห็นตอนเล่น",
            duration: "กำลังจัดทำ"
          }
        ]
      },
      {
        title: "Lesson 3 : Weekly Routine",
        summary: "ทำให้ซ้อมต่อเนื่อง",
        items: [
          {
            heading: "บทเรียน 05 : วางแผนซ้อมรายสัปดาห์",
            text: "ออกแบบ routine ที่บาลานซ์เทคนิค เพลง และการทบทวนโดยไม่หนักเกินไป",
            duration: "กำลังจัดทำ"
          }
        ]
      }
    ]
  },
  performance: {
    title: "Performance Prep เตรียมตัวแสดง",
    description:
      "คอร์สสำหรับเตรียมเพลงก่อนขึ้นเวทีหรืออัดวิดีโอ ช่วยจัดลำดับการเก็บเพลง คุมความตื่นเต้น และทำให้ performance พร้อมขึ้น",
    statusLabel: "สถานะคอร์ส",
    statusTitle: "กำลังจัดทำ",
    statusText: "เหมาะกับนักเรียนที่มีเพลงอยู่แล้วและต้องการเตรียมตัวก่อนแสดงหรือส่งวิดีโออย่างมั่นใจ",
    outlineTitle: "บทเรียน Performance Prep เตรียมตัวแสดง",
    modules: [
      {
        title: "Lesson 1 : Performance Readiness",
        summary: "เตรียมเพลงให้พร้อมเล่นจริง",
        items: [
          {
            heading: "บทเรียน 01 : แบ่งเพลงเป็น phrase และจุดเสี่ยง",
            text: "ระบุจุดที่มักพลาดและวางแผนเก็บรายละเอียดอย่างเป็นระบบ",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 02 : Run-through แบบมีเป้าหมาย",
            text: "ซ้อมเล่นยาวโดยไม่หยุด พร้อมบันทึกสิ่งที่ต้องแก้หลังจบเพลง",
            duration: "กำลังจัดทำ"
          }
        ]
      },
      {
        title: "Lesson 2 : Stage Routine",
        summary: "คุมสมาธิและความมั่นใจ",
        items: [
          {
            heading: "บทเรียน 03 : Mindset ก่อนขึ้นแสดง",
            text: "จัดการความตื่นเต้น ตั้งจังหวะหายใจ และเตรียมสมาธิก่อนเริ่มเล่น",
            duration: "กำลังจัดทำ"
          },
          {
            heading: "บทเรียน 04 : Final checklist ก่อนอัดวิดีโอ",
            text: "เช็คเสียง ท่าทาง มุมกล้อง และความพร้อมของเพลงก่อนบันทึกจริง",
            duration: "กำลังจัดทำ"
          }
        ]
      }
    ]
  }
};

function createTextElement(tagName, text) {
  const element = document.createElement(tagName);
  element.textContent = text;
  return element;
}

function renderCourseModule(module, index) {
  const detail = document.createElement("details");
  detail.className = "lesson-module";
  detail.open = index === 0;

  const summary = document.createElement("summary");
  summary.append(createTextElement("span", module.title));
  summary.append(createTextElement("small", module.summary));
  detail.append(summary);

  const group = document.createElement("div");
  group.className = "lesson-outline-group";

  module.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "locked-lesson-row";

    const icon = document.createElement("span");
    icon.className = "locked-icon";
    icon.setAttribute("aria-hidden", "true");

    row.append(icon);
    row.append(createTextElement("p", item.text));
    row.append(createTextElement("small", item.duration));

    group.append(createTextElement("h4", item.heading));
    group.append(row);
  });

  detail.append(group);
  return detail;
}

function updateCourseDetail(courseKey = "foundation") {
  if (!courseDetailTitle || !courseDetailDescription || !lessonOutlineModules) {
    return;
  }

  const detail = courseDetailContent[courseKey] || courseDetailContent.foundation;

  courseDetailTitle.textContent = detail.title;
  courseDetailDescription.textContent = detail.description;

  if (courseStatusLabel) {
    courseStatusLabel.textContent = detail.statusLabel;
  }

  if (courseStatusTitle) {
    courseStatusTitle.textContent = detail.statusTitle;
  }

  if (courseStatusText) {
    courseStatusText.textContent = detail.statusText;
  }

  if (lessonOutlineTitle) {
    lessonOutlineTitle.textContent = detail.outlineTitle;
  }

  lessonOutlineModules.replaceChildren(...detail.modules.map(renderCourseModule));

  courseCards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.courseKey === courseKey);
  });
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function getVisibleCourseCards() {
  return courseCards.filter((card) => !card.classList.contains("is-hidden"));
}

function getCourseCarouselStep() {
  const firstVisibleCard = getVisibleCourseCards()[0];

  if (!courseCarouselTrack || !firstVisibleCard) {
    return 0;
  }

  const trackStyle = window.getComputedStyle(courseCarouselTrack);
  const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "0") || 0;

  return firstVisibleCard.getBoundingClientRect().width + gap;
}

function updateCourseCarouselControls() {
  if (!courseCarouselTrack || !courseCarouselButtons.length) {
    return;
  }

  const maxScrollLeft = Math.max(0, courseCarouselTrack.scrollWidth - courseCarouselTrack.clientWidth - 2);
  const currentScrollLeft = courseCarouselTrack.scrollLeft;

  courseCarouselButtons.forEach((button) => {
    const direction = Number(button.dataset.courseCarousel || 1);
    const shouldDisable = direction < 0
      ? currentScrollLeft <= 2
      : currentScrollLeft >= maxScrollLeft;

    button.disabled = maxScrollLeft <= 2 || shouldDisable;
  });
}

function resetCourseCarouselPosition() {
  if (!courseCarouselTrack) {
    return;
  }

  courseCarouselTrack.scrollTo({ left: 0, behavior: "auto" });
  window.requestAnimationFrame(updateCourseCarouselControls);
}

function updateCourseCards() {
  if (!courseCards.length) {
    return;
  }

  const activeFilter = courseFilters.find((button) => button.classList.contains("is-active"))?.dataset.courseFilter || "all";
  const query = normalizeSearchText(courseSearch?.value);
  let visibleCount = 0;

  courseCards.forEach((card) => {
    const categories = card.dataset.category || "";
    const searchableText = normalizeSearchText(`${card.dataset.title} ${card.dataset.summary} ${categories}`);
    const matchesFilter = activeFilter === "all" || categories.split(" ").includes(activeFilter);
    const matchesSearch = !query || searchableText.includes(query);
    const isVisible = matchesFilter && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (courseResultStatus) {
    courseResultStatus.textContent = visibleCount
      ? `แสดง ${visibleCount} คอร์สที่ตรงกับการค้นหา`
      : "ยังไม่พบคอร์สที่ตรงกับคำค้นหา";
  }

  resetCourseCarouselPosition();
}

courseFilters.forEach((button) => {
  button.addEventListener("click", () => {
    courseFilters.forEach((filterButton) => filterButton.classList.remove("is-active"));
    button.classList.add("is-active");
    updateCourseCards();
  });
});

if (courseSearch) {
  courseSearch.addEventListener("input", updateCourseCards);
}

courseChipArrows.forEach((button) => {
  button.addEventListener("click", () => {
    if (!courseChipTrack) {
      return;
    }

    const direction = Number(button.dataset.chipScroll || 1);
    courseChipTrack.scrollBy({
      left: direction * 240,
      behavior: "smooth"
    });
  });
});

courseCarouselButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!courseCarouselTrack) {
      return;
    }

    const direction = Number(button.dataset.courseCarousel || 1);
    const scrollStep = getCourseCarouselStep() || courseCarouselTrack.clientWidth;

    courseCarouselTrack.scrollBy({
      left: direction * scrollStep,
      behavior: "smooth"
    });
  });
});

if (courseCarouselTrack) {
  courseCarouselTrack.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateCourseCarouselControls);
  });

  window.addEventListener("resize", updateCourseCarouselControls);
}

courseDetailTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const selectedCard = trigger.closest("[data-course-card]");
    const courseKey = selectedCard?.dataset.courseKey || "foundation";
    const courseDetailSection = document.getElementById("course-detail");

    event.preventDefault();
    updateCourseDetail(courseKey);
    courseDetailSection?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (window.history?.replaceState) {
      window.history.replaceState(null, "", "#course-detail");
    }
  });
});

updateCourseDetail("foundation");
updateCourseCards();

const demoStudents = {
  "student@ohmviolin.com": {
    email: "student@ohmviolin.com",
    name: "นักเรียน Demo",
    password: "violin2026",
    paid: true,
    course: "คอร์สไวโอลินพื้นฐาน 21 วัน",
    accessUntil: "ตลอดชีพ",
    profile: {
      displayName: "นักเรียน Demo",
      phone: "080-000-0000",
      lineId: "demo.student",
      level: "เริ่มต้น",
      goal: "วางพื้นฐานท่าทาง คุมเสียงสายเปล่า และซ้อมให้ต่อเนื่อง"
    },
    courses: [
      {
        title: "คอร์สไวโอลินพื้นฐาน 21 วัน",
        meta: "3 Lesson · 8 คลิป",
        status: "ชำระเงินแล้ว",
        accessUntil: "ตลอดชีพ",
        href: "student-course.html"
      }
    ]
  },
  "pending@ohmviolin.com": {
    email: "pending@ohmviolin.com",
    name: "บัญชีรอชำระเงิน",
    password: "pending2026",
    paid: false,
    course: "คอร์สไวโอลินพื้นฐาน 21 วัน",
    accessUntil: "-",
    profile: {
      displayName: "บัญชีรอชำระเงิน",
      phone: "",
      lineId: "",
      level: "เริ่มต้น",
      goal: ""
    },
    courses: []
  }
};

const PORTAL_STORAGE_KEY = "violinPortalStudentVimeoAccess";
const PROFILE_STORAGE_KEY = "violinPortalStudentProfiles";
const portalLogin = document.getElementById("portalLogin");
const portalStatus = document.getElementById("portalStatus");
const studentPortal = document.getElementById("studentPortal");
const studentGate = document.getElementById("studentGate");
const studentWelcome = document.getElementById("studentWelcome");
const studentCourseStatus = document.getElementById("studentCourseStatus");
const portalLogout = document.getElementById("portalLogout");
const studentProfileButton = document.getElementById("studentProfileButton");
const studentProfileDropdown = document.getElementById("studentProfileDropdown");
const studentProfileName = document.getElementById("studentProfileName");
const studentOwnedCount = document.getElementById("studentOwnedCount");
const studentAvatar = document.getElementById("studentAvatar");
const studentProfileEmail = document.getElementById("studentProfileEmail");
const studentProfileLine = document.getElementById("studentProfileLine");
const studentPurchasedCourses = document.getElementById("studentPurchasedCourses");
const profileEditToggle = document.getElementById("profileEditToggle");
const studentProfilePanel = document.getElementById("studentProfilePanel");
const studentProfileForm = document.getElementById("studentProfileForm");
const studentProfileStatus = document.getElementById("studentProfileStatus");
const profilePanelClose = document.getElementById("profilePanelClose");
const lessonPlayer = document.getElementById("lessonPlayer");
const lessonTitle = document.getElementById("lessonTitle");
const lessonDescription = document.getElementById("lessonDescription");
const lessonItems = Array.from(document.querySelectorAll(".lesson-item"));
const demoFillButton = document.querySelector(".demo-fill-button");
let activeStudentEmail = null;

function getSavedPortalEmail() {
  try {
    return window.localStorage.getItem(PORTAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function savePortalEmail(email) {
  try {
    window.localStorage.setItem(PORTAL_STORAGE_KEY, email);
  } catch {
    // Local previews may block storage; the portal still works for this session.
  }
}

function clearSavedPortalEmail() {
  try {
    window.localStorage.removeItem(PORTAL_STORAGE_KEY);
  } catch {
    // Ignore storage errors in private browsing or local preview contexts.
  }
}

function getSavedProfiles() {
  try {
    const savedProfiles = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
    return savedProfiles && typeof savedProfiles === "object" ? savedProfiles : {};
  } catch {
    return {};
  }
}

function getStudentProfile(student) {
  const savedProfiles = getSavedProfiles();
  return {
    ...(student.profile || {}),
    ...(savedProfiles[student.email] || {})
  };
}

function saveStudentProfile(email, profile) {
  try {
    const savedProfiles = getSavedProfiles();
    savedProfiles[email] = profile;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(savedProfiles));
    return true;
  } catch {
    return false;
  }
}

function getPurchasedCourses(student) {
  if (Array.isArray(student.courses) && student.courses.length) {
    return student.courses;
  }

  return student.paid
    ? [{
      title: student.course,
      meta: "คอร์สออนไลน์",
      status: "ชำระเงินแล้ว",
      accessUntil: student.accessUntil,
      href: "student-course.html"
    }]
    : [];
}

function fillStudentProfileForm(profile) {
  if (!studentProfileForm) {
    return;
  }

  studentProfileForm.elements.displayName.value = profile.displayName || "";
  studentProfileForm.elements.phone.value = profile.phone || "";
  studentProfileForm.elements.lineId.value = profile.lineId || "";
  studentProfileForm.elements.level.value = profile.level || "เริ่มต้น";
  studentProfileForm.elements.goal.value = profile.goal || "";
}

function renderPurchasedCourseList(courses) {
  if (!studentPurchasedCourses) {
    return;
  }

  const courseItems = courses.map((course) => {
    const item = document.createElement("a");
    item.className = "student-course-dropdown-item";
    item.href = course.href || "student-course.html";

    const status = document.createElement("span");
    status.textContent = course.status || "เปิดสิทธิ์แล้ว";

    const title = document.createElement("strong");
    title.textContent = course.title;

    const meta = document.createElement("small");
    meta.textContent = `${course.meta || "คอร์สออนไลน์"} · สิทธิ์เข้าเรียน: ${course.accessUntil || "-"}`;

    item.append(status, title, meta);
    return item;
  });

  studentPurchasedCourses.replaceChildren(...courseItems);
}

function renderStudentProfile(student) {
  const profile = getStudentProfile(student);
  const purchasedCourses = getPurchasedCourses(student);
  const displayName = profile.displayName || student.name;

  if (studentWelcome) {
    studentWelcome.textContent = `ยินดีต้อนรับ ${displayName}`;
  }

  if (studentCourseStatus) {
    studentCourseStatus.textContent = `คอร์สที่ซื้อแล้ว ${purchasedCourses.length} คอร์ส · สิทธิ์หลัก: ${student.accessUntil}`;
  }

  if (studentProfileName) {
    studentProfileName.textContent = displayName;
  }

  if (studentOwnedCount) {
    studentOwnedCount.textContent = `คอร์สที่ซื้อแล้ว ${purchasedCourses.length} คอร์ส`;
  }

  if (studentAvatar) {
    studentAvatar.textContent = displayName.trim().charAt(0).toUpperCase() || "S";
  }

  if (studentProfileEmail) {
    studentProfileEmail.textContent = student.email;
  }

  if (studentProfileLine) {
    studentProfileLine.textContent = `LINE: ${profile.lineId || "-"}`;
  }

  renderPurchasedCourseList(purchasedCourses);
  fillStudentProfileForm(profile);
}

function closeStudentProfileDropdown() {
  if (studentProfileDropdown) {
    studentProfileDropdown.hidden = true;
  }

  if (studentProfileButton) {
    studentProfileButton.setAttribute("aria-expanded", "false");
  }
}

function showStudentPortal(student) {
  if (!studentPortal || !studentWelcome || !studentCourseStatus) {
    return;
  }

  activeStudentEmail = student.email;

  if (studentGate) {
    studentGate.hidden = true;
  }

  studentPortal.hidden = false;
  renderStudentProfile(student);
  setActiveLesson(document.querySelector(".lesson-item.is-active") || lessonItems[0]);
}

function hideStudentPortal() {
  activeStudentEmail = null;

  if (studentPortal) {
    studentPortal.hidden = true;
  }

  if (studentGate) {
    studentGate.hidden = false;
  }

  if (lessonPlayer) {
    lessonPlayer.src = "about:blank";
  }

  closeStudentProfileDropdown();

  if (studentProfilePanel) {
    studentProfilePanel.hidden = true;
  }
}

function setActiveLesson(lessonButton) {
  if (!lessonButton || !lessonPlayer || !lessonTitle || !lessonDescription) {
    return;
  }

  const vimeoId = lessonButton.dataset.vimeoId;
  if (!vimeoId) {
    return;
  }

  lessonItems.forEach((item) => item.classList.remove("is-active"));
  lessonButton.classList.add("is-active");
  lessonTitle.textContent = lessonButton.dataset.title || "บทเรียน Vimeo";
  lessonDescription.textContent = lessonButton.dataset.description || "";
  lessonPlayer.src = `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?title=0&byline=0&portrait=0&badge=0&autopause=0`;
}

lessonItems.forEach((lessonButton) => {
  lessonButton.addEventListener("click", () => setActiveLesson(lessonButton));
});

if (studentProfileButton && studentProfileDropdown) {
  studentProfileButton.addEventListener("click", () => {
    const isOpening = studentProfileDropdown.hidden;
    studentProfileDropdown.hidden = !isOpening;
    studentProfileButton.setAttribute("aria-expanded", String(isOpening));
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (!target.closest(".student-account-menu")) {
      closeStudentProfileDropdown();
    }
  });
}

if (profileEditToggle && studentProfilePanel) {
  profileEditToggle.addEventListener("click", () => {
    studentProfilePanel.hidden = false;
    closeStudentProfileDropdown();
    studentProfilePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (profilePanelClose && studentProfilePanel) {
  profilePanelClose.addEventListener("click", () => {
    studentProfilePanel.hidden = true;
    if (studentProfileStatus) {
      studentProfileStatus.textContent = "";
    }
  });
}

if (studentProfileForm && studentProfileStatus) {
  studentProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!activeStudentEmail || !demoStudents[activeStudentEmail]) {
      studentProfileStatus.textContent = "กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูล";
      return;
    }

    const profile = formToObject(studentProfileForm);
    demoStudents[activeStudentEmail].profile = {
      ...(demoStudents[activeStudentEmail].profile || {}),
      ...profile
    };
    const saved = saveStudentProfile(activeStudentEmail, profile);

    renderStudentProfile(demoStudents[activeStudentEmail]);
    studentProfileStatus.textContent = saved
      ? "บันทึกข้อมูลส่วนตัวแล้ว"
      : "บันทึกในเครื่องไม่ได้ แต่ข้อมูลยังแสดงใน session นี้";
  });
}

if (demoFillButton && portalLogin) {
  demoFillButton.addEventListener("click", () => {
    const emailInput = portalLogin.elements.email;
    const passwordInput = portalLogin.elements.password;

    emailInput.value = demoFillButton.dataset.demoEmail || "";
    passwordInput.value = demoFillButton.dataset.demoPassword || "";
    emailInput.focus();
  });
}

if (portalLogin && portalStatus) {
  portalLogin.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = formToObject(portalLogin);
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const student = demoStudents[email];

    if (!student || student.password !== password) {
      clearSavedPortalEmail();
      hideStudentPortal();
      portalStatus.textContent = "ไม่พบบัญชีนี้ หรือรหัสผ่านไม่ถูกต้อง";
      return;
    }

    if (!student.paid) {
      clearSavedPortalEmail();
      hideStudentPortal();
      portalStatus.textContent = "พบบัญชีแล้ว แต่ยังไม่มีสถานะชำระเงิน กรุณาติดต่อครูเพื่อเปิดสิทธิ์เข้าเรียน";
      return;
    }

    savePortalEmail(email);

    if (portalLogin.dataset.redirect) {
      portalStatus.textContent = "เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าคอร์สเรียน";
      window.setTimeout(() => {
        window.location.href = portalLogin.dataset.redirect;
      }, 450);
      return;
    }

    showStudentPortal(student);
    portalStatus.textContent = "เข้าสู่ระบบสำเร็จ เปิดพื้นที่นักเรียนและบทเรียน Vimeo ให้แล้ว";
    studentPortal?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (portalLogout) {
  portalLogout.addEventListener("click", () => {
    clearSavedPortalEmail();
    hideStudentPortal();
    if (portalLogin) {
      portalLogin.reset();
    }
    if (portalStatus) {
      portalStatus.textContent = "ออกจากระบบแล้ว";
    }
    if (portalLogout.dataset.logoutRedirect) {
      window.location.href = portalLogout.dataset.logoutRedirect;
    }
  });
}

const savedPortalEmail = getSavedPortalEmail();

if (savedPortalEmail && demoStudents[savedPortalEmail]?.paid) {
  if (portalLogin?.dataset.redirect && !studentPortal) {
    window.location.href = portalLogin.dataset.redirect;
  } else {
    showStudentPortal(demoStudents[savedPortalEmail]);
  }
} else if (studentGate) {
  studentGate.hidden = false;
}
