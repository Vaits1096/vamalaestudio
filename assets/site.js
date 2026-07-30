const routes = {
  // El título de "/" debe coincidir con el <title> del HTML: si no, el JS pisa
  // en la carga el que ve Google.
  "/": { view: "home", title: "Academia de pintura y dibujo en Getxo · VAMALA Estudio Creativo" },
  "/que-ofrecemos": { view: "que-ofrecemos", title: "Clases de pintura y dibujo en Getxo · VAMALA" },
  "/horarios-y-tarifas": { view: "horarios-y-tarifas", title: "Horarios y precios de las clases · VAMALA Getxo" },
  "/talleres-y-monograficos": { view: "talleres-y-monograficos", title: "Talleres y monográficos de pintura en Getxo · VAMALA" },
  "/quien-hay-detras": { view: "quien-hay-detras", title: "¿Quién hay detrás? · VAMALA" },
  "/el-estudio": { view: "el-estudio", title: "El estudio · VAMALA" },
  "/taller-halloween": { view: "taller-halloween", title: "Taller de Halloween · VAMALA" },
  "/taller-tarjetas-navidenas": { view: "taller-tarjetas-navidenas", title: "Taller de tarjetas navideñas · VAMALA" },
  "/taller-navidad": { view: "taller-navidad", title: "Taller de Navidad · VAMALA" },
  "/encargo": { view: "encargo", title: "Quiero un encargo · VAMALA" },
  "/encargo-formulario": { view: "encargo-formulario", title: "Cuéntame tu idea · VAMALA" },
  "/encargo-galeria": { view: "encargo-galeria", title: "Una pequeña muestra de mi galería · VAMALA" },
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
  ["2026-10-12", "2026-10-12"], // Pilar (el sábado y el domingo ya cierran solos)
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
  const isClosedRange = (iso) => CALENDAR_CLOSED_RANGES.some(([start, end]) => iso >= start && iso <= end);
  const isWorkshopDay = (iso) => CALENDAR_WORKSHOP_DATES.includes(iso);
  // Los fines de semana el estudio está cerrado salvo que ese día haya workshop.
  const isWeekend = (year, month, day) => [0, 6].includes(new Date(year, month, day).getDay());
  const isClosedDay = (iso, year, month, day) => isClosedRange(iso) || isWeekend(year, month, day);

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
      // El workshop manda: es el único motivo por el que se abre en fin de semana.
      if (isWorkshopDay(iso)) cell.classList.add("calendar-grid__day--workshop");
      else if (isClosedDay(iso, year, month, d)) cell.classList.add("calendar-grid__day--closed");
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
      `Presupuesto: ${data.get("presupuesto") || "-"}`,
      `Idea: ${data.get("idea") || "-"}`,
      `¿Cuándo lo necesita? ${data.get("fecha") || "-"}`,
      `Nombre: ${data.get("nombre") || "-"}`,
    ];
    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/34649599775?text=${message}`, "_blank", "noreferrer");
  });
}

const PROCESS_IMAGES = [
  { file: "proceso-02", alt: "Ilustración a tinta de una cebolla dentro de un recuadro dibujado a mano" },
  { file: "proceso-03", alt: "Una mano dibujando a tinta una berenjena en miniatura" },
  { file: "proceso-04", alt: "Ilustración a tinta de un pez león sobre papel de acuarela" },
  { file: "proceso-06", alt: "Acuarela en blanco y negro de un árbol retorcido" },
  { file: "proceso-09", alt: "Detalle de la acuarela de la surfista y el perro corriendo por la orilla" },
  { file: "proceso-12", alt: "Detalle de un cuadro de golf con dos jugadores y sus sombras" },
  { file: "proceso-13", alt: "Detalle de un cuadro de golf con jugadores alrededor de la bandera" },
  { file: "proceso-14", alt: "Ilustración de un pez sobre una lámina de papel negro" },
  { file: "proceso-15", alt: "Cuadro enmarcado de un perro salchicha sobre un caballete" },
  { file: "proceso-17", alt: "Acuarela de un árbol recortado contra un cielo al atardecer" },
  { file: "proceso-18", alt: "Acuarela de una polilla sobre papel blanco" },
  { file: "proceso-19", alt: "Dos peces pintados sobre una pieza redonda de madera" },
  { file: "proceso-22", alt: "Ilustración de un árbol sobre papel, en una mesa de madera" },
  { file: "proceso-23", alt: "Acuarela de una tienda de campaña al pie de una montaña" },
  { file: "proceso-25", alt: "Ilustración de un tucán en un marco antiguo tallado" },
  { file: "proceso-26", alt: "Dos láminas impresas sobre una superficie oscura" },
  { file: "proceso-27", alt: "Acuarela de una montaña nevada" },
  { file: "proceso-28", alt: "Una mano dando pinceladas a una acuarela de montañas" },
  { file: "proceso-29", alt: "Acuarela de las olas rompiendo contra unas rocas" },
  { file: "proceso-30", alt: "Tres ilustraciones de peces sobre una lámina en el suelo" },
  { file: "proceso-32", alt: "Retrato en acuarela de un perro, enmarcado" },
  { file: "proceso-33", alt: "Dos hojas secas pintadas junto a una paleta de color" },
  { file: "proceso-34", alt: "Acuarela de unos patos sobre el agua" },
  { file: "proceso-35", alt: "Paisaje en sepia con caballos cruzando la orilla" },
  { file: "proceso-37", alt: "Flor blanca pintada sobre un fondo verde" },
  { file: "proceso-38", alt: "Lámina con una flor blanca sobre una mesa de madera" },
  { file: "proceso-39", alt: "Acuarela de una margarita con un insecto posado" },
  { file: "proceso-40", alt: "Acuarela de unas montañas nevadas" },
  { file: "proceso-41", alt: "Acuarela de un paisaje de marismas con casas al fondo" },
];

const filmstripTrack = document.querySelector("[data-filmstrip-track]");

if (filmstripTrack) {
  const buildSlide = (image, duplicated) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "zoom-trigger";
    // La segunda vuelta es decorativa: se oculta a lectores de pantalla y al tabulador.
    if (duplicated) {
      button.setAttribute("aria-hidden", "true");
      button.tabIndex = -1;
    } else {
      button.setAttribute("aria-label", `Ver más grande: ${image.alt.toLowerCase()}`);
    }
    const img = document.createElement("img");
    img.src = `assets/images/proceso/${image.file}-min.jpg`;
    img.dataset.full = `assets/images/proceso/${image.file}.jpg`;
    img.alt = duplicated ? "" : image.alt;
    img.loading = "lazy";
    img.decoding = "async";
    button.appendChild(img);
    return button;
  };

  [false, true].forEach((duplicated) => {
    PROCESS_IMAGES.forEach((image) => filmstripTrack.appendChild(buildSlide(image, duplicated)));
  });
}

const lightbox = document.querySelector("[data-lightbox]");

if (lightbox) {
  const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
  const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");
  let lightboxItems = [];
  let lightboxIndex = 0;
  let lightboxLastFocused = null;

  function showLightboxImage(index) {
    const total = lightboxItems.length;
    if (!total) return;
    lightboxIndex = (index + total) % total;
    const image = lightboxItems[lightboxIndex];
    // En el carrusel la miniatura es sólo la vista previa: aquí se pide la grande.
    lightboxImage.src = image.dataset.full || image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${total}`;
    lightbox.querySelectorAll("[data-lightbox-prev], [data-lightbox-next]").forEach((button) => {
      button.hidden = total < 2;
    });
  }

  function openLightbox(trigger) {
    const group = trigger.closest("[data-zoom-group]");
    const groupName = group?.dataset.zoomGroup;
    // Las flechas recorren todas las fotos del mismo grupo, aunque estén en rejillas distintas.
    const scope = groupName
      ? [...document.querySelectorAll(`[data-zoom-group="${groupName}"]`)]
      : [group].filter(Boolean);
    lightboxItems = scope
      .flatMap((container) => [...container.querySelectorAll(".zoom-trigger")])
      .filter((button) => button.getAttribute("aria-hidden") !== "true")
      .map((button) => button.querySelector("img"));

    const clicked = trigger.querySelector("img");
    const start = lightboxItems.indexOf(clicked);
    lightboxLastFocused = trigger;
    showLightboxImage(start < 0 ? 0 : start);
    lightbox.hidden = false;
    document.body.classList.add("menu-open");
    window.requestAnimationFrame(() => lightbox.querySelector(".lightbox__close")?.focus());
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("menu-open");
    lightboxLastFocused?.focus();
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".zoom-trigger");
    if (trigger) openLightbox(trigger);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest("[data-lightbox-close]")) closeLightbox();
    else if (event.target.closest("[data-lightbox-prev]")) showLightboxImage(lightboxIndex - 1);
    else if (event.target.closest("[data-lightbox-next]")) showLightboxImage(lightboxIndex + 1);
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    else if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
    else if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
  });

  // Deslizar con el dedo para pasar de foto en el móvil.
  let touchStartX = null;
  lightbox.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showLightboxImage(lightboxIndex + (distance < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  window.addEventListener("hashchange", closeLightbox);
}
