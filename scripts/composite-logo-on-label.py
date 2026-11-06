# Replace a generated label's lettering with the authentic ZENO DETAIL logo, warped onto the
# label plane, when an image generator distorts the logo. Optional tool: needs Python 3, Pillow
# and numpy (not part of the npm build).
#
#   python3 scripts/composite-logo-on-label.py in.png out.png "TLx,TLy TRx,TRy BRx,BRy BLx,BLy" \
#       [u0,v0,u1,v1] [r,g,b]
#
# Corners are the label's outer corners in image pixels (top-left, top-right, bottom-right,
# bottom-left). The optional box places the logo inside the label (0–1 label coordinates, default
# 0.16,0.15,0.84,0.86); the colour is the thread colour (default 224,224,221). Light pixels inside
# the label are erased by diffusion inpainting, then the logo is warped with 4x supersampling.
# Example used for the home hero on 6 November 2026:
#   "1040,502.5 1170.5,514.5 1147,620 1006,605" 0.12,0.12,0.88,0.88 232,232,229
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst, quad = sys.argv[1], sys.argv[2], sys.argv[3]
region = [float(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '0.16,0.15,0.84,0.86').split(',')]
colour = np.array([float(v) for v in (sys.argv[5] if len(sys.argv) > 5 else '224,224,221').split(',')])
from pathlib import Path
LOGO = str(Path(__file__).resolve().parent.parent / 'assets/images/brand/zeno-logo-white-transparent-bg.png')

corners = np.array([[float(c) for c in p.split(',')] for p in quad.split()])  # TL, TR, BR, BL in image px

def homography(src_pts, dst_pts):
    A = []
    for (x, y), (u, v) in zip(src_pts, dst_pts):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array(dst_pts).reshape(8)
    h = np.linalg.solve(np.array(A), b)
    return np.append(h, 1).reshape(3, 3)

unit = [(0, 0), (1, 0), (1, 1), (0, 1)]
H = homography(unit, corners)          # label plane (u,v) -> image (x,y)
Hinv = np.linalg.inv(H)

image = Image.open(src).convert('RGB')
px = np.asarray(image).astype(np.float32)
h_img, w_img = px.shape[:2]
ys, xs = np.mgrid[0:h_img, 0:w_img]
pts = np.stack([xs.ravel(), ys.ravel(), np.ones(xs.size)])
uvw = Hinv @ pts
u = (uvw[0] / uvw[2]).reshape(h_img, w_img); v = (uvw[1] / uvw[2]).reshape(h_img, w_img)

# 1. Erase the generated lettering inside the label (bright pixels away from the stitched border).
inner = (u > 0.07) & (u < 0.93) & (v > 0.07) & (v < 0.93)
lum = px @ np.array([0.2126, 0.7152, 0.0722])
background = inner & (lum < 60)
mask = inner & (lum >= 48)
mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
mask = (np.asarray(mask_img) > 0) & inner
filled = px.copy()
filled[mask] = np.median(px[background], axis=0)
for _ in range(120):  # diffusion inpainting keeps the label's gentle lighting gradient
    blurred = np.asarray(Image.fromarray(filled.clip(0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(2))).astype(np.float32)
    filled[mask] = blurred[mask]
rng = np.random.default_rng(7)
texture = rng.normal(0, 2.2, size=filled.shape).astype(np.float32)
filled[mask] += texture[mask]

# 2. Warp the authentic logo into the same plane.
logo = Image.open(LOGO).convert('RGBA'); logo = logo.crop(logo.getbbox())
lw, lh = logo.size
u0, v0, u1, v1 = region
box_w, box_h = u1 - u0, v1 - v0
# keep the logo's aspect ratio inside the region (label plane is treated as square)
aspect = lw / lh
if box_w / box_h > aspect:
    w = box_h * aspect; u0 += (box_w - w) / 2; u1 = u0 + w
else:
    hgt = box_w / aspect; v0 += (box_h - hgt) / 2; v1 = v0 + hgt
plane_rect = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
img_rect = [tuple((H @ np.array([a, b, 1]))[:2] / (H @ np.array([a, b, 1]))[2]) for a, b in plane_rect]
# Supersample: render the warp at 4x over the logo's bounding box, then downscale (anti-aliased).
S = 4
bx0 = int(min(p[0] for p in img_rect)) - 2; by0 = int(min(p[1] for p in img_rect)) - 2
bx1 = int(max(p[0] for p in img_rect)) + 3; by1 = int(max(p[1] for p in img_rect)) + 3
big_rect = [((x - bx0) * S, (y - by0) * S) for x, y in img_rect]
src_logo = logo.split()[3].resize((lw // 2, lh // 2), Image.LANCZOS)
sw, sh = src_logo.size
T = homography(big_rect, [(0, 0), (sw, 0), (sw, sh), (0, sh)])  # supersampled box -> logo
coeffs = (T / T[2, 2]).ravel()[:8]
big = src_logo.transform(((bx1 - bx0) * S, (by1 - by0) * S), Image.PERSPECTIVE, tuple(coeffs), Image.BICUBIC)
small = big.resize((bx1 - bx0, by1 - by0), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.25))
alpha = Image.new('L', (w_img, h_img), 0); alpha.paste(small, (bx0, by0))
a = (np.asarray(alpha).astype(np.float32) / 255.0)[..., None]
thread = colour + rng.normal(0, 2.5, size=filled.shape)  # slight woven-thread variation
out = filled * (1 - a) + thread * a
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst)
print('placed logo at', [tuple(round(c, 1) for c in p) for p in img_rect])
