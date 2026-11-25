const gallery = document.querySelector("[data-floating-gallery]");
const hero = document.querySelector(".hero");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const workSections = [...document.querySelectorAll(".work-section")];
const navLinks = [...document.querySelectorAll(".nav-links a")];
const envelopeStage = document.querySelector("[data-envelope-stage]");
const heroCopy = document.querySelector(".hero-copy");
const contactSection = document.querySelector(".contact-envelope-section");
const siteHeader = document.querySelector(".site-header");
const homeAboutContent = document.querySelector("[data-home-about-content]");
const aboutCarousel = document.querySelector("[data-about-carousel]");
const posterOrbit = document.querySelector("[data-poster-orbit]");
const paintingBrowser = document.querySelector("[data-painting-browser]");
let posterGridController;

const categories = [
  {
    id: "content-analysis",
    label: "产品研究文章",
    center: [0.16, 0.24],
    slug: "research",
    assets: [
      "assets/home-floating/research/01.png",
      "assets/home-floating/research/02.png",
      "assets/home-floating/research/03.png",
      "assets/home-floating/research/04.png",
      "assets/home-floating/research/05.png",
    ],
  },
  {
    id: "product-dev",
    label: "跨境产品开发",
    center: [0.49, 0.18],
    slug: "product",
    assets: [
      "assets/home-floating/product/01.png",
      "assets/home-floating/product/02.png",
      "assets/home-floating/product/03.png",
      "assets/home-floating/product/04.png",
      "assets/home-floating/product/05.png",
      "assets/home-floating/product/06.png",
    ],
  },
  {
    id: "textile-design",
    label: "纺织类产品",
    center: [0.82, 0.24],
    slug: "textile",
    assets: [
      "assets/home-floating/textile/01.png",
      "assets/home-floating/textile/02.png",
      "assets/home-floating/textile/03.png",
      "assets/home-floating/textile/05.png",
      "assets/home-floating/textile/06.png",
    ],
  },
  {
    id: "graphic-design",
    label: "平面设计",
    center: [0.28, 0.72],
    slug: "graphic",
    assets: [
      "assets/home-floating/graphic/01.png",
      "assets/home-floating/graphic/02.png",
      "assets/home-floating/graphic/03.png",
      "assets/home-floating/graphic/04.jpg",
      "assets/home-floating/graphic/05.jpg",
    ],
  },
  {
    id: "about",
    label: "关于我",
    center: [0.82, 0.72],
    slug: "about",
    assets: [
      "assets/home-floating/about/01.png",
      "assets/home-floating/about/02.png",
      "assets/home-floating/about/03.png",
      "assets/home-floating/about/04.jpg",
    ],
  },
];

const clusterOffsets = [
  [-30, -18, -10], [-10, -28, 5], [14, -22, 12], [30, -5, -5],
  [-26, 14, 8], [6, 18, -8],
];

const scatterPoints = [
  [0.06, 0.16, 0.82, -14], [0.15, 0.09, 0.48, 8], [0.24, 0.15, 0.7, -5], [0.34, 0.09, 0.44, 1],
  [0.45, 0.16, 0.54, -2], [0.56, 0.08, 0.52, 0], [0.66, 0.15, 0.78, -18], [0.77, 0.1, 0.68, 9],
  [0.88, 0.15, 0.5, -4], [0.97, 0.2, 0.68, 15], [0.08, 0.35, 0.72, 20], [0.2, 0.32, 0.52, -11],
  [0.31, 0.41, 0.62, 2], [0.41, 0.51, 0.44, -16], [0.58, 0.46, 0.42, 13], [0.69, 0.39, 0.7, -9],
  [0.79, 0.34, 0.58, 7], [0.88, 0.54, 0.7, -3], [0.96, 0.6, 0.48, 14], [0.04, 0.56, 0.54, -8],
  [0.92, 0.78, 0.58, 10], [0.74, 0.78, 0.4, -6], [0.37, 0.7, 0.34, 12], [0.78, 0.66, 0.44, -4],
  [0.61, 0.68, 0.58, 7], [0.73, 0.61, 0.68, -12], [0.84, 0.58, 0.46, 2], [0.96, 0.64, 0.72, 8],
  [0.08, 0.78, 0.66, -12], [0.2, 0.82, 0.36, 6], [0.32, 0.88, 0.48, -5], [0.44, 0.84, 0.38, 15],
  [0.56, 0.88, 0.44, -10], [0.68, 0.82, 0.56, 3], [0.81, 0.84, 0.64, -8], [0.94, 0.82, 0.44, 12],
  [0.18, 0.47, 0.34, -15], [0.52, 0.28, 0.38, 8], [0.73, 0.25, 0.34, -5], [0.5, 0.54, 0.3, 11],
];

const mobileScatterPoints = [
  [0.12, 0.17], [0.39, 0.16], [0.66, 0.15], [0.88, 0.19],
  [0.18, 0.29], [0.48, 0.27], [0.78, 0.29],
  [0.08, 0.61], [0.32, 0.64], [0.72, 0.62], [0.92, 0.66],
  [0.14, 0.76], [0.38, 0.79], [0.64, 0.78], [0.88, 0.8],
  [0.24, 0.9], [0.54, 0.88], [0.8, 0.91],
  [0.06, 0.41], [0.94, 0.42], [0.1, 0.56], [0.9, 0.57],
  [0.28, 0.72], [0.74, 0.72], [0.5, 0.96],
];

const works = categories.flatMap((category, categoryIndex) =>
  category.assets.map((src, assetIndex) => {
    const index = categories
      .slice(0, categoryIndex)
      .reduce((total, item) => total + item.assets.length, 0) + assetIndex;
    const point = scatterPoints[index % scatterPoints.length];
    return {
      src,
      label: `${category.label}入口 ${assetIndex + 1}`,
      category,
      categoryIndex: assetIndex,
      baseX: 0,
      baseY: 0,
      clusterX: 0,
      clusterY: 0,
      size: 78,
      phase: index * 0.72,
      speed: 0.36 + (index % 7) * 0.045,
      depth: 0.24 + (index % 6) * 0.12,
      rotate: category.slug === "textile" && assetIndex === 1 ? -18 : point[3],
      spotlight:
        (category.slug === "research" && assetIndex === 1) ||
        (category.slug === "graphic" && assetIndex === 0) ||
        (category.slug === "about" && assetIndex === 1),
    };
  })
);

