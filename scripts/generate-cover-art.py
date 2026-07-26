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


def create_git_workflow_cover():
    img = Image.new('RGB', (width, height), (30, 35, 55))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(35, 45, 75), (25, 30, 50)])

    # Branching lines
    colors = [(80, 170, 240), (100, 220, 180), (240, 180, 100), (220, 100, 140)]
    y_base = 340
    for i, c in enumerate(colors):
        y = y_base - 60 + i * 40
        draw.line([(180, y), (600, y)], fill=c, width=6)
        draw.ellipse([600 - 12, y - 12, 600 + 12, y + 12], fill=c)
        draw.line([(600, y), (720, y_base + (i - 1) * 50)], fill=c, width=6)
    draw.line([(180, y_base), (900, y_base)], fill=(120, 130, 160), width=8)
    draw.ellipse([900 - 16, y_base - 16, 900 + 16, y_base + 16], fill=(100, 220, 180))

    return img


def create_docker_practice_cover():
    img = Image.new('RGB', (width, height), (15, 50, 80))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(20, 70, 120), (10, 40, 70)])

    # Whale / container shapes
    draw.ellipse([380, 220, 820, 460], fill=(0, 130, 200), outline=(255, 255, 255), width=4)
    draw.ellipse([470, 290, 530, 350], fill=(255, 255, 255))
    draw.ellipse([550, 290, 610, 350], fill=(255, 255, 255))
    draw.ellipse([630, 290, 690, 350], fill=(255, 255, 255))
    draw.polygon([(600, 460), (580, 520), (620, 520)], fill=(0, 130, 200))

    return img


def create_linux_ops_cover():
    img = Image.new('RGB', (width, height), (20, 20, 25))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(25, 28, 35), (15, 18, 22)])

    # Terminal window
    draw.rounded_rectangle([250, 120, 950, 555], radius=16, fill=(30, 35, 42), outline=(60, 70, 85), width=3)
    draw.rounded_rectangle([250, 120, 950, 170], radius=16, fill=(50, 55, 65))
    draw.ellipse([280, 135, 300, 155], fill=(255, 100, 100))
    draw.ellipse([320, 135, 340, 155], fill=(255, 200, 80))
    draw.ellipse([360, 135, 380, 155], fill=(100, 220, 120))

    # Command lines
    prompt_color = (100, 220, 130)
    text_color = (200, 205, 215)
    for i, line in enumerate(['$ sudo systemctl restart nginx', '$ ufw allow 80/tcp', '$ journalctl -u app -f', '$ ps aux | grep node']):
        y = 210 + i * 70
        draw.text([290, y], '$', fill=prompt_color)
        draw.text([330, y], line[2:], fill=text_color)
    return img


def create_frontend_performance_cover():
    img = Image.new('RGB', (width, height), (245, 248, 252))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(240, 250, 255), (220, 235, 250)])

    # Speed gauge
    cx, cy = 600, 340
    draw.arc([cx - 180, cy - 180, cx + 180, cy + 180], start=0, end=180, fill=(200, 210, 220), width=24)
    draw.arc([cx - 180, cy - 180, cx + 180, cy + 180], start=0, end=140, fill=(60, 200, 140), width=24)
    draw.polygon([(cx, cy), (cx - 20, cy - 110), (cx + 20, cy - 110)], fill=(40, 60, 90))
    draw.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], fill=(40, 60, 90))

    # Metrics
    for i, (label, value) in enumerate([('LCP', '1.2s'), ('INP', '120ms'), ('CLS', '0.02')]):
        x = 180 + i * 220
        draw.rounded_rectangle([x, 480, x + 180, 560], radius=12, fill=(255, 255, 255), outline=(180, 200, 220), width=2)
    return img


