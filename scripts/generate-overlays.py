#!/usr/bin/env python3
"""Re-generate overlay images only."""

import os
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from pathlib import Path

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images"


def generate_and_save(prompt: str, filename: str):
    print(f"Generating: {filename}...")
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            print(f"  MIME type: {part.inline_data.mime_type}")
            print(f"  Data size: {len(part.inline_data.data)} bytes")
            print(f"  Header: {part.inline_data.data[:20]}")
            # Save raw bytes first
            raw_path = OUTPUT_DIR / filename
            raw_path.write_bytes(part.inline_data.data)
            # Re-open and re-save as proper PNG
            img = Image.open(BytesIO(part.inline_data.data))
            img.load()
            img.save(str(raw_path), format="PNG")
            print(f"  Saved: {filename} ({img.size[0]}x{img.size[1]})")
            return
    print(f"  ERROR: No image in response")


generate_and_save(
    "White fluffy clouds on a pure solid bright green background (hex #00FF00). "
    "The green background must be perfectly uniform #00FF00 with zero variation. "
    "Soft wispy clouds spread across the middle of the image horizontally. "
    "Wide landscape format. ONLY white clouds on flat #00FF00 green. No gradients in the background.",
    "clouds-overlay.png",
)

generate_and_save(
    "A glowing crescent moon on a pure solid bright green background (hex #00FF00). "
    "The green background must be perfectly uniform #00FF00 with zero variation. "
    "The moon is small, positioned in the upper area, with a soft white glow halo. "
    "Photorealistic moon with visible surface detail. ONLY the moon on flat #00FF00 green.",
    "moon-overlay.png",
)

print("Done!")