const state = {
  pointerX: window.innerWidth / 2,
  pointerY: window.innerHeight / 2,
  hasPointer: false,
  activeIndex: -1,
  organizeProgress: 0,
  organizeTarget: 0,
  organizeTimer: 0,
  shakeUntil: 0,
  envelopeInView: false,
  scrollRatio: 0,
  typewriterSoundAt: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createFloatingItems() {
  works.forEach((work, index) => {
    const item = document.createElement("button");
    item.className = `floating-work floating-work--${work.category.slug}`;
    item.classList.add(`floating-work--${work.category.slug}-${work.categoryIndex + 1}`);
    if (work.spotlight) item.classList.add("floating-work--spotlight");
    item.type = "button";
    item.setAttribute("aria-label", work.label);
    item.dataset.category = work.category.id;
    item.style.setProperty("--float-delay", `${(index % 9) * -0.37}s`);

    const image = document.createElement("img");
    image.src = work.src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    item.append(image);

    item.addEventListener("mouseenter", () => {
      state.activeIndex = index;
      item.classList.add("is-active");
    });
    item.addEventListener("mouseleave", () => {
      if (state.activeIndex === index) state.activeIndex = -1;
      item.classList.remove("is-active");
    });
    item.addEventListener("click", () => {
      item.classList.add("is-launching");
      window.setTimeout(() => {
        navigateToSubsection(`#${work.category.id}`);
        item.classList.remove("is-launching");
      }, prefersReducedMotion ? 0 : 180);
    });

    gallery.append(item);
    work.node = item;
  });
}

function getPaintingBounds(width, height) {
  const headerHeight = siteHeader.getBoundingClientRect().height;
  const sidePadding = width < 700 ? 12 : 24;
  const topPadding = headerHeight + (width < 700 ? 18 : 24);
  const bottomPadding = width < 700 ? 20 : 32;
  return {
    left: sidePadding,
    right: width - sidePadding,
    top: clamp(topPadding, 0, height),
    bottom: height - bottomPadding,
  };
}

function layoutWorks() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 700;
  const bounds = getPaintingBounds(width, height);
  const paintingWidth = bounds.right - bounds.left;
  const paintingHeight = bounds.bottom - bounds.top;
  const verticalShift = clamp((height - siteHeader.getBoundingClientRect().height) * 0.06, 24, 52);
  const centerClearX = isMobile ? 178 : 285;
  const centerClearY = isMobile ? 142 : 155;
  const baseMin = isMobile ? 34 : 62;
  const baseMax = isMobile ? 76 : 148;

  works.forEach((work, index) => {
    const [x, y, scale] = scatterPoints[index];
    const isAboutPainting = work.category.slug === "about" && work.categoryIndex === 3;
    const isGraphicLead = work.category.slug === "graphic" && work.categoryIndex === 0;
    const isTextileWide = work.category.slug === "textile" && work.categoryIndex === 4;
    const isTextileBackpack = work.category.slug === "textile" && work.categoryIndex === 2;
    const isProductFifth = work.category.slug === "product" && work.categoryIndex === 4;
    const isGraphicFifth = work.category.slug === "graphic" && work.categoryIndex === 4;
    const isAboutThird = work.category.slug === "about" && work.categoryIndex === 2;
    const ratio = isTextileWide
      ? 1.02
      : isGraphicLead
        ? 0.72
        : isAboutPainting
          ? 1.32
          : isAboutThird
            ? 1.31
            : index % 5 === 0
              ? 1.24
              : index % 4 === 0
                ? 1
                : index % 3 === 0
                  ? 0.72
                  : 0.82;
    const featuredScale = work.spotlight ? 1.62 : work.categoryIndex === 0 ? 1.2 : 1;
    work.size = isGraphicLead
      ? clamp(paintingWidth * 0.22, isMobile ? 92 : 230, isMobile ? 122 : 305)
      : isTextileWide
        ? clamp(paintingWidth * 0.12, isMobile ? 76 : 145, isMobile ? 108 : 175)
        : isTextileBackpack
          ? clamp(
              (baseMin + scale * (baseMax - baseMin)) * 1.08,
              isMobile ? 52 : 92,
              isMobile ? 96 : 172
            )
        : isProductFifth
          ? clamp(
              (baseMin + scale * (baseMax - baseMin)) * 1.18,
              baseMin,
              isMobile ? 102 : 220
            )
        : isGraphicFifth
          ? clamp(
              (baseMin + scale * (baseMax - baseMin)) * 1.56,
              isMobile ? 72 : 112,
              isMobile ? 126 : 248
            )
        : isAboutThird
        ? clamp(paintingWidth * 0.18, isMobile ? 82 : 190, isMobile ? 112 : 260)
          : isAboutPainting
            ? clamp(paintingWidth * 0.058, isMobile ? 38 : 60, isMobile ? 52 : 92)
            : clamp(
                (baseMin + scale * (baseMax - baseMin)) * featuredScale,
                baseMin,
                isMobile ? 96 : 188
              );
    const itemHeight = work.size / ratio;
    const paddingX = work.size * 0.52;
    const paddingY = itemHeight * 0.52;
    const jitterX = Math.sin(index * 2.17) * (isMobile ? 7 : 17);
    const jitterY = Math.cos(index * 1.83) * (isMobile ? 6 : 14);
    const [mobileX, mobileY] = mobileScatterPoints[index % mobileScatterPoints.length];
    const pointX = isMobile ? mobileX : isAboutPainting ? 0.51 : isAboutThird ? 0.22 : isGraphicFifth ? 0.88 : x;
    const pointY = isMobile ? mobileY : isAboutPainting ? 0.73 : isAboutThird ? 0.71 : isGraphicFifth ? 0.8 : y;
    const scatterViewportX = clamp(bounds.left + pointX * paintingWidth + jitterX, bounds.left + paddingX, bounds.right - paddingX);
    const scatterViewportY = clamp(bounds.top + pointY * paintingHeight + jitterY + verticalShift, bounds.top + paddingY, bounds.bottom - paddingY);
    work.baseX = scatterViewportX - width / 2;
    work.baseY = scatterViewportY - height / 2;
    const clearRatio = Math.pow(work.baseX / centerClearX, 2) + Math.pow(work.baseY / centerClearY, 2);
    if (clearRatio < 1) {
      const push = Math.sqrt(1 / Math.max(clearRatio, 0.06)) * 1.08;
      work.baseX *= push;
      work.baseY *= push;
    }
    work.baseX = clamp(work.baseX, bounds.left + paddingX - width / 2, bounds.right - paddingX - width / 2);
    work.baseY = clamp(work.baseY, bounds.top + paddingY - height / 2, bounds.bottom - paddingY - height / 2);
    const [clusterX, clusterY] = work.category.center;
    const [offsetClusterX, offsetClusterY] = clusterOffsets[work.categoryIndex];
    const clusterViewportX = clamp(bounds.left + clusterX * paintingWidth + offsetClusterX * (isMobile ? 0.55 : 1), bounds.left + paddingX, bounds.right - paddingX);
    const clusterViewportY = clamp(bounds.top + clusterY * paintingHeight + offsetClusterY * (isMobile ? 0.55 : 1) + verticalShift, bounds.top + paddingY, bounds.bottom - paddingY);
    work.clusterX = clusterViewportX - width / 2;
    work.clusterY = clusterViewportY - height / 2;
    work.node.style.setProperty("--size", `${work.size}px`);
    work.node.style.setProperty("--ratio", ratio);
  });
}

function updatePointer(event) {
  state.hasPointer = true;
  state.pointerX = event.clientX;
  state.pointerY = event.clientY;
  document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
  document.documentElement.style.setProperty("--pointer-ratio-x", (event.clientX / window.innerWidth).toFixed(4));
  document.documentElement.style.setProperty("--pointer-ratio-y", (event.clientY / window.innerHeight).toFixed(4));
  document.documentElement.style.setProperty("--hero-depth-x", `${((event.clientX / window.innerWidth) - 0.5) * -34}px`);
  document.documentElement.style.setProperty("--hero-depth-y", `${((event.clientY / window.innerHeight) - 0.5) * -24}px`);
  document.documentElement.style.setProperty("--hero-stage-rotate-y", `${((event.clientX / window.innerWidth) - 0.5) * 7}deg`);
  document.documentElement.style.setProperty("--title-halo-scale", (1 + (event.clientY / window.innerHeight) * 0.05).toFixed(4));
  document.documentElement.style.setProperty("--star-a-x", `${(event.clientX / window.innerWidth) * -24}px`);
  document.documentElement.style.setProperty("--star-a-y", `${(event.clientY / window.innerHeight) * -18}px`);
  document.documentElement.style.setProperty("--star-b-x", `${(event.clientX / window.innerWidth) * 28}px`);
  document.documentElement.style.setProperty("--star-b-y", `${(event.clientY / window.innerHeight) * 20}px`);
  document.documentElement.style.setProperty("--section-light-x", `${(event.clientX / window.innerWidth) * 100}%`);
  document.documentElement.style.setProperty("--section-light-y", `${(event.clientY / window.innerHeight) * 100}%`);
  document.documentElement.style.setProperty("--edition-pointer-x", `${(event.clientX / window.innerWidth) * -18}px`);
  document.documentElement.style.setProperty("--edition-pointer-y", `${(event.clientY / window.innerHeight) * -14}px`);
  state.organizeTarget = 1;
  gallery.classList.add("is-organized");
  window.clearTimeout(state.organizeTimer);
  state.organizeTimer = window.setTimeout(() => {
    state.organizeTarget = 0;
    gallery.classList.remove("is-organized");
  }, 1400);
}

function handleHeroPointerMove(event) {
  if (event.target.closest(".hero-copy")) return;
  updatePointer(event);
}

function scatterFromCenter(event) {
  state.hasPointer = true;
  state.pointerX = event.clientX;
  state.pointerY = event.clientY;
  state.organizeTarget = 0;
  state.shakeUntil = performance.now() + 1400;
  window.clearTimeout(state.organizeTimer);
  gallery.classList.remove("is-organized");
  gallery.classList.add("is-scattering");
  window.setTimeout(() => gallery.classList.remove("is-scattering"), 1400);
}

function updateEnvelopeOnScroll() {
  const rect = contactSection.getBoundingClientRect();
  const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
  state.envelopeInView = visibleHeight > window.innerHeight * 0.42;
  envelopeStage.classList.toggle("is-open", state.envelopeInView);
}

