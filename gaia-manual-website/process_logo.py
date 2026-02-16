"""处理 GAIA Logo：去背景、裁掉底部 tagline，输出透明 PNG"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("需要 Pillow。运行: pip install Pillow")
    sys.exit(1)

root = Path(__file__).resolve().parent.parent
# 支持多种可能的文件名
candidates = ["GAIA-LOGO原图.png", "GAIA-LOGOԭͼ.png", "GAIA-logo.jpg", "GAIA-logo.png"]
src = None
for c in candidates:
    p = root / c
    if p.exists():
        src = p
        break
if not src:
    matches = list(root.glob("GAIA*logo*.*")) + list(root.glob("GAIA*LOGO*.*"))
    src = matches[0] if matches else None
if not src:
    print(f"未找到原图，请将 GAIA-LOGO原图.png 置于 {root}")
    sys.exit(1)
dst = Path(__file__).resolve().parent / "assets" / "logo.png"

img = Image.open(src).convert("RGBA")
w, h = img.size
data = img.getdata()

# 深蓝背景色阈值 (R, G, B) - 接近深蓝的像素变透明
def is_bg(pixel):
    r, g, b, a = pixel
    return r < 80 and g < 80 and b < 120  # 深蓝/深色

new_data = []
for p in data:
    new_data.append((p[0], p[1], p[2], 0) if is_bg(p) else p)

img.putdata(new_data)

# 裁掉底部 tagline：主 Logo 约在上方 65%，保留 margin
crop_h = int(h * 0.68)
img = img.crop((0, 0, w, crop_h))

#  Tight crop：找非透明像素边界
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

dst.parent.mkdir(parents=True, exist_ok=True)
img.save(dst, "PNG")
print(f"已保存: {dst}")
