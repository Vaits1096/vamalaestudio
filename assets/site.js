const routes = {
  "/": { view: "home", title: "VAMALA · Estudio creativo" },
  "/que-ofrecemos": { view: "que-ofrecemos", title: "¿Qué ofrecemos? · VAMALA" },
  "/horarios-y-tarifas": { view: "horarios-y-tarifas", title: "Horarios y tarifas · VAMALA" },
  "/talleres-y-monograficos": { view: "talleres-y-monograficos", title: "Talleres y monográficos · VAMALA" },
  "/quien-hay-detras": { view: "quien-hay-detras", title: "¿Quién hay detrás? · VAMALA" },
  "/el-estudio": { view: "el-estudio", title: "El estudio · VAMALA" },
  "/taller-halloween": { view: "taller-halloween", title: "Taller de Halloween · VAMALA" },
  "/taller-tarjetas-navidenas": { view: "taller-tarjetas-navidenas", title: "Taller de tarjetas navideñas · VAMALA" },
  "/taller-navidad": { view: "taller-navidad", title: "Taller de Navidad · VAMALA" },
  "/encargo": { view: "encargo", title: "Quiero un encargo · VAMALA" },
  "/encargo-formulario": { view: "encargo-formulario", title: "Cuéntame tu idea · VAMALA" },
  "/encargo-galeria": { view: "encargo-galeria", title: "Obras que ya encontraron su hogar · VAMALA" },
};

const menuButton = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu-panel]");
const header = document.querySelector("[data-header]");
const views = [...document.querySelectorAll("[data-view]")];
let lastFocusedElement = null;

function currentPath() {
  const hash = window.location.hash.slice(1).split("?")[0];
  return routes[hash] ? hash : "/";
}

function closeMenu({ restoreFocus = false } = {}) {
  if (menuPanel.hidden) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuPanel.hidden = true;
  document.body.classList.remove("menu-open");
  header.classList.remove("menu-is-open");
  if (restoreFocus && lastFocusedElement) lastFocusedElement.focus();
}

function openMenu() {
  lastFocusedElement = document.activeElement;
  menuButton.setAttribute("aria-expanded", "true");
  menuPanel.hidden = false;
  document.body.classList.add("menu-open");
  header.classList.add("menu-is-open");
  const firstLink = menuPanel.querySelector("a");
  window.requestAnimationFrame(() => firstLink?.focus());
}

function setupRevealAnimations(scope = document) {
  const items = [...scope.querySelectorAll("[data-reveal]")];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item, index) => {
    item.classList.remove("is-visible");
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
}