function render(time = 0) {
  const isMobileFrame = window.innerWidth < 700;
  const rect = gallery.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const t = time / 1000;
  const pointerOffsetX = (state.pointerX - window.innerWidth / 2) / window.innerWidth;
  const pointerOffsetY = (state.pointerY - window.innerHeight / 2) / window.innerHeight;
  state.organizeProgress += (state.organizeTarget - state.organizeProgress) * (prefersReducedMotion ? 1 : 0.065);
  const organizeEase = state.organizeProgress * state.organizeProgress * (3 - 2 * state.organizeProgress);

  works.forEach((work, index) => {
    const targetX = work.baseX + (work.clusterX - work.baseX) * organizeEase;
    const targetY = work.baseY + (work.clusterY - work.baseY) * organizeEase;
    const driftAmount = 1 - organizeEase * 0.86;
    const driftX = prefersReducedMotion ? 0 : Math.sin(t * work.speed + work.phase) * (4 + work.depth * 7) * driftAmount;
    const driftY = prefersReducedMotion ? 0 : Math.cos(t * (work.speed * 0.74) + work.phase) * (5 + work.depth * 8) * driftAmount;
    const parallaxX = state.hasPointer ? pointerOffsetX * work.depth * -28 * driftAmount : 0;
    const parallaxY = state.hasPointer ? pointerOffsetY * work.depth * -20 * driftAmount : 0;
    const currentX = centerX + targetX + driftX + parallaxX;
    const currentY = centerY + targetY + driftY + parallaxY;
    const distanceX = currentX - state.pointerX;
    const distanceY = currentY - state.pointerY;
    const distance = Math.hypot(distanceX, distanceY) || 1;
    const repelPower = state.hasPointer ? Math.pow(clamp(1 - distance / 130, 0, 1), 2) * (1 - organizeEase) : 0;
    const repelX = (distanceX / distance) * repelPower * 30;
    const repelY = (distanceY / distance) * repelPower * 30;
    const activeScale = state.activeIndex === index ? 1.08 : 1;
    const activeLift = state.activeIndex === index ? -8 : 0;
    const clusterRotation = clusterOffsets[work.categoryIndex][2];
    const rotation = work.rotate + (clusterRotation - work.rotate) * organizeEase + Math.sin(t * 0.3 + index) * 1.2 * driftAmount;
    const organizedScale = 1 - organizeEase * 0.06;
    const shakeProgress = clamp((state.shakeUntil - time) / 1400, 0, 1);
    const shakeX = prefersReducedMotion ? 0 : Math.sin(time * 0.018 + index * 2.4) * 2.8 * shakeProgress;
    const shakeY = prefersReducedMotion ? 0 : Math.cos(time * 0.015 + index * 1.8) * 2.4 * shakeProgress;

    work.node.style.transform = `translate(calc(-50% + ${targetX + driftX + parallaxX + repelX + shakeX}px), calc(-50% + ${targetY + driftY + parallaxY + repelY + activeLift + shakeY}px)) rotate(${rotation + shakeX * 0.12}deg) scale(${activeScale * organizedScale})`;
    const isTextileBackpack = work.category.slug === "textile" && work.categoryIndex === 2;
    const clusteredBackpackTop = isTextileBackpack && organizeEase > 0.38;
    work.node.style.zIndex = clusteredBackpackTop
      ? (isMobileFrame ? 28 : 88)
      : state.activeIndex === index
        ? (isMobileFrame ? 18 : 60)
        : String(isMobileFrame ? 2 + work.categoryIndex : 2 + work.categoryIndex + Math.round(work.depth * 3));
  });

  if (!prefersReducedMotion) requestAnimationFrame(render);
}

function softenHeaderOnScroll() {
  const header = document.querySelector(".site-header");
  header.style.removeProperty("backdrop-filter");
  header.style.removeProperty("-webkit-backdrop-filter");
  header.style.removeProperty("background");
  header.style.removeProperty("border-bottom");
}

function updateScrollMotion() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  state.scrollRatio = clamp(window.scrollY / maxScroll, 0, 1);
  const homeBurnProgress = document.body.classList.contains("detail-view")
    ? 0
    : clamp((window.scrollY - window.innerHeight * 0.06) / (window.innerHeight * 0.92), 0, 1);
  document.documentElement.style.setProperty("--scroll-ratio", state.scrollRatio.toFixed(4));
  document.documentElement.style.setProperty("--scroll-y", `${Math.round(window.scrollY)}px`);
  document.documentElement.style.setProperty("--home-burn-progress", homeBurnProgress.toFixed(4));
  document.documentElement.style.setProperty("--hero-grid-x", `${state.scrollRatio * -110}px`);
  document.documentElement.style.setProperty("--hero-grid-y", `${state.scrollRatio * -90}px`);
  document.documentElement.style.setProperty("--contact-drift-y", `${state.scrollRatio * -120}px`);
  document.documentElement.style.setProperty("--section-drift-y", `${state.scrollRatio * -180}px`);
  document.documentElement.style.setProperty("--section-grid-x", `${window.scrollY * -0.04}px`);
  document.documentElement.style.setProperty("--section-grid-y", `${window.scrollY * -0.03}px`);
  document.documentElement.style.setProperty("--edition-depth", `${(state.scrollRatio * 100).toFixed(2)}px`);
  document.documentElement.style.setProperty("--edition-depth-shift", `${(state.scrollRatio * -18).toFixed(2)}px`);
  document.documentElement.style.setProperty("--edition-grid-x", `${window.scrollY * -0.018}px`);
  document.documentElement.style.setProperty("--edition-grid-y", `${window.scrollY * -0.026}px`);
}

function initializeHomeAboutCopy() {
  if (!homeAboutContent) return;
  const aboutSection = document.querySelector("#about");
  const aboutLayout = aboutSection?.querySelector(".about-layout");
  if (!aboutLayout) return;

  function prepareAboutLayout(layout, heading, stripInteractiveData = false) {
    layout.querySelectorAll("[id]").forEach((item) => item.removeAttribute("id"));
    if (stripInteractiveData) {
      layout.querySelectorAll("[data-about-carousel], [data-about-track], [data-about-prev], [data-about-next], [data-about-current]").forEach((item) => {
        [...item.attributes].forEach((attribute) => {
          if (attribute.name.startsWith("data-about")) item.removeAttribute(attribute.name);
        });
      });
    }
    layout.querySelector(".about-photo-controls")?.remove();
    layout.querySelector(".contact-block")?.remove();
    const credentials = layout.querySelector(".about-credentials");
    const headingCredentials = document.createElement("div");
    headingCredentials.className = "home-about-heading-credentials";
    credentials?.querySelectorAll("section").forEach((section) => {
      const title = section.querySelector("p")?.textContent?.trim();
      if (title === "办公类软件") {
        section.remove();
        return;
      }
      if (title === "证书" || title === "设计类软件" || title === "AI 工作流") {
        headingCredentials.append(section);
      }
    });
    if (credentials && !credentials.querySelector("section")) credentials.remove();
    heading?.querySelector(".home-about-heading-credentials")?.remove();
    if (headingCredentials.children.length) heading?.append(headingCredentials);
    layout.querySelectorAll("a[target]").forEach((link) => {
      link.setAttribute("rel", "noreferrer");
    });
  }

  const clone = aboutLayout.cloneNode(true);
  const homeAboutHeading = document.querySelector("#home-about .home-about-heading");
  const detailAboutHeading = aboutSection.querySelector(".about-detail-heading");
  prepareAboutLayout(clone, homeAboutHeading, true);
  homeAboutContent.replaceChildren(clone);
  prepareAboutLayout(aboutLayout, detailAboutHeading, false);
}

let typewriterAudioContext;
let scrollUpdateFrame = 0;

function playTypewriterSound() {
  if (prefersReducedMotion) return;
  const nowMs = performance.now();
  if (nowMs - state.typewriterSoundAt < 900) return;
  state.typewriterSoundAt = nowMs;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  typewriterAudioContext ||= new AudioContextClass();
  if (typewriterAudioContext.state === "suspended") {
    typewriterAudioContext.resume().catch(() => {});
  }

  const context = typewriterAudioContext;
  const start = context.currentTime + 0.02;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 2.35);
  master.connect(context.destination);

  for (let index = 0; index < 18; index += 1) {
    const tickAt = start + index * 0.105 + (index % 3) * 0.012;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(130 + (index % 5) * 28, tickAt);
    gain.gain.setValueAtTime(0.0001, tickAt);
    gain.gain.exponentialRampToValueAtTime(0.18, tickAt + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, tickAt + 0.035);
    osc.connect(gain);
    gain.connect(master);
    osc.start(tickAt);
    osc.stop(tickAt + 0.04);
  }

  const ding = context.createOscillator();
  const dingGain = context.createGain();
  const dingAt = start + 2.05;
  ding.type = "sine";
  ding.frequency.setValueAtTime(920, dingAt);
  ding.frequency.exponentialRampToValueAtTime(1380, dingAt + 0.16);
  dingGain.gain.setValueAtTime(0.0001, dingAt);
  dingGain.gain.exponentialRampToValueAtTime(0.16, dingAt + 0.018);
  dingGain.gain.exponentialRampToValueAtTime(0.0001, dingAt + 0.26);
  ding.connect(dingGain);
  dingGain.connect(master);
  ding.start(dingAt);
  ding.stop(dingAt + 0.3);
}

function activateTypewriter() {
  envelopeStage.classList.add("is-open");
  playTypewriterSound();
}

function runScrollUpdates() {
  scrollUpdateFrame = 0;
  softenHeaderOnScroll();
  updateEnvelopeOnScroll();
  updateScrollMotion();
  refreshMotionReveals();
}

function scheduleScrollUpdates() {
  if (scrollUpdateFrame) return;
  scrollUpdateFrame = window.requestAnimationFrame(runScrollUpdates);
}

