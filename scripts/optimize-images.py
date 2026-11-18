#!/usr/bin/env python3
"""
Optimiza las fotos de AGOLD para la web.

Lee los originales de assets/{trabajos,maquillaje,alba,estudio}/*.jpg|png
y genera en assets/img/<carpeta>/ versiones WebP y AVIF en varios anchos
(y assets/img/manifest.json con los anchos de cada foto):

    assets/img/trabajos/01-francesa-leopardo-fantasmas-800.webp
    assets/img/trabajos/01-francesa-leopardo-fantasmas-800.avif
    ...

Uso (desde la raíz del repo):
    python3 -m pip install "Pillow>=11"     # Pillow 11+ ya trae AVIF
    python3 scripts/optimize-images.py

No sobrescribe archivos que ya existan salvo que pases --force.
Nunca amplía una foto: si el original mide 880 px, no se generan 1200/1600.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parent.parent
FOLDERS = ["trabajos", "maquillaje", "alba", "estudio"]
WIDTHS = [480, 800, 1200, 1600]
FORCE = "--force" in sys.argv
HAS_AVIF = features.check("avif")


def save(im, path, fmt):
    if path.exists() and not FORCE:
        return False
    if fmt == "webp":
        im.save(path, "WEBP", quality=80, method=6)
    else:
        im.save(path, "AVIF", quality=58, speed=4)
    return True


def main():
    if not HAS_AVIF:
        print("Aviso: tu Pillow no soporta AVIF; solo se generará WebP.")
    count = 0
    manifest = {}
    for folder in FOLDERS:
        src_dir = ROOT / "assets" / folder
        out_dir = ROOT / "assets" / "img" / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        for src in sorted(src_dir.glob("*")):
            if src.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            widths = [w for w in WIDTHS if w < im.width] + [min(im.width, WIDTHS[-1])]
            for w in sorted(set(widths)):
                h = round(im.height * w / im.width)
                resized = im.resize((w, h), Image.LANCZOS)
                for fmt in (["webp", "avif"] if HAS_AVIF else ["webp"]):
                    if save(resized, out_dir / f"{src.stem}-{w}.{fmt}", fmt):
                        count += 1
            manifest[f"{folder}/{src.stem}"] = {
                "widths": sorted(set(widths)),
                "ratio": round(im.width / im.height, 4),
            }
            print(f"✓ {folder}/{src.name}  →  {', '.join(str(w) for w in sorted(set(widths)))}")
    (ROOT / "assets" / "img" / "manifest.json").write_text(json.dumps(manifest, indent=1))
    print(f"\n{count} archivos generados en assets/img/")


if __name__ == "__main__":
    main()
