#!/usr/bin/env python3
"""Copy task files into public/ and zip the downloads the site links to."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "tasks"
PUBLIC = ROOT / "public"
TASK_ASSETS = PUBLIC / "task-assets"
DOWNLOADS = PUBLIC / "downloads"

TASKS = {
    "cefr-gauge": [
        "src/components/CefrGauge.tsx",
        "src/data/samples.ts",
    ],
    "flashcards": [
        "src/components/FlashcardDeck.tsx",
        "src/data/samples.ts",
    ],
    "error-highlighter": [
        "src/components/ErrorHighlighter.tsx",
        "src/data/samples.ts",
    ],
}

PROVENANCE = """Self-initiated, AI-assisted demonstration.
The SVG mockup was authored as SVG markup for this demonstration.
It was not drawn by hand by Dami.
This is not client work and not an official micro1 deliverable.
"""


def zip_dir(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        destination.unlink()
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(source.rglob("*")):
            if path.is_file() and "__pycache__" not in path.parts and path.suffix != ".pyc":
                archive.write(path, path.relative_to(source).as_posix())


def copy_task(name: str) -> Path:
    src = CONTENT / name
    dest = TASK_ASSETS / name
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    return dest


def build_task_zip(name: str, staging: Path) -> None:
    folder = staging / name
    if folder.exists():
        shutil.rmtree(folder)
    shutil.copytree(CONTENT / name, folder)
    reference = folder / "reference"
    reference.mkdir()
    for relative in TASKS[name]:
        source = ROOT / relative
        target = reference / source.name
        shutil.copy2(source, target)
    (folder / "PROVENANCE.txt").write_text(PROVENANCE, encoding="utf-8")
    zip_dir(folder, DOWNLOADS / f"{name}-task.zip")


def main() -> None:
    if TASK_ASSETS.exists():
        shutil.rmtree(TASK_ASSETS)
    TASK_ASSETS.mkdir(parents=True)
    DOWNLOADS.mkdir(parents=True, exist_ok=True)

    for name in TASKS:
        copy_task(name)
    review_dest = TASK_ASSETS / "review"
    if review_dest.exists():
        shutil.rmtree(review_dest)
    shutil.copytree(CONTENT / "review", review_dest)

    staging = ROOT / ".pack-staging"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir()
    for name in TASKS:
        build_task_zip(name, staging)
    shutil.copy2(CONTENT / "PACK_README.md", staging / "README.md")
    shutil.copytree(CONTENT / "review", staging / "review")
    (staging / "PROVENANCE.txt").write_text(PROVENANCE, encoding="utf-8")
    zip_dir(staging, DOWNLOADS / "task-design-pack.zip")

    eval_root = ROOT / "examples" / "esl-eval"
    common = (eval_root / "esl_eval" / "common.py").read_text(encoding="utf-8")
    live = 'HTTP-Referer": "https://github.com/esl-eval"'
    if live in common:
        raise SystemExit("common.py still sends the placeholder GitHub referer")
    zip_dir(eval_root, DOWNLOADS / "esl-eval-20261101.zip")
    shutil.rmtree(staging)
    print(f"packed downloads in {DOWNLOADS}")


if __name__ == "__main__":
    main()