function initializeProductLineJumps() {
  const jumpCards = [...document.querySelectorAll("[data-scroll-target]")];
  if (!jumpCards.length) return;

  const jumpToTarget = (card) => {
    const target = document.querySelector(card.dataset.scrollTarget);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  jumpCards.forEach((card) => {
    card.addEventListener("click", () => jumpToTarget(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      jumpToTarget(card);
    });
  });
}

function initializeProductProjectDirectory() {
  const configurations = [
    {
      section: document.querySelector("#product-dev"),
      directoryName: "product",
      idPrefix: "product-project",
      titleSelector: "h4",
      getProjects(section) {
        return ["ai", "diy", "iteration"].flatMap((category) => [
          ...section.querySelectorAll(`.product-category--${category} .product-project`),
        ]);
      },
    },
    {
      section: document.querySelector("#textile-design"),
      directoryName: "textile",
      idPrefix: "textile-project",
      titleSelector: ".collection-heading h3",
      getProjects(section) {
        return [...section.querySelectorAll(":scope > .textile-project")];
      },
    },
  ];

  configurations.forEach((configuration) => {
    const { section, directoryName, idPrefix, titleSelector, getProjects } = configuration;
    const directory = section?.querySelector(`[data-project-directory="${directoryName}"]`);
    const projects = section ? getProjects(section) : [];
    if (!directory || !projects.length) return;

    const title = document.createElement("strong");
    title.className = "project-directory__title";
    title.textContent = "项目目录";

    const list = document.createElement("div");
    list.className = "project-directory__list";
    directory.append(title, list);

    const buttons = projects.map((project, index) => {
      const projectTitle = project.querySelector(titleSelector)?.textContent.trim();
      if (!projectTitle) return null;

      project.id ||= `${idPrefix}-${String(index + 1).padStart(2, "0")}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = projectTitle;
      button.dataset.projectTarget = project.id;
      button.setAttribute("aria-label", `跳转到项目：${projectTitle}`);
      button.addEventListener("click", () => {
        project.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
      list.append(button);
      return button;
    }).filter(Boolean);

    const setActive = (project) => {
      buttons.forEach((button) => {
        const active = button.dataset.projectTarget === project.id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-current", active ? "true" : "false");
        if (active) button.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    };

    setActive(projects[0]);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      if (visible[0]) setActive(visible[0].target);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
    projects.forEach((project) => observer.observe(project));
  });
}

function initializeImageViewer(sectionSelector, dialogLabel, fallbackAlt) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const images = [...section.querySelectorAll("figure img")];
  if (!images.length) return;

  const viewer = document.createElement("div");
  viewer.className = "graphic-lightbox";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", dialogLabel);
  viewer.innerHTML = `
    <button class="graphic-lightbox-close" type="button" aria-label="关闭大图">×</button>
    <button class="graphic-lightbox-nav graphic-lightbox-prev" type="button" aria-label="上一张">‹</button>
    <figure class="graphic-lightbox-frame">
      <img alt="" />
      <figcaption><span></span><small></small></figcaption>
    </figure>
    <button class="graphic-lightbox-nav graphic-lightbox-next" type="button" aria-label="下一张">›</button>
  `;
  document.body.appendChild(viewer);

  const viewerImage = viewer.querySelector("img");
  const viewerCaption = viewer.querySelector("figcaption span");
  const viewerCount = viewer.querySelector("figcaption small");
  const closeButton = viewer.querySelector(".graphic-lightbox-close");
  const previousButton = viewer.querySelector(".graphic-lightbox-prev");
  const nextButton = viewer.querySelector(".graphic-lightbox-next");
  let activeIndex = 0;

  const renderViewer = () => {
    const source = images[activeIndex];
    viewerImage.src = source.currentSrc || source.src;
    viewerImage.alt = source.alt || fallbackAlt;
    viewerCaption.textContent = source.alt || fallbackAlt;
    viewerCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
  };

  const openViewer = (index) => {
    activeIndex = index;
    renderViewer();
    viewer.classList.add("is-open");
    document.body.classList.add("graphic-lightbox-open");
    closeButton.focus({ preventScroll: true });
  };

  const closeViewer = () => {
    viewer.classList.remove("is-open");
    document.body.classList.remove("graphic-lightbox-open");
    viewerImage.removeAttribute("src");
  };

  const stepViewer = (direction) => {
    activeIndex = (activeIndex + direction + images.length) % images.length;
    renderViewer();
  };

  images.forEach((image, index) => {
    const figure = image.closest("figure");
    figure?.classList.add("graphic-zoomable");
    figure?.setAttribute("tabindex", "0");
    figure?.setAttribute("role", "button");
    figure?.setAttribute("aria-label", `放大查看：${image.alt || fallbackAlt}`);

    figure?.addEventListener("click", () => openViewer(index));
    figure?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openViewer(index);
    });
  });

  closeButton.addEventListener("click", closeViewer);
  previousButton.addEventListener("click", () => stepViewer(-1));
  nextButton.addEventListener("click", () => stepViewer(1));
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) closeViewer();
  });
  window.addEventListener("keydown", (event) => {
    if (!viewer.classList.contains("is-open")) return;
    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowLeft") stepViewer(-1);
    if (event.key === "ArrowRight") stepViewer(1);
  });
}

function initializeGraphicImageViewer() {
  initializeImageViewer("#textile-design", "纺织类产品大图查看", "纺织类产品作品");
  initializeImageViewer("#product-dev", "产品开发图片大图查看", "产品开发项目图片");
}

function initializeProductVideoViewer() {
  const triggers = [...document.querySelectorAll("[data-product-video-src]")];
  if (!triggers.length) return;

  const viewer = document.createElement("div");
  viewer.className = "product-video-lightbox";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", "产品视频播放器");
  viewer.innerHTML = `
    <button class="product-video-lightbox__close" type="button" aria-label="关闭视频">×</button>
    <figure class="product-video-lightbox__frame">
      <video controls playsinline preload="metadata"></video>
      <figcaption class="product-video-lightbox__title"></figcaption>
    </figure>
  `;
  document.body.append(viewer);

  const player = viewer.querySelector("video");
  const title = viewer.querySelector(".product-video-lightbox__title");
  const closeButton = viewer.querySelector(".product-video-lightbox__close");
  let activeTrigger = null;

  const previewObserver = typeof IntersectionObserver === "function"
    ? new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.preload = "metadata";
          entry.target.load();
          observer.unobserve(entry.target);
        }
      }, { rootMargin: "200px" })
    : null;

  triggers.forEach((trigger) => {
    const preview = trigger.querySelector("video");
    if (!preview) return;
    preview.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(preview.duration) && preview.duration > .2) preview.currentTime = .1;
    }, { once: true });
    previewObserver?.observe(preview);
  });

  const closeViewer = () => {
    if (!viewer.classList.contains("is-open")) return;
    player.pause();
    player.removeAttribute("src");
    player.load();
    viewer.classList.remove("is-open");
    document.body.classList.remove("product-video-open");
    activeTrigger?.focus({ preventScroll: true });
    activeTrigger = null;
  };

  const openViewer = (trigger) => {
    const source = trigger.dataset.productVideoSrc;
    if (!source) return;
    activeTrigger = trigger;
    player.src = source;
    title.textContent = trigger.dataset.productVideoTitle || "产品视频";
    viewer.classList.add("is-open");
    document.body.classList.add("product-video-open");
    closeButton.focus({ preventScroll: true });
    player.play().catch(() => undefined);
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", () => openViewer(trigger)));
  closeButton.addEventListener("click", closeViewer);
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) closeViewer();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeViewer();
  });
}

function initializeAboutCarousel() {
  if (!aboutCarousel) return;

  const track = aboutCarousel.querySelector("[data-about-track]");
  const slides = [...track.querySelectorAll(".portrait-frame")];
  const previousButton = aboutCarousel.querySelector("[data-about-prev]");
  const nextButton = aboutCarousel.querySelector("[data-about-next]");
  const currentLabel = aboutCarousel.querySelector("[data-about-current]");
  let activeIndex = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let isDragging = false;
  let updateFrame = 0;
  let isPaused = false;
  let autoplayTimer = 0;

  function slideStep() {
    if (slides.length < 2) return track.clientWidth;
    return slides[1].offsetLeft - slides[0].offsetLeft;
  }

  function updateCarouselState() {
    const step = slideStep();
    if (!Number.isFinite(step) || step <= 0) {
      activeIndex = 0;
      currentLabel.textContent = "01";
      previousButton.disabled = true;
      nextButton.disabled = slides.length < 2;
      return;
    }
    activeIndex = clamp(Math.round(track.scrollLeft / step), 0, slides.length - 1);
    currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  }

  function goToSlide(index) {
    activeIndex = clamp(index, 0, slides.length - 1);
    track.scrollTo({
      left: activeIndex * slideStep(),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    updateCarouselState();
  }

  function scheduleAutoplay() {
    window.clearTimeout(autoplayTimer);
    if (prefersReducedMotion || isPaused || slides.length < 2) return;
    autoplayTimer = window.setTimeout(() => {
      if (window.location.hash === "#about" && !document.hidden) {
        goToSlide((activeIndex + 1) % slides.length);
      }
      scheduleAutoplay();
    }, 4500);
  }

  function pauseAutoplay() {
    isPaused = true;
    window.clearTimeout(autoplayTimer);
  }

  function resumeAutoplay() {
    isPaused = false;
    scheduleAutoplay();
  }

  previousButton.addEventListener("click", () => {
    goToSlide(activeIndex - 1);
    scheduleAutoplay();
  });
  nextButton.addEventListener("click", () => {
    goToSlide(activeIndex + 1);
    scheduleAutoplay();
  });

  track.addEventListener("scroll", () => {
    window.cancelAnimationFrame(updateFrame);
    updateFrame = window.requestAnimationFrame(updateCarouselState);
  }, { passive: true });

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    pauseAutoplay();
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  function finishDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    goToSlide(Math.round(track.scrollLeft / slideStep()));
    resumeAutoplay();
  }

  track.addEventListener("pointerup", finishDrag);
  track.addEventListener("pointercancel", finishDrag);
  track.addEventListener("dragstart", (event) => event.preventDefault());
  aboutCarousel.addEventListener("mouseenter", pauseAutoplay);
  aboutCarousel.addEventListener("mouseleave", resumeAutoplay);
  aboutCarousel.addEventListener("focusin", pauseAutoplay);
  aboutCarousel.addEventListener("focusout", resumeAutoplay);
  document.addEventListener("visibilitychange", scheduleAutoplay);
  window.addEventListener("hashchange", scheduleAutoplay);
  window.addEventListener("resize", updateCarouselState);
  updateCarouselState();
  scheduleAutoplay();
}

function initializeAboutExperience() {
  const section = document.querySelector("#about");
  const book = section?.querySelector("[data-about-book]");
  const canvas = section?.querySelector("[data-about-paper-fx]");
  if (!section || !book) return null;

  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
  let introTimer = 0;

  function playIntro() {
    window.clearTimeout(introTimer);
    section.classList.remove("about-intro-ready");
    void section.offsetWidth;
    section.classList.add("about-intro-ready");
    introTimer = window.setTimeout(() => section.classList.add("about-intro-settled"), 1200);
  }

  section.addEventListener("pointermove", (event) => {
    const bounds = section.getBoundingClientRect();
    pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    book.style.setProperty("--about-pointer-x", `${(pointer.targetX - 0.5) * 2}`);
    book.style.setProperty("--about-pointer-y", `${(pointer.targetY - 0.5) * 2}`);
  }, { passive: true });

  if (!canvas || prefersReducedMotion) return { playIntro };
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });
  if (!gl) return { playIntro };

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const paperSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    void main() {
      vec2 px = v_uv * u_resolution;
      float fine = hash(floor(px * .72));
      float fiber = sin(px.x * .18 + sin(px.y * .037)) * .5 + .5;
      float gridX = 1.0 - smoothstep(.0, 1.15, abs(mod(px.x, 24.0) - .5));
      float gridY = 1.0 - smoothstep(.0, 1.15, abs(mod(px.y, 24.0) - .5));
      float grid = max(gridX, gridY);
      vec3 paper = vec3(.998, .987, .949);
      paper -= (fine * .018 + fiber * .008);
      paper = mix(paper, vec3(.20, .35, .58), grid * .16);
      gl_FragColor = vec4(paper, .94);
    }
  `;
  const compositeSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_scene;
    uniform vec2 u_pointer;
    uniform vec2 u_resolution;
    uniform float u_time;
    void main() {
      vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
      vec2 delta = (v_uv - u_pointer) * aspect;
      float distanceToPointer = length(delta);
      float wave = sin(distanceToPointer * 42.0 - u_time * 1.7) * exp(-distanceToPointer * 8.0);
      vec2 direction = distanceToPointer > .001 ? normalize(delta) / aspect : vec2(0.0);
      vec2 offset = direction * wave * .0027;
      vec3 base = texture2D(u_scene, v_uv + offset).rgb;
      float vignette = smoothstep(.95, .28, length((v_uv - .5) * vec2(.82, 1.0)));
      base += vec3(.018, .010, .0) * vignette;
      gl_FragColor = vec4(base, .92);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("About paper shader compile failed", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(fragmentSource) {
    const program = gl.createProgram();
    const vertex = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragment = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("About paper shader link failed", gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  const paperProgram = createProgram(paperSource);
  const compositeProgram = createProgram(compositeSource);
  if (!paperProgram || !compositeProgram) return { playIntro };

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  let width = 0;
  let height = 0;

  function bindProgram(program) {
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const nextWidth = Math.max(1, Math.round(section.clientWidth * dpr));
    const nextHeight = Math.max(1, Math.round(section.clientHeight * dpr));
    if (nextWidth === width && nextHeight === height) return;
    width = canvas.width = nextWidth;
    height = canvas.height = nextHeight;
    canvas.style.width = `${section.clientWidth}px`;
    canvas.style.height = `${section.clientHeight}px`;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function setCommonUniforms(program, seconds) {
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    if (resolution) gl.uniform2f(resolution, width, height);
    if (time) gl.uniform1f(time, seconds);
  }

  function renderAboutPaper(time) {
    if (!section.classList.contains("is-active") || document.hidden) {
      window.requestAnimationFrame(renderAboutPaper);
      return;
    }
    resize();
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;
    const seconds = time * 0.001;
    gl.viewport(0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    bindProgram(paperProgram);
    setCommonUniforms(paperProgram, seconds);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    bindProgram(compositeProgram);
    setCommonUniforms(compositeProgram, seconds);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(compositeProgram, "u_scene"), 0);
    gl.uniform2f(gl.getUniformLocation(compositeProgram, "u_pointer"), pointer.x, 1 - pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(renderAboutPaper);
  }

  window.addEventListener("resize", resize, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(section);
  window.requestAnimationFrame(renderAboutPaper);
  return { playIntro };
}

function initializePosterOrbit() {
  if (!posterOrbit) return;
  const grid = posterOrbit.querySelector("[data-poster-grid]");
  const items = [...(grid?.querySelectorAll("figure") || [])];
  if (!items.length) return;
  const graphicSection = posterOrbit.closest("#graphic-design");
  const preview = graphicSection?.querySelector("[data-graphic-preview]");
  const previewImage = graphicSection?.querySelector("[data-graphic-preview-image]");
  const previewCaption = graphicSection?.querySelector("[data-graphic-preview-caption]");
  const previewCount = graphicSection?.querySelector("[data-graphic-preview-count]");
  const previewClose = graphicSection?.querySelector("[data-graphic-preview-close]");
  const previewPrevious = graphicSection?.querySelector("[data-graphic-preview-prev]");
  const previewNext = graphicSection?.querySelector("[data-graphic-preview-next]");
  let currentProgress = 0.08;
  let targetProgress = currentProgress;
  let dragStartY = 0;
  let dragStartProgress = 0;
  let isDragging = false;
  let hoveredItem = null;
  let previousFrame = performance.now();
  let pointerX = -1000;
  let pointerY = -1000;
  let proximityFrame = 0;
  let selectedIndex = -1;
  let introProgressRemaining = 0;
  const introDuration = 3200;

  const groupDefinitions = [
    { start: 0, end: 4, label: "精选平面作品" },
    { start: 4, end: 6, label: "消防宣传海报" },
    { start: 6, end: 18, label: "春日古茗 VI" },
    { start: 18, end: items.length, label: "消防宣传 VI" },
  ];

  groupDefinitions.forEach((group, groupIndex) => {
    items.slice(group.start, group.end).forEach((item, localIndex) => {
      item.dataset.group = String(groupIndex + 1).padStart(2, "0");
      item.dataset.groupName = group.label;
      item.toggleAttribute("data-group-start", localIndex === 0);
    });
  });

  function layoutGrid() {
    const rect = posterOrbit.getBoundingClientRect();
    const compact = rect.width < 700;
    const columns = 2;
    const gridWidth = compact ? rect.width * 0.9 : rect.width * 0.46;
    const gridCenterOffset = compact ? 0 : -rect.width * 0.265;
    const itemGap = compact ? 14 : 18;
    const groupGap = compact ? 38 : 54;
    const baseWidth = compact ? Math.min(rect.width * 0.38, 158) : Math.min(gridWidth * 0.225, 220);
    const itemWidth = baseWidth;
    const itemHeight = baseWidth;
    const horizontalGap = itemWidth + 4;
    let rowCursor = 0;
    const trackItems = [];

    groupDefinitions.forEach((group, groupIndex) => {
      if (groupIndex) rowCursor += groupGap;
      const groupLength = group.end - group.start;
      const groupRows = Math.ceil(groupLength / columns);
      for (let rowIndex = 0; rowIndex < groupRows; rowIndex += 1) {
        const rowStart = group.start + rowIndex * columns;
        const rowIndices = [rowStart, rowStart + 1].filter((index) => index < group.end);
        rowIndices.forEach((index, column) => {
          trackItems[index] = {
            column,
            centerY: rowCursor + itemHeight / 2,
          };
        });
        rowCursor += itemHeight + itemGap;
      }
      rowCursor -= itemGap;
    });

    const loopHeight = rowCursor + groupGap;
    const scrollOffset = currentProgress * loopHeight;

    items.forEach((item, index) => {
      const { column, centerY } = trackItems[index];
      const columnCenter = (columns - 1) / 2;
      const unwrappedY = centerY - loopHeight / 2 - scrollOffset;
      const y = ((unwrappedY + loopHeight / 2) % loopHeight + loopHeight) % loopHeight - loopHeight / 2;
      const centerDistance = clamp(Math.abs(y) / (rect.height * 0.72), 0, 1);
      const depth = 1 - centerDistance;
      const x = gridCenterOffset
        + (column - columnCenter) * horizontalGap;
      const edgeFade = clamp((rect.height * 0.7 - Math.abs(y)) / (rect.height * 0.16), 0, 1);
      const opacity = edgeFade * (0.78 + depth * 0.22);

      item.style.width = `${itemWidth.toFixed(2)}px`;
      item.style.height = `${itemHeight.toFixed(2)}px`;
      item.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0)`;
      item.style.zIndex = "2";
      item.style.opacity = opacity.toFixed(3);
      item.style.filter = "none";
      item.style.pointerEvents = edgeFade > 0.2 ? "auto" : "none";
    });
  }

  function animateGrid(time) {
    const elapsed = Math.min(time - previousFrame, 48);
    previousFrame = time;
    if (!prefersReducedMotion && document.visibilityState === "visible" && window.location.hash === "#graphic-design") {
      if (introProgressRemaining > 0) {
        const introStep = Math.min(introProgressRemaining, elapsed / introDuration);
        targetProgress += introStep;
        introProgressRemaining -= introStep;
        posterOrbit.classList.add("is-intro-scanning");
      } else {
        posterOrbit.classList.remove("is-intro-scanning");
        targetProgress += elapsed * (hoveredItem ? 0.000003 : 0.0000105);
      }
    }
    currentProgress += (targetProgress - currentProgress) * 0.105;
    if (Math.abs(targetProgress - currentProgress) < 0.00005) currentProgress = targetProgress;
    layoutGrid();
    window.requestAnimationFrame(animateGrid);
  }

  function updateProximity() {
    proximityFrame = 0;
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.hypot(pointerX - (rect.left + rect.width / 2), pointerY - (rect.top + rect.height / 2));
      const proximity = clamp(1 - distance / 240, 0, 1);
      item.dataset.proximity = proximity.toFixed(3);
      item.classList.toggle("is-near", proximity > 0.18);
    });
  }

  function showPreview(index) {
    const source = items[index].querySelector("img");
    if (!source || !preview || !previewImage) return;
    previewImage.src = source.currentSrc || source.src;
    previewImage.alt = source.alt;
    previewCaption.textContent = source.alt;
    previewCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    selectedIndex = index;
    preview.classList.add("is-active");
    posterOrbit.classList.add("has-preview");
    items.forEach((item, itemIndex) => {
      const isSelected = itemIndex === index;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function closePreview() {
    preview?.classList.remove("is-active");
    posterOrbit.classList.remove("has-preview");
    previewImage?.removeAttribute("src");
    selectedIndex = -1;
    items.forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });
  }

  posterOrbit.addEventListener("wheel", (event) => {
    if (document.body.classList.contains("graphic-lightbox-open")) return;
    event.preventDefault();
    targetProgress += clamp(event.deltaY, -120, 120) * 0.00022;
  }, { passive: false });

  posterOrbit.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("figure")) {
      return;
    }
    isDragging = true;
    dragStartY = event.clientY;
    dragStartProgress = targetProgress;
    posterOrbit.classList.add("is-dragging");
  });

  posterOrbit.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!proximityFrame) proximityFrame = window.requestAnimationFrame(updateProximity);
    if (!isDragging) return;
    const distance = event.clientY - dragStartY;
    targetProgress = dragStartProgress - distance * 0.00042;
  });

  function finishDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    posterOrbit.classList.remove("is-dragging");
  }

  posterOrbit.addEventListener("pointerup", finishDrag);
  posterOrbit.addEventListener("pointercancel", finishDrag);
  posterOrbit.addEventListener("pointerleave", () => {
    pointerX = -1000;
    pointerY = -1000;
    hoveredItem = null;
    if (!proximityFrame) proximityFrame = window.requestAnimationFrame(updateProximity);
  });
  posterOrbit.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 1;
    targetProgress += direction * (event.key.startsWith("Page") ? 0.16 : 0.06);
  });
  window.addEventListener("resize", layoutGrid);
  grid?.addEventListener("dragstart", (event) => event.preventDefault());
  items.forEach((item, index) => {
    const image = item.querySelector("img");
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `在右侧查看：${image?.alt || `平面设计作品 ${index + 1}`}`);
    item.setAttribute("aria-pressed", "false");
    item.addEventListener("mouseenter", () => {
      hoveredItem = item;
      item.classList.add("is-hovered");
    });
    item.addEventListener("mouseleave", () => {
      if (hoveredItem === item) hoveredItem = null;
      item.classList.remove("is-hovered");
    });
    item.addEventListener("click", () => showPreview(index));
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      showPreview(index);
    });
    if (image && !image.complete) image.addEventListener("load", layoutGrid, { once: true });
  });
  previewClose?.addEventListener("click", closePreview);
  previewPrevious?.addEventListener("click", () => {
    const nextIndex = selectedIndex < 0 ? items.length - 1 : (selectedIndex - 1 + items.length) % items.length;
    showPreview(nextIndex);
  });
  previewNext?.addEventListener("click", () => {
    const nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % items.length;
    showPreview(nextIndex);
  });
  preview?.addEventListener("keydown", (event) => {
    if (!preview.classList.contains("is-active") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    showPreview((selectedIndex + direction + items.length) % items.length);
  });
  showPreview(0);
  layoutGrid();
  window.requestAnimationFrame(animateGrid);
  return {
    playIntro() {
      introProgressRemaining = prefersReducedMotion ? 0 : 1;
      layoutGrid();
    },
  };
}

function initializePaintingBrowser() {
  if (!paintingBrowser) return;
  const stageImage = paintingBrowser.querySelector(".painting-stage img");
  const titleButtons = [...paintingBrowser.querySelectorAll("[data-painting-src]")];

  titleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      titleButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      stageImage.classList.add("is-changing");
      window.setTimeout(() => {
        stageImage.src = button.dataset.paintingSrc;
        stageImage.alt = button.dataset.paintingAlt;
        stageImage.classList.remove("is-changing");
      }, prefersReducedMotion ? 0 : 160);
    });
  });
}

let motionObserver;
let motionRevealItems = [];

function initializeMotionReveals() {
  const selectors = [
    ".section-heading",
    ".research-intro",
    ".blog-index article",
    ".blog-entry header",
    ".blog-entry article > p",
    ".blog-entry article > h3",
    ".blog-entry blockquote",
    ".word-figure",
    ".word-figure-group",
    ".product-line-intro article",
    ".product-simulation",
    ".signal-card",
    ".product-category-heading",
    ".product-project",
    ".simulation-panel",
    ".product-project-gallery figure",
    ".product-image-wide",
    ".product-copy-grid > p",
    ".diy-research",
    ".diy-document-grid article",
    ".diy-project",
    ".diy-project-gallery figure",
    ".textile-item",
    ".textile-project",
    ".collection-heading",
    ".collection-note",
    ".collection-gallery figure",
    ".case-chapter",
    ".case-image",
    ".complete-image-gallery figure",
    ".graphic-catalog-heading",
    ".graphic-vi-project h4",
    ".poster-wall figure",
    ".poster-orbit",
    ".about-layout",
    ".about-copy > p",
    ".about-credentials section",
    ".contact-block",
    ".about-hobby-painting",
    ".painting-browser",
  ];

  motionRevealItems = [...document.querySelectorAll(selectors.join(","))]
    .filter((item, index, list) => (
      list.indexOf(item) === index
      && !item.closest("#about")
      && !item.closest("#content-analysis")
      && !item.closest("#article-toy-content-consumer")
      && !item.closest("#article-innovation-demand")
    ));

  motionRevealItems.forEach((item, index) => {
    item.classList.add("motion-reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 10, 7) * 44}ms`);
    item.classList.add("is-visible");
  });

}

function refreshMotionReveals() {
  if (!motionRevealItems.length) return;
  motionRevealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) return;
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      item.classList.add("is-visible");
      if (motionObserver) motionObserver.unobserve(item);
    }
  });
}

function initializeTiltInteractions() {
  const tiltItems = [...document.querySelectorAll([
    ".blog-index article",
    ".analysis-board article",
    ".simulation-panel",
    ".signal-card",
    ".product-project",
    ".product-project-gallery figure",
    ".diy-document-grid article",
    ".diy-project-gallery figure",
    ".textile-item",
    ".textile-preview img",
    ".collection-gallery figure",
    ".case-image",
    ".complete-image-gallery figure",
    ".poster-wall figure",
    ".about-copy > p",
    ".about-credentials",
    ".contact-block",
    ".painting-stage",
  ].join(","))].filter((item) => (
    !item.closest("#about") && !item.closest("#content-analysis")
  ));

  tiltItems.forEach((item) => {
    item.classList.add("motion-tilt");
    item.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion || event.pointerType === "touch") return;
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.setProperty("--tilt-x", `${(-y * 5.2).toFixed(2)}deg`);
      item.style.setProperty("--tilt-y", `${(x * 5.8).toFixed(2)}deg`);
      item.style.setProperty("--shine-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      item.style.setProperty("--shine-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    }, { passive: true });
    item.addEventListener("pointerleave", () => {
      item.style.removeProperty("--tilt-x");
      item.style.removeProperty("--tilt-y");
      item.style.removeProperty("--shine-x");
      item.style.removeProperty("--shine-y");
    });
  });
}

function initializeResearchCards() {
  const section = document.querySelector("#content-analysis");
  const cards = [...document.querySelectorAll(".research-card[data-article-target]")];
  const contentView = section?.querySelector(".research-content-view");
  const contentItems = [...(contentView?.querySelectorAll(".research-content-item") || [])];
  const closeButton = contentView?.querySelector(".research-content-close");
  if (!section || !cards.length || !contentView || !contentItems.length || !closeButton) return;

  const animationDuration = prefersReducedMotion ? 1 : 1180;
  let currentCard = null;
  let currentItem = null;
  let currentIndex = -1;
  let savedScrollY = 0;
  let isAnimating = false;
  let savedCardRect = null;
  let savedImageRect = null;

  const animate = (element, keyframes, options) => {
    if (!element?.animate) return Promise.resolve();
    const animation = element.animate(keyframes, options);
    return animation.finished.catch(() => undefined);
  };

  const copyArticleContent = () => {
    contentItems.forEach((item) => {
      const target = item.querySelector(".research-content-text");
      const source = document.querySelector(`${item.dataset.articleSource} article`);
      if (!target || !source || target.childElementCount) return;
      [...source.children].forEach((child) => {
        if (child.tagName === "HEADER") return;
        target.append(child.cloneNode(true));
      });
    });
  };

  const splitTitle = (title) => {
    if (!title || title.dataset.split === "true") return;
    const text = title.textContent;
    title.textContent = "";
    Array.from(text).forEach((character) => {
      const span = document.createElement("span");
      span.textContent = character === " " ? "\u00a0" : character;
      title.append(span);
    });
    title.dataset.split = "true";
  };

  const makeTransitionLayer = (className, rect, source) => {
    const layer = source.cloneNode(true);
    layer.removeAttribute("id");
    layer.removeAttribute("role");
    layer.removeAttribute("tabindex");
    layer.className = className;
    Object.assign(layer.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      pointerEvents: "none",
    });
    document.body.append(layer);
    return layer;
  };

  const revealContent = (item) => {
    item.classList.add("is-revealed");
    item.querySelectorAll(".research-content-title > span").forEach((letter, index) => {
      animate(letter, [
        { opacity: 0, transform: "translateY(50%)" },
        { opacity: 1, transform: "translateY(0)" },
      ], {
        duration: prefersReducedMotion ? 1 : 600,
        delay: prefersReducedMotion ? 0 : index * 42,
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        fill: "both",
      });
    });
  };

  const openCard = async (card) => {
    if (isAnimating || currentCard) return;
    isAnimating = true;
    currentCard = card;
    currentIndex = cards.indexOf(card);
    currentItem = contentItems[currentIndex];
    savedScrollY = window.scrollY;
    savedCardRect = card.getBoundingClientRect();
    const cardImage = card.querySelector(".blog-index-meta img");
    const cardBackground = card.querySelector(".research-card-bg");
    savedImageRect = cardImage.getBoundingClientRect();

    contentView.hidden = false;
    contentView.setAttribute("aria-hidden", "false");
    contentView.classList.add("is-active");
    currentItem.classList.add("is-current");
    contentView.scrollTop = 0;
    document.body.classList.add("research-content-transitioning", "research-content-open");

    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    const contentImage = currentItem.querySelector(".research-content-image");
    const targetImageRect = contentImage.getBoundingClientRect();
    const backgroundLayer = makeTransitionLayer("research-transition-bg", savedCardRect, cardBackground);
    const imageLayer = makeTransitionLayer("research-transition-image", savedImageRect, cardImage);
    const diagonal = Math.hypot(window.innerWidth, window.innerHeight) * 1.35;
    const cardAngle = currentIndex % 2 === 0 ? -4 : 4;

    card.classList.add("is-selected");
    cards.filter((item) => item !== card).forEach((item, index) => {
      animate(item, [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0)" },
      ], {
        duration: prefersReducedMotion ? 1 : 780,
        delay: prefersReducedMotion ? 0 : index * 70,
        easing: "cubic-bezier(0.86, 0, 0.07, 1)",
        fill: "both",
      });
    });

    card.querySelectorAll(".blog-index-copy, .blog-index-number, .blog-index-arrow").forEach((element) => {
      animate(element, [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(20px)" },
      ], { duration: prefersReducedMotion ? 1 : 480, easing: "ease-in", fill: "both" });
    });

    const backgroundAnimation = animate(backgroundLayer, [
      {
        left: `${savedCardRect.left}px`,
        top: `${savedCardRect.top}px`,
        width: `${savedCardRect.width}px`,
        height: `${savedCardRect.height}px`,
        transform: "translate(0, 0) rotate(0deg)",
      },
      {
        left: "50vw",
        top: "50vh",
        width: `${diagonal}px`,
        height: `${diagonal}px`,
        transform: `translate(-50%, -50%) rotate(${-cardAngle * 2}deg)`,
      },
    ], {
      duration: animationDuration,
      delay: prefersReducedMotion ? 0 : 380,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "both",
    });

    const imageAnimation = animate(imageLayer, [
      {
        left: `${savedImageRect.left}px`,
        top: `${savedImageRect.top}px`,
        width: `${savedImageRect.width}px`,
        height: `${savedImageRect.height}px`,
        transform: `rotate(${cardAngle}deg)`,
      },
      {
        left: `${targetImageRect.left}px`,
        top: `${targetImageRect.top}px`,
        width: `${targetImageRect.width}px`,
        height: `${targetImageRect.height}px`,
        transform: "rotate(0deg)",
      },
    ], {
      duration: animationDuration,
      delay: prefersReducedMotion ? 0 : 540,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "both",
    });

    await Promise.all([backgroundAnimation, imageAnimation]);
    contentView.classList.add("is-open");
    contentImage.style.visibility = "visible";
    cardImage.style.opacity = "0";
    backgroundLayer.remove();
    imageLayer.remove();
    revealContent(currentItem);
    document.body.classList.remove("research-content-transitioning");
    isAnimating = false;
    closeButton.focus({ preventScroll: true });
  };

  const closeContent = async () => {
    if (isAnimating || !currentCard || !currentItem) return;
    isAnimating = true;
    contentView.scrollTop = 0;
    await new Promise((resolve) => window.requestAnimationFrame(resolve));

    const cardImage = currentCard.querySelector(".blog-index-meta img");
    const cardBackground = currentCard.querySelector(".research-card-bg");
    const contentImage = currentItem.querySelector(".research-content-image");
    const startImageRect = contentImage.getBoundingClientRect();
    const targetCardRect = currentCard.getBoundingClientRect();
    const targetImageRect = cardImage.getBoundingClientRect();
    const diagonal = Math.hypot(window.innerWidth, window.innerHeight) * 1.35;
    const cardAngle = currentIndex % 2 === 0 ? -4 : 4;
    const backgroundLayer = makeTransitionLayer("research-transition-bg", {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
      width: diagonal,
      height: diagonal,
    }, cardBackground);
    backgroundLayer.style.transform = `translate(-50%, -50%) rotate(${-cardAngle * 2}deg)`;
    const imageLayer = makeTransitionLayer("research-transition-image", startImageRect, contentImage);

    document.body.classList.add("research-content-transitioning");
    currentItem.classList.remove("is-revealed");
    contentView.classList.remove("is-open");
    contentImage.style.visibility = "hidden";

    const backgroundAnimation = animate(backgroundLayer, [
      {
        left: "50vw",
        top: "50vh",
        width: `${diagonal}px`,
        height: `${diagonal}px`,
        transform: `translate(-50%, -50%) rotate(${-cardAngle * 2}deg)`,
      },
      {
        left: `${targetCardRect.left}px`,
        top: `${targetCardRect.top}px`,
        width: `${targetCardRect.width}px`,
        height: `${targetCardRect.height}px`,
        transform: "translate(0, 0) rotate(0deg)",
      },
    ], {
      duration: animationDuration,
      delay: prefersReducedMotion ? 0 : 140,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "both",
    });

    const imageAnimation = animate(imageLayer, [
      {
        left: `${startImageRect.left}px`,
        top: `${startImageRect.top}px`,
        width: `${startImageRect.width}px`,
        height: `${startImageRect.height}px`,
        transform: "rotate(0deg)",
      },
      {
        left: `${targetImageRect.left}px`,
        top: `${targetImageRect.top}px`,
        width: `${targetImageRect.width}px`,
        height: `${targetImageRect.height}px`,
        transform: `rotate(${cardAngle}deg)`,
      },
    ], {
      duration: animationDuration,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "both",
    });

    cards.filter((item) => item !== currentCard).forEach((item, index) => {
      animate(item, [
        { opacity: 0, transform: "scale(0)" },
        { opacity: 1, transform: "scale(1)" },
      ], {
        duration: prefersReducedMotion ? 1 : 780,
        delay: prefersReducedMotion ? 0 : 300 + index * 70,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      });
    });

    await Promise.all([backgroundAnimation, imageAnimation]);
    cardImage.style.opacity = "1";
    backgroundLayer.remove();
    imageLayer.remove();
    contentView.classList.remove("is-active");
    contentView.hidden = true;
    contentView.setAttribute("aria-hidden", "true");
    currentItem.classList.remove("is-current");
    currentCard.classList.remove("is-selected");
    currentCard.querySelectorAll(".blog-index-copy, .blog-index-number, .blog-index-arrow").forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel());
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
    });
    cards.forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
    document.body.classList.remove("research-content-transitioning", "research-content-open");
    window.scrollTo({ top: savedScrollY, behavior: "auto" });
    const cardToFocus = currentCard;
    currentCard = null;
    currentItem = null;
    currentIndex = -1;
    isAnimating = false;
    cardToFocus.focus({ preventScroll: true });
  };

  copyArticleContent();
  contentItems.forEach((item) => splitTitle(item.querySelector(".research-content-title")));

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion || event.pointerType === "touch" || currentCard) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--research-image-x", `${-15 + x * 30}px`);
      card.style.setProperty("--research-image-y", `${-10 + y * 20}px`);
      card.style.setProperty("--research-title-x", `${-8 + x * 16}px`);
      card.style.setProperty("--research-title-y", `${4 - y * 8}px`);
      card.style.setProperty("--research-number-x", `${-5 + x * 10}px`);
      card.style.setProperty("--research-number-y", `${-10 + y * 20}px`);
    }, { passive: true });

    card.addEventListener("pointerenter", () => card.classList.add("is-hovered"));
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-hovered");
      card.style.removeProperty("--research-image-x");
      card.style.removeProperty("--research-image-y");
      card.style.removeProperty("--research-title-x");
      card.style.removeProperty("--research-title-y");
      card.style.removeProperty("--research-number-x");
      card.style.removeProperty("--research-number-y");
    });

    card.addEventListener("click", (event) => {
      event.preventDefault();
      openCard(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCard(card);
    });
  });

  closeButton.addEventListener("click", closeContent);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && currentCard && !isAnimating) closeContent();
  });
}

