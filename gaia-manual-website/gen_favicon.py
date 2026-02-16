"""从 logo.png 生成 favicon.ico"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("需要 Pillow: pip install Pillow"); exit(1)

base = Path(__file__).resolve().parent
src = base / "assets" / "logo.png"
dst = base / "favicon.ico"

if not src.exists():
    print(f"未找到 {src}"); exit(1)

img = Image.open(src).convert("RGBA")
icon = img.resize((32, 32), Image.Resampling.LANCZOS)
icon.save(dst, format="ICO")
print(f"已生成 {dst}")
