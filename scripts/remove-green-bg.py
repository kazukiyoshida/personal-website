#!/usr/bin/env python3
"""Remove green background from overlay images and make transparent."""

from PIL import Image
import numpy as np
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images"


def remove_green_bg(filename: str):
    """Remove green background and save as transparent PNG."""
    path = OUTPUT_DIR / filename
    img = Image.open(path).convert("RGBA")
    data = np.array(img, dtype=np.float32)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Calculate how "green" each pixel is (0 = not green, 1 = pure green)
    max_rb = np.maximum(r, b)
    greenness = np.clip((g - max_rb) / (g + 1), 0, 1)

    # Aggressive: anything with noticeable green dominance becomes transparent
    # Also catch the glow area around objects
    green_strong = greenness > 0.15
    green_medium = greenness > 0.05

    # New alpha: inverse of greenness
    new_alpha = np.ones_like(a) * 255
    new_alpha[green_strong] = 0
    new_alpha[green_medium & ~green_strong] = np.clip(
        (1 - greenness[green_medium & ~green_strong] * 4) * 255, 0, 255
    )

    # Also desaturate remaining green tint from the subject
    # Shift green-tinted pixels toward white/gray
    remaining = new_alpha > 0
    green_tint = np.clip(g - max_rb, 0, None)
    # Reduce green channel where there's residual green tint
    g_fixed = np.clip(g - green_tint * 0.7, 0, 255)

    data[:, :, 1] = g_fixed
    data[:, :, 3] = new_alpha

    result = Image.fromarray(data.astype(np.uint8))
    result.save(str(path))
    print(f"Processed: {filename}")


remove_green_bg("clouds-overlay.png")
remove_green_bg("moon-overlay.png")
print("Done!")
