import argparse
import sys
from pathlib import Path
from typing import Optional

try:
    from playwright.sync_api import sync_playwright

    playwright_installed = True
except ImportError:
    playwright_installed = False


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Save a full-page PNG next to every HTML screen.")
    parser.add_argument("folder", help="Design folder that contains the screens/ subfolder")
    return parser.parse_args()


def find_screen_files(screens_folder: Path) -> list[Path]:
    return sorted(screens_folder.glob("*.html"))


def find_marker_width(screen_name: str) -> Optional[int]:
    marker_widths = {"M": 375, "T": 768, "P": 1440}
    for name_part in screen_name.split("--"):
        if name_part in marker_widths:
            return marker_widths[name_part]
    return None


def screenshot_all_screens(screens: list[Path]) -> tuple[int, int]:
    viewport_height = 900
    tailwind_settle_ms = 700
    screenshot_count = 0
    skipped_count = 0
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        for screen_file in screens:
            if screen_file.stem.lower() == "index":
                continue
            viewport_width = find_marker_width(screen_file.stem)
            if viewport_width is None:
                print(f"Skipped {screen_file.name} - no size marker (rename it with --M, --T, or --P)")
                skipped_count += 1
                continue
            png_file = screen_file.with_suffix(".png")
            page.set_viewport_size({"width": viewport_width, "height": viewport_height})
            page.goto(screen_file.resolve().as_uri(), wait_until="networkidle")
            page.wait_for_timeout(tailwind_settle_ms)
            page.screenshot(path=str(png_file), full_page=True)
            print(f"Saved {png_file.name} at {viewport_width}px")
            screenshot_count += 1
        browser.close()
    return screenshot_count, skipped_count


def main() -> int:
    if not playwright_installed:
        print("Playwright is not installed. Run these two commands once, then run the script again:")
        print("  pip install playwright")
        print("  playwright install chromium")
        return 1
    arguments = parse_arguments()
    design_folder = Path(arguments.folder)
    screens_folder = design_folder / "screens"
    if not screens_folder.is_dir():
        print(f"No screens folder found at {screens_folder}")
        return 1
    screens = find_screen_files(screens_folder)
    if not screens:
        print(f"No HTML files found in {screens_folder}")
        return 1
    screenshot_count, skipped_count = screenshot_all_screens(screens)
    print(f"Done - {screenshot_count} full-page screenshots saved in {screens_folder}")
    if skipped_count > 0:
        print(f"{skipped_count} files skipped - no --M, --T, or --P marker in the file name")
    return 0


if __name__ == "__main__":
    sys.exit(main())