function renderRoute({ preserveScroll = false } = {}) {
  const path = currentPath();
  const route = routes[path];

  views.forEach((view) => {
    view.hidden = view.dataset.view !== route.view;
  });

  document.title = route.title;
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${path}`;
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  closeMenu();
  if (!preserveScroll) {
    const [, hashQuery] = window.location.hash.split("?");
    const scrollTargetId = hashQuery ? new URLSearchParams(hashQuery).get("scrollTo") : null;
    const scrollTarget = scrollTargetId ? document.getElementById(scrollTargetId) : null;
    if (scrollTarget) scrollTarget.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }
  const activeView = document.querySelector(`[data-view="${route.view}"]`);
  setupRevealAnimations(activeView);
}

menuButton.addEventListener("click", () => {
  if (menuPanel.hidden) openMenu();
  else closeMenu({ restoreFocus: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu({ restoreFocus: true });
});

menuPanel.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("click", (event) => {
  const scrollButton = event.target.closest("[data-scroll-to]");
  if (scrollButton) {
    document.getElementById(scrollButton.dataset.scrollTo)?.scrollIntoView({ behavior: "smooth" });
  }

  const reservationLink = event.target.closest("[data-reserve-link]");
  if (reservationLink) {
    event.preventDefault();
    document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
  }
});

window.addEventListener("hashchange", () => renderRoute());
window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 18), { passive: true });

document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = new Date().getFullYear(); });
renderRoute({ preserveScroll: true });

const CALENDAR_CLOSED_RANGES = [
  ["2026-09-24", "2026-09-24"], // Festivo local
  ["2026-10-10", "2026-10-12"], // Puente del Pilar
  ["2026-12-24", "2027-01-06"], // Vacaciones de Navidad
  ["2027-03-25", "2027-03-29"], // Semana Santa
];
const CALENDAR_WORKSHOP_DATES = [
  "2026-10-31", // Taller de Halloween
  "2026-12-12", // Taller de tarjetas navideñas
  "2026-12-19", // Taller de Navidad
];
const CALENDAR_MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const CALENDAR_WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const CALENDAR_START = { year: 2026, month: 8 };
const CALENDAR_MONTH_COUNT = 11;

const calendarModal = document.querySelector("[data-calendar-modal]");
const calendarToggleButtons = document.querySelectorAll("[data-calendar-toggle]");

if (calendarModal && calendarToggleButtons.length) {
  const calendarGrid = calendarModal.querySelector("[data-calendar-grid]");
  const calendarTitle = calendarModal.querySelector("[data-calendar-title]");
  const calendarPrev = calendarModal.querySelector("[data-calendar-prev]");
  const calendarNext = calendarModal.querySelector("[data-calendar-next]");
  const calendarPanel = calendarModal.querySelector(".calendar-modal__panel");
  let calendarCursor = 0;
  let calendarLastFocused = null;

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const isClosedDay = (iso) => CALENDAR_CLOSED_RANGES.some(([start, end]) => iso >= start && iso <= end);
  const isWorkshopDay = (iso) => CALENDAR_WORKSHOP_DATES.includes(iso);

  function currentCalendarDate() {
    const total = CALENDAR_START.month + calendarCursor;
    return { year: CALENDAR_START.year + Math.floor(total / 12), month: total % 12 };
  }

  function renderCalendar() {
    const { year, month } = currentCalendarDate();
    calendarTitle.textContent = `${CALENDAR_MONTH_NAMES[month].charAt(0).toUpperCase()}${CALENDAR_MONTH_NAMES[month].slice(1)} ${year}`;
    calendarGrid.innerHTML = "";

    CALENDAR_WEEKDAYS.forEach((label) => {
      const cell = document.createElement("span");
      cell.className = "calendar-grid__weekday";
      cell.textContent = label;
      calendarGrid.appendChild(cell);
    });

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      calendarGrid.appendChild(document.createElement("span"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISO(year, month, d);
      const cell = document.createElement("span");
      cell.className = "calendar-grid__day";
      if (isClosedDay(iso)) cell.classList.add("calendar-grid__day--closed");
      if (isWorkshopDay(iso)) cell.classList.add("calendar-grid__day--workshop");
      cell.textContent = d;
      calendarGrid.appendChild(cell);
    }

    calendarPrev.disabled = calendarCursor <= 0;
    calendarNext.disabled = calendarCursor >= CALENDAR_MONTH_COUNT - 1;
  }

  function openCalendar() {
    calendarLastFocused = document.activeElement;
    calendarCursor = 0;
    renderCalendar();
    calendarModal.hidden = false;
    document.body.classList.add("menu-open");
    window.requestAnimationFrame(() => calendarModal.querySelector(".calendar-modal__close")?.focus());
  }

  function closeCalendar() {
    if (calendarModal.hidden) return;
    calendarModal.hidden = true;
    document.body.classList.remove("menu-open");
    calendarLastFocused?.focus();
  }

  calendarToggleButtons.forEach((button) => button.addEventListener("click", openCalendar));

  calendarModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-calendar-close]")) closeCalendar();
  });

  calendarPanel.addEventListener("click", (event) => event.stopPropagation());

  calendarPrev.addEventListener("click", () => {
    if (calendarCursor > 0) { calendarCursor -= 1; renderCalendar(); }
  });

  calendarNext.addEventListener("click", () => {
    if (calendarCursor < CALENDAR_MONTH_COUNT - 1) { calendarCursor += 1; renderCalendar(); }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendar();
  });

  window.addEventListener("hashchange", closeCalendar);
}

const commissionForm = document.querySelector("[data-commission-form]");

if (commissionForm) {
  commissionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(commissionForm);
    const lines = [
      "Hola Valeria, quiero hacerte un encargo:",
      `¿Qué te gustaría crear? ${data.get("tipo") || "-"}`,
      `¿Para quién es? ${data.get("destinatario") || "-"}`,
      `Presupuesto: ${data.get("presupuesto") || "-"}`,
      `Idea: ${data.get("idea") || "-"}`,
      `¿Cuándo lo necesita? ${data.get("fecha") || "-"}`,
      `Nombre: ${data.get("nombre") || "-"}`,
      `WhatsApp o email: ${data.get("contacto") || "-"}`,
    ];
    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/34649599775?text=${message}`, "_blank", "noreferrer");
  });
}
