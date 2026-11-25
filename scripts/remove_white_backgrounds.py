#!/usr/bin/env python3
"""Create transparent PNG variants for referenced images with white backgrounds."""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILES = ("index.html", "styles.css", "script.js")
ASSET_PATTERN = re.compile(
    r"assets/[A-Za-z0-9_./()\-\u4e00-\u9fff ]+?\.(?:jpg|jpeg|png|webp)",
    re.IGNORECASE,
)


def referenced_images() -> list[Path]:
    references: set[str] = set()
    for source_name in SOURCE_FILES:
        source = ROOT / source_name
        references.update(ASSET_PATTERN.findall(source.read_text(errors="ignore")))
    return sorted(ROOT / reference for reference in references if (ROOT / reference).exists())


def has_white_edge_background(image: Image.Image) -> bool:
    preview = image.convert("RGB")
    preview.thumbnail((320, 320))
    rgb = np.asarray(preview, dtype=np.int16)
    height, width = rgb.shape[:2]
    band = max(1, min(width, height) // 30)
    edge = np.concatenate(
        (
            rgb[:band, :, :].reshape(-1, 3),
            rgb[-band:, :, :].reshape(-1, 3),
            rgb[:, :band, :].reshape(-1, 3),
            rgb[:, -band:, :].reshape(-1, 3),
        ),
        axis=0,
    )
    near_white = (edge.min(axis=1) >= 242) & (np.ptp(edge, axis=1) <= 12)
    return float(near_white.mean()) >= 0.55


def connected_white_mask(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    near_white = (rgb.min(axis=2) >= 232) & (np.ptp(rgb, axis=2) <= 32)
    candidate = Image.fromarray((near_white * 255).astype(np.uint8), mode="L")
    width, height = candidate.size
    draw = ImageDraw.Draw(candidate)
    fill_value = 128
    stride = max(1, min(width, height) // 80)

    seeds = []
    for x in range(0, width, stride):
        seeds.extend(((x, 0), (x, height - 1)))
    for y in range(0, height, stride):
        seeds.extend(((0, y), (width - 1, y)))

    for seed in seeds:
        if candidate.getpixel(seed) == 255:
            ImageDraw.floodfill(candidate, seed, fill_value, thresh=0)

    background = np.asarray(candidate) == fill_value
    return Image.fromarray((background * 255).astype(np.uint8), mode="L")


def make_transparent(source: Path) -> tuple[Path, float] | None:
    image = Image.open(source).convert("RGBA")
    if not has_white_edge_background(image):
        return None

    background_mask = connected_white_mask(image)
    coverage = float(np.asarray(background_mask, dtype=np.float32).mean() / 255)
    if coverage < 0.08:
        return None

    softened_background = background_mask.filter(ImageFilter.GaussianBlur(radius=0.9))
    rgba = np.asarray(image, dtype=np.uint8).copy()
    original_alpha = rgba[:, :, 3].astype(np.float32)
    background_alpha = np.asarray(softened_background, dtype=np.float32) / 255
    rgba[:, :, 3] = np.clip(original_alpha * (1 - background_alpha), 0, 255).astype(np.uint8)

    destination = source.with_name(f"{source.stem}-transparent.png")
    Image.fromarray(rgba, mode="RGBA").save(destination, optimize=True)
    return destination, coverage


def update_references(mapping: dict[str, str]) -> None:
    for source_name in SOURCE_FILES:
        source = ROOT / source_name
        text = source.read_text()
        for original, replacement in mapping.items():
            text = text.replace(original, replacement)
        source.write_text(text)


def main() -> None:
    mapping: dict[str, str] = {}
    report = []
    for source in referenced_images():
        result = make_transparent(source)
        if result is None:
            continue
        destination, coverage = result
        original_reference = source.relative_to(ROOT).as_posix()
        destination_reference = destination.relative_to(ROOT).as_posix()
        mapping[original_reference] = destination_reference
        report.append(
            {
                "source": original_reference,
                "transparent": destination_reference,
                "removed_background_ratio": round(coverage, 4),
            }
        )

    update_references(mapping)
    manifest = ROOT / "assets" / "transparent-background-manifest.json"
    manifest.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Created and linked {len(report)} transparent PNG images.")


if __name__ == "__main__":
    main()
