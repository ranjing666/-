from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ENGINE_DIR = ROOT / "python_engine"
DIST_DIR = ENGINE_DIR / "dist" / "generator.exe"


def main() -> int:
    if shutil.which("pyinstaller") is None:
        print("PyInstaller 未安装，请先执行: npm run setup:python", file=sys.stderr)
        return 1

    subprocess.run(
        [
            "pyinstaller",
            "--noconfirm",
            "--clean",
            "--onefile",
            "--name",
            "generator",
            "generator_cli.py",
        ],
        cwd=ENGINE_DIR,
        check=True,
    )

    print(f"Generator packaged to {DIST_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
