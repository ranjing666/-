from __future__ import annotations

import argparse
import json
from pathlib import Path

from generator import validate_proxy, write_generation_artifacts


def main() -> int:
    parser = argparse.ArgumentParser(description="Script Generator Python Engine")
    parser.add_argument("mode", choices=["generate-script", "validate-proxy"])
    parser.add_argument("--input", required=True, help="Input JSON file")
    parser.add_argument("--output", required=True, help="Output JSON file")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    payload = json.loads(input_path.read_text(encoding="utf-8"))

    try:
        if args.mode == "generate-script":
            result = write_generation_artifacts(
                config=payload["config"],
                output_directory=payload["outputDirectory"],
            )
        else:
            result = validate_proxy(
                proxy_url=payload["proxyUrl"],
                timeout_seconds=int(payload.get("timeoutSeconds", 30)),
            )
    except Exception as exc:
        result = {
            "success": False,
            "error": str(exc),
        }
        output_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return 1

    output_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