def create_ai_model_guide_2025_cover():
    img = Image.new('RGB', (width, height), (18, 22, 38))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(25, 30, 55), (12, 16, 30)])

    # Podium bars
    heights = [220, 300, 180]
    colors = [(200, 180, 100), (120, 180, 240), (180, 120, 220)]
    x_positions = [360, 540, 720]
    for h, c, x in zip(heights, colors, x_positions):
        draw.rounded_rectangle([x, 500 - h, x + 120, 500], radius=10, fill=c)
    # Crown on first place
    draw.polygon([(360, 500 - 300 - 30), (390, 500 - 300 - 70), (420, 500 - 300 - 30)], fill=(255, 220, 80))
    return img


def create_ai_coding_agent_cover():
    img = Image.new('RGB', (width, height), (15, 20, 35))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(20, 28, 48), (10, 15, 28)])

    # Robot / agent head
    draw.rounded_rectangle([480, 180, 720, 420], radius=30, fill=(60, 70, 95), outline=(120, 220, 180), width=4)
    draw.ellipse([530, 250, 580, 300], fill=(120, 220, 180))
    draw.ellipse([620, 250, 670, 300], fill=(120, 220, 180))
    draw.rounded_rectangle([540, 340, 660, 370], radius=8, fill=(120, 220, 180))
    # Antenna
    draw.line([(600, 180), (600, 120)], fill=(120, 220, 180), width=6)
    draw.ellipse([585, 105, 615, 135], fill=(120, 220, 180))
    return img


def create_advanced_prompt_cover():
    img = Image.new('RGB', (width, height), (245, 250, 252))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(235, 248, 252), (215, 238, 245)])

    # Connected prompt blocks
    blocks = [
        (300, 200, 'Role'),
        (540, 200, 'Context'),
        (780, 200, 'Task'),
        (420, 380, 'Format'),
        (660, 380, 'Example'),
    ]
    for x, y, label in blocks:
        draw.rounded_rectangle([x, y, x + 140, y + 100], radius=16, fill=(255, 255, 255), outline=(80, 160, 180), width=3)
    # Connection lines
    for i in range(len(blocks) - 1):
        x1, y1 = blocks[i][0] + 70, blocks[i][1] + 100
        x2, y2 = blocks[i + 1][0] + 70, blocks[i + 1][1]
        draw.line([(x1, y1), (x2, y2)], fill=(80, 160, 180), width=3)
    return img


def create_local_llm_cover():
    img = Image.new('RGB', (width, height), (22, 26, 40))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, width, height, [(28, 35, 55), (16, 20, 32)])

    # Server box
    draw.rounded_rectangle([420, 180, 780, 480], radius=20, fill=(45, 55, 80), outline=(100, 180, 240), width=4)
    for i in range(4):
        y = 230 + i * 50
        draw.rounded_rectangle([460, y, 740, y + 28], radius=6, fill=(70, 85, 115))
        draw.ellipse([470, y + 7, 490, y + 21], fill=(100, 220, 140))
    # WiFi / local icon
    for i, r in enumerate([40, 60, 80]):
        draw.arc([600 - r, 100 - r, 600 + r, 100 + r], start=0, end=180, fill=(100, 180, 240), width=4)
    return img


covers = {
    'ai-writing.jpg': create_writing_cover,
    'ai-coding.jpg': create_coding_cover,
    'ai-image.jpg': create_image_cover,
    'prompt-engineering.jpg': create_prompt_cover,
    'git-workflow.jpg': create_git_workflow_cover,
    'docker-practice.jpg': create_docker_practice_cover,
    'linux-ops.jpg': create_linux_ops_cover,
    'frontend-performance.jpg': create_frontend_performance_cover,
    'ai-model-guide-2025.jpg': create_ai_model_guide_2025_cover,
    'ai-coding-agent.jpg': create_ai_coding_agent_cover,
    'advanced-prompt.jpg': create_advanced_prompt_cover,
    'local-llm.jpg': create_local_llm_cover,
}

for filename, fn in covers.items():
    img = fn()
    img.save(os.path.join(out_dir, filename), quality=90)
    print(f'Generated {filename}')
