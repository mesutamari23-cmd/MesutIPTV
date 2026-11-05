# Génère les images source (icône + splash) pour @capacitor/assets
from PIL import Image, ImageDraw
import math

def gradient(size, c1, c2):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img

def mark(size, scale=1.0):
    """Lettre M stylisée dorée + triangle play, sur calque transparent."""
    L = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    s = size * scale
    o = (size - s) / 2
    gold = (245, 190, 70, 255)
    w = s * 0.13
    pts = [(o + s*0.22, o + s*0.74), (o + s*0.22, o + s*0.28), (o + s*0.5, o + s*0.58),
           (o + s*0.78, o + s*0.28), (o + s*0.78, o + s*0.74)]
    d.line(pts, fill=gold, width=int(w), joint="curve")
    for p in (pts[0], pts[-1], pts[1], pts[3]):
        d.ellipse([p[0]-w/2, p[1]-w/2, p[0]+w/2, p[1]+w/2], fill=gold)
    return L

S = 1024
bg = gradient(S, (14, 14, 40), (91, 45, 190))
icon = bg.convert("RGBA"); icon.alpha_composite(mark(S, 0.9)); icon.save("assets/icon-only.png")
gradient(S, (14, 14, 40), (91, 45, 190)).save("assets/icon-background.png")
mark(S, 0.62).save("assets/icon-foreground.png")  # zone sûre adaptative

def splash(path, c1, c2):
    W = 2732
    img = gradient(W, c1, c2).convert("RGBA")
    m = mark(1000, 0.9)
    img.alpha_composite(m, ((W-1000)//2, (W-1000)//2))
    img.save(path)
splash("assets/splash.png", (14, 14, 40), (30, 20, 80))
splash("assets/splash-dark.png", (8, 8, 24), (20, 12, 56))
print("ok")
