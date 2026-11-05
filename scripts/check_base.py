#!/usr/bin/env python3
"""Confirm a production build uses the GitHub Pages base path."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def main() -> None:
    base = sys.argv[1] if len(sys.argv) > 1 else "/frontend-eval-portfolio/"
    if not base.startswith("/") or not base.endswith("/"):
        raise SystemExit(f"base must look like /repo-name/, got {base}")
    index = (DIST / "index.html").read_text(encoding="utf-8")
    fallback = (DIST / "404.html").read_text(encoding="utf-8")
    if index != fallback:
        raise SystemExit("dist/404.html is not a copy of dist/index.html")
    if base not in index:
        raise SystemExit(f"{base} not found in dist/index.html")
    if 'src="/assets/' in index or 'href="/assets/' in index:
        raise SystemExit("an asset URL is missing the repository base")
    required = [
        "task-assets/cefr-gauge/mockup.svg",
        "task-assets/cefr-gauge/TASK.md",
        "task-assets/flashcards/mockup.svg",
        "task-assets/error-highlighter/mockup.svg",
        "task-assets/review/REVIEW.md",
        "downloads/cefr-gauge-task.zip",
        "downloads/flashcards-task.zip",
        "downloads/error-highlighter-task.zip",
        "downloads/task-design-pack.zip",
        "downloads/esl-eval-20261101.zip",
        "favicon.svg",
    ]
    for relative in required:
        path = DIST / relative
        if not path.is_file() or path.stat().st_size < 80:
            raise SystemExit(f"missing or tiny: dist/{relative}")
    common = (ROOT / "examples" / "esl-eval" / "esl_eval" / "common.py").read_text(encoding="utf-8")
    if 'HTTP-Referer": "https://github.com/esl-eval"' in common:
        raise SystemExit("placeholder GitHub referer is still the live header")
    print(f"base check passed for {base}")


if __name__ == "__main__":
    main()
