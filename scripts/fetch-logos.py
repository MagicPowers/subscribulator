"""
Fetches app-icon style logos for brands that are not in simple-icons and
normalises them into 192x192 square WebP tiles in src/assets/logos.

Usage: python3 scripts/fetch-logos.py [--force]
"""
import io
import os
import sys
import urllib.request

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "assets", "logos")
SIZE = 192

# id: (url for favicon lookup, mode, background, scale)
#   cover   -> image fills the tile (scale > 1 crops baked-in rounded corners)
#   contain -> image centred on the background at `scale` of the tile
LOGOS = {
    "amazon-prime": ("https://aboutamazon.com", "cover", "auto", 1.0),
    "prime-video": ("https://primevideo.com", "cover", "auto", 1.0),
    "amazon-music": ("https://music.amazon.com", "cover", "auto", 1.0),
    "disney-plus": ("https://disneyplus.com", "cover", "auto", 1.0),
    "hulu": ("https://hulu.com", "cover", "auto", 1.0),
    "peacock": ("https://peacocktv.com", "cover", "auto", 1.0),
    "discovery-plus": ("https://discoveryplus.com", "contain", "#0B1F4B", 0.8),
    "hayu": ("https://hayu.com", "cover", "auto", 1.14),
    "shudder": ("https://shudder.com", "contain", "#000000", 0.72),
    "tnt-sports": ("https://tntsports.co.uk", "cover", "auto", 1.0),
    "xbox": ("https://xbox.com", "contain", "#0B0B0B", 0.74),
    "nintendo": ("https://nintendo.com", "cover", "auto", 1.0),
    "microsoft": ("https://microsoft.com", "contain", "#FFFFFF", 0.54),
    "adobe": ("https://adobe.com", "contain", "#FFFFFF", 0.8),
    "canva": ("https://canva.com", "cover", "auto", 1.22),
    "chatgpt": ("https://chatgpt.com", "contain", "#FFFFFF", 0.86),
    "midjourney": ("https://midjourney.com", "contain", "#FFFFFF", 0.9),
    "grok": ("https://grok.com", "cover", "#000000", 1.14),
    "gemini": ("https://gemini.google.com", "contain", "#FFFFFF", 0.72),
    "oura": ("https://ouraring.com", "cover", "auto", 1.0),
    "myfitnesspal": ("https://myfitnesspal.com", "cover", "auto", 1.0),
    "calm": ("https://calm.com", "cover", "auto", 1.14),
    "zwift": ("https://zwift.com", "cover", "auto", 1.14),
    "les-mills": ("https://lesmills.com", "cover", "auto", 1.0),
    "economist": ("https://economist.com", "cover", "auto", 1.0),
    "ft": ("https://ft.com", "cover", "auto", 1.0),
    "costco": ("https://costco.co.uk", "contain", "#FFFFFF", 0.8),
    "ocado": ("https://ocado.com", "cover", "#FFFFFF", 1.1),
    "bumble": ("https://bumble.com", "cover", "auto", 1.14),
    "babbel": ("https://babbel.com", "cover", "auto", 1.0),
    "masterclass": ("https://masterclass.com", "cover", "auto", 1.0),
    "brilliant": ("https://brilliant.org", "contain", "#FFFFFF", 0.84),
    "ynab": ("https://ynab.com", "contain", "#FFFFFF", 0.78),
    "ee": ("https://ee.co.uk", "contain", "#FFFFFF", 0.76),
    "giffgaff": ("https://giffgaff.com", "cover", "auto", 1.0),
    "lime": ("https://li.me", "contain", "#FFFFFF", 0.8),
    "pret": ("https://pret.co.uk", "cover", "#FFFFFF", 1.0),
    "railcard": ("https://railcard.co.uk", "contain", "#FFFFFF", 0.9),
    "eir": ("https://eir.ie", "cover", "auto", 1.0),
    "espn": ("https://espn.com", "cover", "auto", 1.0),
    "stan": ("https://stan.com.au", "cover", "auto", 1.0),
    "binge": ("https://binge.com.au", "cover", "auto", 1.14),
    "kayo": ("https://kayosports.com.au", "cover", "auto", 1.0),
    "crave": ("https://crave.ca", "cover", "auto", 1.14),
}


def fetch(url: str) -> Image.Image:
    api = f"https://www.google.com/s2/favicons?domain_url={url}&sz=256"
    req = urllib.request.Request(api, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as res:
        return Image.open(io.BytesIO(res.read())).convert("RGBA")


def sample_bg(img: Image.Image) -> tuple:
    w, h = img.size
    for x, y in ((w // 2, int(h * 0.08)), (int(w * 0.08), h // 2), (w // 2, h // 2)):
        px = img.getpixel((x, y))
        if px[3] > 240:
            return px[:3] + (255,)
    return (255, 255, 255, 255)


def hex_rgba(value: str) -> tuple:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def build(img: Image.Image, mode: str, bg: str, scale: float) -> Image.Image:
    fill = sample_bg(img) if bg == "auto" else hex_rgba(bg)
    tile = Image.new("RGBA", (SIZE, SIZE), fill)
    target = int(SIZE * scale)
    resized = img.resize((target, target), Image.LANCZOS)
    offset = (SIZE - target) // 2
    if mode == "cover" and target >= SIZE:
        crop = -offset
        resized = resized.crop((crop, crop, crop + SIZE, crop + SIZE))
        offset = 0
    tile.alpha_composite(resized, (offset, offset))
    return tile.convert("RGB")


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    force = "--force" in sys.argv
    for key, (url, mode, bg, scale) in LOGOS.items():
        if not force and os.path.exists(os.path.join(OUT, f"{key}.webp")):
            continue
        try:
            img = fetch(url)
        except Exception as exc:  # noqa: BLE001
            print(f"!! {key}: {exc}")
            continue
        if img.width < 90:
            print(f"!! {key}: only {img.width}px, skipped")
            continue
        build(img, mode, bg, scale).save(os.path.join(OUT, f"{key}.webp"), "WEBP", quality=90, method=6)
        print(f"ok {key:16} {img.width}px")


if __name__ == "__main__":
    main()