function initializeHomeCdPlayer() {
  const player = document.querySelector("[data-home-cd-player]");
  const toggle = player?.querySelector("[data-home-cd-toggle]");
  const status = player?.querySelector("[data-home-cd-status]");
  const audio = player?.querySelector("[data-home-cd-audio]");
  if (!player || !toggle || !status || !audio) return;

  audio.volume = 0.32;

  const setVisualState = (playing, message) => {
    player.dataset.playing = String(playing);
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
    status.textContent = message || (playing ? "PLAYING · VINYL" : "PAUSED · 点击继续");
  };

  const playMusic = async () => {
    try {
      await audio.play();
      setVisualState(true, "PLAYING · VINYL");
    } catch (_error) {
      setVisualState(false, "点击播放 · 8BITE — 2025");
    }
  };

  const pauseMusic = () => {
    audio.pause();
    setVisualState(false);
  };

  toggle.addEventListener("click", () => {
    if (!audio.paused) pauseMusic();
    else playMusic();
  });

  audio.addEventListener("play", () => setVisualState(true, "PLAYING · VINYL"));
  audio.addEventListener("pause", () => setVisualState(false));
  audio.addEventListener("error", () => setVisualState(false, "音乐文件加载失败"));

  setVisualState(false, "点击播放 · 8BITE — 2025");
}

