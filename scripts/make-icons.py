"""
Renders the Subscribulator logo mark (public/favicon.svg) as PNG app icons.

Usage: python3 scripts/make-icons.py
"""
import os

from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "public")
FROM, TO = (255, 179, 71), (255, 45, 149)  # same gradient as favicon.svg
SUPERSAMPLE = 4


def gradient(size: int) -> Image.Image:
    """Diagonal gradient from top-left to bottom-right."""
    ramp = Image.linear_gradient("L").rotate(45, expand=True, resample=Image.BICUBIC)
    w, h = ramp.size
    ramp = ramp.crop((w // 4, h // 4, w - w // 4, h - h // 4)).resize((size, size), Image.BICUBIC)
    return Image.composite(Image.new("RGB", (size, size), TO), Image.new("RGB", (size, size), FROM), ramp)


def logo(size: int, rounded: bool) -> Image.Image:
    s = size * SUPERSAMPLE
    u = s / 32  # favicon.svg uses a 32×32 viewBox
    art = gradient(s).convert("RGBA")
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    white = lambda a: (255, 255, 255, int(255 * a))  # noqa: E731
    draw.rounded_rectangle((0, 0, 32 * u, 16 * u), radius=10 * u, fill=white(0.14))
    for y, width, alpha in ((8.5, 17, 1), (14.3, 12, 0.78), (20.1, 7, 0.56)):
        draw.rounded_rectangle((7.5 * u, y * u, (7.5 + width) * u, (y + 3.4) * u), radius=1.7 * u, fill=white(alpha))
    draw.ellipse(((21.8 - 3.6) * u, (21.8 - 3.6) * u, (21.8 + 3.6) * u, (21.8 + 3.6) * u), fill=white(1))
    art.alpha_composite(layer)
    if rounded:
        mask = Image.new("L", (s, s), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), radius=10 * u, fill=255)
        art.putalpha(mask)
    return art.resize((size, size), Image.LANCZOS)


def main() -> None:
    # iOS and Android maskable icons must be full-bleed; the OS applies its own rounding.
    targets = {
        "apple-touch-icon.png": (180, False),
        "icon-192.png": (192, True),
        "icon-512.png": (512, True),
        "icon-maskable-512.png": (512, False),
    }
    for name, (size, rounded) in targets.items():
        logo(size, rounded).save(os.path.join(OUT, name), optimize=True)
        print(f"ok {name}")


if __name__ == "__main__":
    main()
