const root = document.documentElement;
const progressBar = document.querySelector("[data-progress]");
const observedSections = [...document.querySelectorAll("[data-observe]")];
const sectionLinks = [...document.querySelectorAll("[data-section-link]")];
const searchButton = document.querySelector("[data-toggle-search]");
const searchModal = document.querySelector("[data-search-modal]");
const editionsButton = document.querySelector("[data-toggle-editions]");
const editionsPopover = document.querySelector("[data-editions-popover]");
const portalSection = document.querySelector(".portal-section");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  updateTourMotion(scrollable > 0 ? window.scrollY / scrollable : 0);
  updatePortalLight();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updatePortalLight() {
  if (!portalSection || reducedMotion) return;
  const rect = portalSection.getBoundingClientRect();
  const range = window.innerHeight + rect.height;
  const raw = (window.innerHeight - rect.top) / range;
  const progress = clamp(raw, 0, 1);
  const flash = Math.sin(progress * Math.PI);
  root.style.setProperty("--portal-progress", progress.toFixed(4));
  root.style.setProperty("--portal-flash", flash.toFixed(4));
  root.style.setProperty("--portal-drift", `${((progress - 0.5) * 140).toFixed(2)}px`);
}

function updateTourMotion(pageProgress) {
  if (reducedMotion) return;
  const wave = Math.sin(window.scrollY / 260);
  const counterWave = Math.cos(window.scrollY / 390);
  const sway = wave * 28 + counterWave * 10;
  const lift = Math.sin(window.scrollY / 520) * 10;
  const tilt = wave * 0.42;
  root.style.setProperty("--tour-progress", clamp(pageProgress, 0, 1).toFixed(4));
  root.style.setProperty("--tour-sway", `${sway.toFixed(2)}px`);
  root.style.setProperty("--tour-lift", `${lift.toFixed(2)}px`);
  root.style.setProperty("--tour-tilt", `${tilt.toFixed(3)}deg`);
}

function updatePointer(event) {
  if (reducedMotion) return;
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;
  root.style.setProperty("--mx", x.toFixed(4));
  root.style.setProperty("--my", y.toFixed(4));
}

function setActiveSection(id) {
  sectionLinks.forEach((link) => {
    const isActive = link.dataset.sectionLink === id;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    setActiveSection(visible.target.dataset.observe);
  },
  {
    root: null,
    threshold: [0.35, 0.52, 0.7],
  }
);

observedSections.forEach((section) => observer.observe(section));

searchButton?.addEventListener("click", () => {
  if (!searchModal) return;
  if (typeof searchModal.showModal === "function") {
    searchModal.showModal();
    searchButton.setAttribute("aria-expanded", "true");
  }
});

searchModal?.addEventListener("close", () => {
  searchButton?.setAttribute("aria-expanded", "false");
});

editionsButton?.addEventListener("click", () => {
  if (!editionsPopover) return;
  const isHidden = editionsPopover.hidden;
  editionsPopover.hidden = !isHidden;
  editionsButton.setAttribute("aria-expanded", String(isHidden));
});

document.addEventListener("click", (event) => {
  if (!editionsPopover || !editionsButton) return;
  const target = event.target;
  if (editionsPopover.hidden) return;
  if (editionsPopover.contains(target) || editionsButton.contains(target)) return;
  editionsPopover.hidden = true;
  editionsButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editionsPopover && !editionsPopover.hidden) {
    editionsPopover.hidden = true;
    editionsButton?.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });

updateProgress();