function initializePrinterTransition() {
  const printerLink = document.querySelector(".object-printer-link");
  if (!printerLink) return;

  let isTransitioning = false;
  const destination = printerLink.getAttribute("href") || "#contact";

  printerLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (isTransitioning) return;

    if (prefersReducedMotion) {
      window.location.hash = destination;
      return;
    }

    isTransitioning = true;
    const rect = printerLink.getBoundingClientRect();
    const overlay = document.createElement("div");
    const machine = printerLink.cloneNode(true);

    overlay.className = "printer-transition";
    overlay.setAttribute("aria-hidden", "true");
    machine.className = "printer-transition__machine";
    machine.removeAttribute("href");
    machine.removeAttribute("aria-label");
    machine.style.setProperty("--printer-from-left", `${rect.left}px`);
    machine.style.setProperty("--printer-from-top", `${rect.top}px`);
    machine.style.setProperty("--printer-from-width", `${rect.width}px`);
    machine.style.setProperty("--printer-from-height", `${rect.height}px`);
    overlay.append(machine);
    document.body.append(overlay);
    document.body.classList.add("printer-transitioning");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => overlay.classList.add("is-active"));
    });

    window.setTimeout(() => {
      overlay.classList.add("is-output");
      window.location.hash = destination;
    }, 860);

    window.setTimeout(() => {
      overlay.remove();
      document.body.classList.remove("printer-transitioning");
      isTransitioning = false;
    }, 1320);
  });
}

