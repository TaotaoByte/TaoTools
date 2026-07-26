from PIL import Image, ImageDraw, ImageFont
import os

out_dir = 'public/covers'
os.makedirs(out_dir, exist_ok=True)

width, height = 1200, 675


def gradient_bg(draw, width, height, colors):
    for y in range(height):
        ratio = y / height
        r = int(colors[0][0] * (1 - ratio) + colors[1][0] * ratio)
        g = int(colors[0][1] * (1 - ratio) + colors[1][1] * ratio)
        b = int(colors[0][2] * (1 - ratio) + colors[1][2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def add_glow(draw, cx, cy, radius, color):
    for r in range(radius, 0, -3):
        alpha = int(30 * (r / radius))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, alpha), outline=(*color, alpha))


def create_writing_cover():
    img = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(235, 245, 255), (200, 220, 250)])

    # Abstract text lines
    for i in range(8):
        y = 180 + i * 45
        line_w = 500 - i * 30
        draw.rounded_rectangle([350, y, 350 + line_w, y + 12], radius=6, fill=(100, 130, 180, 120))

    # Pen icon
    draw.polygon([(900, 200), (950, 350), (850, 350)], fill=(80, 110, 160), outline=(60, 90, 140), width=3)
    draw.ellipse([820, 340, 980, 420], fill=(255, 255, 255, 200), outline=(80, 110, 160), width=3)

    return img


def create_coding_cover():
    img = Image.new('RGB', (width, height), (20, 25, 40))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(25, 30, 50), (15, 20, 35)])

    # Code brackets
    try:
        font = ImageFont.truetype("arial.ttf", 180)
    except Exception:
        font = ImageFont.load_default()
    draw.text((480, 250), "</>", font=font, fill=(100, 220, 150))

    # Abstract code lines
    for i in range(12):
        y = 100 + i * 40
        line_w = 200 + (i % 3) * 100
        draw.rounded_rectangle([100, y, 100 + line_w, y + 8], radius=4, fill=(80, 100, 130, 100))

    for i in range(10):
        y = 120 + i * 40
        line_w = 180 + (i % 4) * 80
        draw.rounded_rectangle([900, y, 900 + line_w, y + 8], radius=4, fill=(80, 100, 130, 100))

    return img


def create_image_cover():
    img = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(255, 220, 240), (220, 200, 255)])

    # Palette
    colors = [(255, 120, 180), (150, 120, 255), (80, 200, 220), (255, 200, 80)]
    for i, c in enumerate(colors):
        x = 450 + i * 80
        draw.ellipse([x, 280, x + 60, 340], fill=c, outline=(255, 255, 255), width=3)

    # Brush stroke
    draw.polygon([(700, 250), (850, 300), (720, 420)], fill=(180, 100, 220), outline=(150, 80, 190), width=3)

    # Sparkles
    for pos in [(350, 200), (900, 180), (300, 450), (950, 480)]:
        draw.polygon([(pos[0], pos[1] - 15), (pos[0] + 10, pos[1]), (pos[0], pos[1] + 15), (pos[0] - 10, pos[1])], fill=(255, 255, 255, 200))

    return img


def create_prompt_cover():
    img = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(220, 245, 250), (180, 230, 240)])

    # Chat bubble
    draw.rounded_rectangle([400, 200, 800, 420], radius=30, fill=(255, 255, 255), outline=(80, 160, 180), width=4)
    draw.polygon([(750, 420), (780, 470), (720, 420)], fill=(255, 255, 255), outline=(80, 160, 180), width=4)
    # Inner lines
    for i in range(4):
        y = 250 + i * 30
        line_w = 280 - i * 30
        draw.rounded_rectangle([430, y, 430 + line_w, y + 10], radius=5, fill=(120, 180, 190))

    # Gear
    cx, cy, r = 900, 320, 60
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(80, 160, 180), outline=(60, 130, 150), width=3)
    draw.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], fill=(220, 245, 250))

    return img


covers = {
    'ai-writing.jpg': create_writing_cover,
    'ai-coding.jpg': create_coding_cover,
    'ai-image.jpg': create_image_cover,
    'prompt-engineering.jpg': create_prompt_cover,
}

for filename, fn in covers.items():
    img = fn()
    img.save(os.path.join(out_dir, filename), quality=90)
    print(f'Generated {filename}')
