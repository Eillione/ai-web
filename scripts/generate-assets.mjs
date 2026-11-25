import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const worksDir = join(root, "assets", "works");
mkdirSync(worksDir, { recursive: true });

const palettes = [
  ["#f7efe8", "#304f4f", "#e59b73", "#cbd6c1", "#8fb3c8"],
  ["#f4f0f7", "#483248", "#d99aa5", "#f1c76c", "#79a68d"],
  ["#edf3f0", "#263b5e", "#bcd9ea", "#e86f61", "#f5e5a0"],
  ["#fff8ea", "#2c2a28", "#9bbf9c", "#eac1c6", "#7b8bb2"],
  ["#f0f4f2", "#6a3a35", "#deb15b", "#8ac0b6", "#d7d0e8"],
  ["#f6f1ec", "#1f3a32", "#d66159", "#e8d58c", "#9eb7cf"],
  ["#f3f2e9", "#322c5b", "#c85d7c", "#83b27b", "#d9b36c"],
  ["#eef4fb", "#203238", "#db7d6b", "#f1d2db", "#78a49a"],
];

function linePath(seed, width, height) {
  const points = [];
  const steps = 7 + (seed % 4);
  for (let i = 0; i <= steps; i += 1) {
    const x = (width / steps) * i;
    const y = height * (0.26 + ((Math.sin(seed * 0.7 + i * 1.3) + 1) * 0.18));
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

function blobPath(seed, width, height) {
  const cx = width * (0.35 + ((seed % 5) * 0.055));
  const cy = height * (0.46 + (((seed + 2) % 5) * 0.04));
  const rx = width * (0.2 + ((seed % 3) * 0.05));
  const ry = height * (0.18 + (((seed + 1) % 3) * 0.04));
  return [
    `M ${(cx - rx).toFixed(1)} ${cy.toFixed(1)}`,
    `C ${(cx - rx * 0.9).toFixed(1)} ${(cy - ry * 0.9).toFixed(1)}, ${(cx - rx * 0.25).toFixed(1)} ${(cy - ry * 1.2).toFixed(1)}, ${cx.toFixed(1)} ${(cy - ry).toFixed(1)}`,
    `C ${(cx + rx * 0.95).toFixed(1)} ${(cy - ry * 0.92).toFixed(1)}, ${(cx + rx * 1.18).toFixed(1)} ${(cy - ry * 0.05).toFixed(1)}, ${(cx + rx).toFixed(1)} ${cy.toFixed(1)}`,
    `C ${(cx + rx * 0.92).toFixed(1)} ${(cy + ry * 0.86).toFixed(1)}, ${(cx + rx * 0.1).toFixed(1)} ${(cy + ry * 1.18).toFixed(1)}, ${cx.toFixed(1)} ${(cy + ry).toFixed(1)}`,
    `C ${(cx - rx * 0.9).toFixed(1)} ${(cy + ry * 0.92).toFixed(1)}, ${(cx - rx * 1.14).toFixed(1)} ${(cy + ry * 0.18).toFixed(1)}, ${(cx - rx).toFixed(1)} ${cy.toFixed(1)}`,
    "Z",
  ].join(" ");
}

function workSvg(index) {
  const palette = palettes[(index - 1) % palettes.length];
  const width = 360 + ((index * 47) % 180);
  const height = 460 + ((index * 31) % 220);
  const [paper, ink, accent, soft, cool] = palette;
  const gradientId = `g${index}`;
  const noiseId = `n${index}`;
  const circleX = 70 + ((index * 37) % (width - 140));
  const circleY = 80 + ((index * 53) % (height - 170));
  const smallX = 40 + ((index * 61) % (width - 100));
  const smallY = 120 + ((index * 29) % (height - 180));
  const tapeX = width * (0.08 + ((index % 5) * 0.05));
  const tapeY = height * (0.08 + (((index + 3) % 6) * 0.06));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Elione work ${index}">
  <defs>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${paper}"/>
      <stop offset="0.52" stop-color="${soft}"/>
      <stop offset="1" stop-color="${cool}"/>
    </linearGradient>
    <filter id="${noiseId}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${index}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.13"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${gradientId})"/>
  <rect width="${width}" height="${height}" filter="url(#${noiseId})"/>
  <path d="${blobPath(index, width, height)}" fill="${accent}" opacity="0.72"/>
  <circle cx="${circleX}" cy="${circleY}" r="${36 + (index % 5) * 12}" fill="${ink}" opacity="0.12"/>
  <circle cx="${smallX}" cy="${smallY}" r="${18 + (index % 6) * 7}" fill="${cool}" opacity="0.55"/>
  <path d="${linePath(index, width, height)}" fill="none" stroke="${ink}" stroke-width="${1 + (index % 4) * 0.45}" opacity="0.72"/>
  <g opacity="0.46">
    <rect x="${tapeX.toFixed(1)}" y="${tapeY.toFixed(1)}" width="${(width * 0.2).toFixed(1)}" height="${(height * 0.08).toFixed(1)}" fill="${paper}" transform="rotate(${((index % 7) - 3) * 4} ${tapeX.toFixed(1)} ${tapeY.toFixed(1)})"/>
    <rect x="${(width * 0.66).toFixed(1)}" y="${(height * 0.64).toFixed(1)}" width="${(width * 0.2).toFixed(1)}" height="${(height * 0.08).toFixed(1)}" fill="${paper}" transform="rotate(${((index % 5) - 2) * -5} ${(width * 0.66).toFixed(1)} ${(height * 0.64).toFixed(1)})"/>
  </g>
  <g opacity="0.58" stroke="${ink}" stroke-width="1">
    <line x1="${width * 0.72}" y1="${height * 0.16}" x2="${width * 0.9}" y2="${height * 0.16}"/>
    <line x1="${width * 0.72}" y1="${height * 0.19}" x2="${width * 0.84}" y2="${height * 0.19}"/>
    <line x1="${width * 0.72}" y1="${height * 0.22}" x2="${width * 0.93}" y2="${height * 0.22}"/>
  </g>
</svg>`;
}

function ambientSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1400" viewBox="0 0 2200 1400">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b8def1"/>
      <stop offset="0.38" stop-color="#d7eff3"/>
      <stop offset="0.56" stop-color="#c9e6e4"/>
      <stop offset="1" stop-color="#92b9da"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c5e6e7"/>
      <stop offset="0.34" stop-color="#a6d1de"/>
      <stop offset="0.74" stop-color="#8fb6d4"/>
      <stop offset="1" stop-color="#7ea7cc"/>
    </linearGradient>
    <filter id="oilBlur" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="42"/>
      <feDisplacementMap in="SourceGraphic" scale="30"/>
      <feGaussianBlur stdDeviation="1.1"/>
    </filter>
    <filter id="paperGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="4" seed="19"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.12"/>
      </feComponentTransfer>
    </filter>
    <filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="3" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="18"/>
    </filter>
  </defs>
  <rect width="2200" height="1400" fill="#f2efe5"/>
  <rect width="2200" height="790" fill="url(#sky)"/>
  <rect y="630" width="2200" height="770" fill="url(#water)"/>
  <g filter="url(#oilBlur)">
    <ellipse cx="280" cy="180" rx="330" ry="92" fill="#f4f2df" opacity="0.52"/>
    <ellipse cx="1720" cy="86" rx="230" ry="74" fill="#f2efdc" opacity="0.56"/>
    <ellipse cx="1840" cy="370" rx="390" ry="92" fill="#d7e8e4" opacity="0.34"/>
    <path d="M0 520 C135 410 280 332 455 350 C610 366 742 488 908 468 C1070 448 1164 314 1344 350 C1500 382 1600 494 1772 472 C1906 456 2048 394 2200 402 L2200 694 L0 694 Z" fill="#6b8f7b" opacity="0.88"/>
    <path d="M0 504 C158 338 380 306 620 392 C756 444 876 526 1036 502 C1220 474 1320 326 1502 350 C1660 372 1762 506 1906 508 C2012 510 2100 470 2200 430 L2200 610 L0 610 Z" fill="#275e3e" opacity="0.44"/>
    <path d="M0 470 C160 330 370 300 560 354 C688 390 775 448 936 420 C1120 388 1218 286 1396 318 C1572 350 1645 438 1804 446 C1926 452 2062 400 2200 354 L2200 530 L0 530 Z" fill="#365c73" opacity="0.3"/>
    <path d="M0 624 C260 590 420 660 648 628 C902 594 982 562 1194 612 C1422 666 1648 602 1872 620 C1994 630 2102 658 2200 632 L2200 700 L0 700 Z" fill="#d9efea" opacity="0.42"/>
  </g>
  <g filter="url(#brush)" opacity="0.68">
    <path d="M0 706 C270 666 480 690 740 676 C1032 660 1280 706 1540 684 C1740 668 1980 650 2200 684" fill="none" stroke="#d5ede9" stroke-width="28" stroke-linecap="round"/>
    <path d="M0 790 C250 748 450 778 720 748 C960 720 1160 788 1450 764 C1720 742 1932 704 2200 724" fill="none" stroke="#7aaac9" stroke-width="16" stroke-linecap="round"/>
    <path d="M0 918 C300 872 570 904 852 882 C1130 860 1350 930 1648 890 C1846 864 2030 840 2200 866" fill="none" stroke="#c6e4e6" stroke-width="34" stroke-linecap="round"/>
    <path d="M80 1080 C348 1036 596 1096 848 1050 C1100 1004 1334 1084 1584 1040 C1772 1008 1980 992 2200 1024" fill="none" stroke="#789ec2" stroke-width="18" stroke-linecap="round"/>
    <path d="M0 1220 C300 1164 520 1228 760 1182 C1020 1132 1284 1214 1544 1172 C1800 1130 2010 1124 2200 1152" fill="none" stroke="#c5dceb" stroke-width="38" stroke-linecap="round"/>
  </g>
  <g opacity="0.18" filter="url(#brush)">
    <path d="M180 815 C480 760 690 800 920 770 C1190 736 1400 812 1680 770 C1860 744 2040 732 2180 752" fill="none" stroke="#f8f2df" stroke-width="42"/>
    <path d="M120 1010 C400 960 628 1008 880 972 C1130 936 1360 1000 1620 960 C1816 930 2016 920 2180 942" fill="none" stroke="#f8f2df" stroke-width="36"/>
  </g>
  <rect width="2200" height="1400" filter="url(#paperGrain)" opacity="0.86"/>
  <rect width="2200" height="1400" fill="#fff7e8" opacity="0.1"/>
</svg>`;
}

function portraitSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1180" viewBox="0 0 960 1180" role="img" aria-label="Elione portrait placeholder">
  <defs>
    <linearGradient id="portraitBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9d8dc"/>
      <stop offset="0.45" stop-color="#f4efe8"/>
      <stop offset="1" stop-color="#bed1d6"/>
    </linearGradient>
    <filter id="portraitGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="21"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.1"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="960" height="1180" fill="url(#portraitBg)"/>
  <rect width="960" height="1180" filter="url(#portraitGrain)"/>
  <ellipse cx="480" cy="380" rx="180" ry="198" fill="#2c342f" opacity="0.82"/>
  <path d="M296 422 C250 248 344 130 488 128 C642 126 728 264 678 458 C640 374 582 330 482 332 C382 334 330 376 296 422Z" fill="#40342f"/>
  <ellipse cx="480" cy="430" rx="138" ry="154" fill="#e2b6a2"/>
  <path d="M330 360 C402 314 520 330 644 274 C656 328 666 374 662 420 C598 348 468 380 330 360Z" fill="#40342f"/>
  <path d="M210 1090 C256 806 344 664 480 664 C618 664 706 806 750 1090Z" fill="#315550"/>
  <path d="M392 682 C418 724 446 746 480 746 C514 746 542 724 568 682 L600 820 C542 856 460 866 360 812Z" fill="#f1d2c2" opacity="0.88"/>
  <circle cx="432" cy="430" r="8" fill="#272522"/>
  <circle cx="530" cy="430" r="8" fill="#272522"/>
  <path d="M438 510 C474 532 512 532 548 510" fill="none" stroke="#7a473d" stroke-width="6" stroke-linecap="round"/>
  <text x="70" y="102" fill="#26342f" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="0">SHEN JIEWEI</text>
  <text x="70" y="142" fill="#26342f" font-family="Arial, Helvetica, sans-serif" font-size="18" opacity="0.62" letter-spacing="0">portrait placeholder</text>
</svg>`;
}

writeFileSync(join(root, "assets", "ambient-bg.svg"), ambientSvg());
writeFileSync(join(root, "assets", "portrait-placeholder.svg"), portraitSvg());

for (let index = 1; index <= 40; index += 1) {
  writeFileSync(join(worksDir, `work-${String(index).padStart(2, "0")}.svg`), workSvg(index));
}

console.log("Generated 40 work images, ambient background, and portrait placeholder.");