const subsectionRoutes = new Set([
  "#content-analysis",
  "#product-dev",
  "#textile-design",
  "#graphic-design",
  "#about",
]);

let subsectionTransitionRunning = false;

function navigateToSubsection(targetHash) {
  if (!subsectionRoutes.has(targetHash) || window.location.hash === targetHash || subsectionTransitionRunning) return;

  const updateRoute = () => {
    window.history.pushState(null, "", targetHash);
    showRoute();
  };

  if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
    updateRoute();
    return;
  }

  subsectionTransitionRunning = true;
  document.documentElement.classList.add("section-circle-transition");
  const originX = window.innerWidth - Math.min(42, window.innerWidth * 0.04);
  const originY = Math.min(42, window.innerHeight * 0.06);
  const radius = Math.hypot(Math.max(originX, window.innerWidth - originX), Math.max(originY, window.innerHeight - originY));
  const compactRadius = radius * 0.82;
  const transition = document.startViewTransition(updateRoute);

  transition.ready.then(() => {
    document.documentElement.animate({
      clipPath: [
        `circle(0px at ${originX}px ${originY}px)`,
        `circle(${compactRadius}px at ${originX}px ${originY}px)`,
        `circle(${radius}px at ${originX}px ${originY}px)`,
      ],
      offset: [0, 0.9, 1],
    }, {
      duration: 700,
      easing: "cubic-bezier(.22,.8,.22,1)",
      fill: "both",
      pseudoElement: "::view-transition-new(root)",
    });
  }).catch(() => {});

  transition.finished.finally(() => {
    document.documentElement.classList.remove("section-circle-transition");
    subsectionTransitionRunning = false;
  });
}

function initializeSubsectionTransitions() {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.classList.contains("object-printer-link")) return;
    const targetHash = link.getAttribute("href");
    if (!subsectionRoutes.has(targetHash)) return;
    event.preventDefault();
    navigateToSubsection(targetHash);
  });
}

function showRoute() {
  let route = window.location.hash.slice(1);
  if (route === "product-design") {
    route = "textile-design";
    window.history.replaceState(null, "", "#textile-design");
  }
  const activeSection = workSections.find((section) => section.id === route);
  const isDetail = Boolean(activeSection);
  const navRoute = route === "product-diy"
    ? "product-dev"
    : route.startsWith("article-")
      ? "content-analysis"
      : route;

  document.body.classList.toggle("detail-view", isDetail);
  document.body.classList.toggle("graphic-design-view", route === "graphic-design");
  document.body.classList.toggle("research-index-view", route === "content-analysis");
  workSections.forEach((section) => {
    section.classList.toggle("is-active", section === activeSection);
  });
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${navRoute}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (route === "contact") {
    window.scrollTo({ top: contactSection.offsetTop, behavior: "auto" });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  softenHeaderOnScroll();
  updateScrollMotion();
  window.requestAnimationFrame(refreshMotionReveals);
  if (route === "graphic-design") window.requestAnimationFrame(() => posterGridController?.playIntro());
  if (route === "about") window.requestAnimationFrame(() => aboutExperience?.playIntro());
}

envelopeStage.addEventListener("mouseenter", activateTypewriter);
envelopeStage.addEventListener("mouseleave", () => {
  if (!state.envelopeInView) envelopeStage.classList.remove("is-open");
});
envelopeStage.addEventListener("focus", activateTypewriter);
envelopeStage.addEventListener("blur", () => {
  if (!state.envelopeInView) envelopeStage.classList.remove("is-open");
});
envelopeStage.addEventListener("click", activateTypewriter);
envelopeStage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activateTypewriter();
});

createFloatingItems();
layoutWorks();
render();
initializeAboutCarousel();
const aboutExperience = initializeAboutExperience();
posterGridController = initializePosterOrbit();
initializePaintingBrowser();
initializeHomeAboutCopy();
initializeResearchCards();
initializeHomeCdPlayer();
initializePrinterTransition();
initializeSubsectionTransitions();
initializeProductLineJumps();
initializeProductProjectDirectory();
initializeGraphicImageViewer();
initializeProductVideoViewer();
initializeMotionReveals();
initializeTiltInteractions();
showRoute();
softenHeaderOnScroll();
updateEnvelopeOnScroll();
updateScrollMotion();

window.addEventListener("resize", () => {
  layoutWorks();
  updateEnvelopeOnScroll();
  updateScrollMotion();
});
hero.addEventListener("pointermove", handleHeroPointerMove, { passive: true });
heroCopy.addEventListener("pointerenter", scatterFromCenter, { passive: true });
heroCopy.addEventListener("click", scatterFromCenter);
window.addEventListener("scroll", scheduleScrollUpdates, { passive: true });
window.addEventListener("hashchange", showRoute);
window.addEventListener("popstate", showRoute);
