#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TaoTools 文章封面生成器 —— 纸 / 墨 / 朱砂（技术书封面风格）

设计规则（全部封面共用一套骨架，只换配色主题和底部图形）
------------------------------------------------------------------
1. 画布固定 1200x675，输出文件名与扩展名与 `src/data/*.json` 中 `cover`
   字段完全一致（17 个 .jpg + 5 个 .png），不允许改名或改格式。

2. 背景只有两种，规则明确：
     - 纸：`#FAFAF9`（默认，16 张）
     - 墨：`#1C1917`（仅 6 张「需要边敲边看」的文章：命令行 / 配置 / 快捷键
       速查类，即 linux-ops、git-commands、nginx-deploy、vscode-shortcuts、
       docker-basic、ssh-github-setup）
   深色只是「终端感」的语义标记，不是装饰，所以只是一个刻意选定的小子集。

3. 调色板写死，不允许出现其它颜色：
     纸 #FAFAF9 / 墨 #1C1917 / 暖灰 #E7E5E4 #A8A29E #57534E #44403C /
     朱砂 #B84A2B。
   朱砂每张封面只出现 3 处极小面积：顶部小方块、标题下的短线、底部图形里
   的一个节点/数字。

4. 明令禁止：霓虹渐变、紫/蓝/品红/青、发光、彩色投影、3D 球体、发光大脑、
   机器人、电路板、emoji、随机噪点。全部图形都是 1~2px 细线 + 直角矩形。

5. 版式骨架（所有封面一致，形成系列感）：
     y=56   顶部元信息行：朱砂小方块 + 分类（中文）+ 右侧等宽序号 `01 / 22`
     y=100  发丝分隔线
     y=110  右上角 2 行点阵（图纸感，极淡）
     y≈152  中文短标题，左对齐，自动测量后取最大可容纳字号（72~140px），
            最多 2 行，宽度硬上限 1000px（光学右边界），绝不溢出、绝不裁切；
            折行只在词/字边界发生，不会把 Prompt 劈成 Promp + t；
            下方接朱砂短线 + 灰色延长线
     y=520  底部图形区：4 个等宽单元格，细线图示 + 等宽数字 01~04
     y=600  图形基线（发丝线）

6. 字体全部显式加载，并做 tofu（缺字方框）检测：把候选字体的字形位图与
   该字体的 .notdef 位图逐字节比较，相同即判定缺字，自动换下一个候选字体。
   中文：msyhbd.ttc → simhei.ttf → Dengb.ttf → Noto Sans SC Bold → msyh.ttc
   等宽：consolab.ttf → consola.ttf → courbd.ttf → arialbd.ttf → arial.ttf

7. 幂等：没有任何随机数，重复执行会得到完全相同的 22 个文件。

用法
------------------------------------------------------------------
    python scripts/generate-cover-art.py            # 重新生成全部封面
    python scripts/generate-cover-art.py --verify   # 只校验已有文件，不写入
"""

from __future__ import annotations

import argparse
import os
import sys

from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# 画布 / 调色板
# ---------------------------------------------------------------------------
W, H = 1200, 675
MARGIN = 78
RIGHT = W - MARGIN
CONTENT_W = RIGHT - MARGIN

PAPER = (250, 250, 249)       # #FAFAF9
INK = (28, 25, 23)            # #1C1917
RULE = (231, 229, 228)        # #E7E5E4
GREY_LIGHT = (168, 162, 158)  # #A8A29E
GREY_MID = (87, 83, 78)       # #57534E
GREY_DARK = (68, 64, 60)      # #44403C
CINNABAR = (184, 74, 43)      # #B84A2B

META_BASE_Y = 68          # 元信息行文字基线
RULE_Y = 100              # 顶部发丝线
DOTGRID_Y = 116           # 右上点阵首行
BAND_TOP = 152            # 标题区
BAND_H = 320
CELL_TOP = 520            # 底部图形区
BASE_Y = 600              # 图形基线
GAP = 28
CELL_W = (CONTENT_W - 3 * GAP) // 4
NUM_BASE_Y = 634          # 单元格编号基线
TITLE_MIN, TITLE_MAX = 72, 140
TITLE_MAX_W = 1000        # 标题的光学右边界（比版心窄 44px，避免顶到右边）


class Theme:
    """两种主题（纸 / 墨），字段含义一一对应。"""

    def __init__(self, dark: bool):
        self.dark = dark
        if dark:
            self.bg = INK
            self.title = PAPER
            self.mid = GREY_LIGHT    # 次级文字 / 主刻度
            self.faint = GREY_DARK   # 主发丝线
            self.detail = GREY_MID   # 连线、细刻度
            self.mark = GREY_LIGHT   # 图形主体轮廓（深色底上要够亮才看得见）
            self.soft = GREY_DARK    # 图形填充
        else:
            self.bg = PAPER
            self.title = INK
            self.mid = GREY_MID
            self.faint = RULE
            self.detail = GREY_LIGHT
            self.mark = GREY_LIGHT
            self.soft = RULE


LIGHT = Theme(False)
DARK = Theme(True)

# ---------------------------------------------------------------------------
# 字体
# ---------------------------------------------------------------------------
FONT_DIR = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")

CJK_BOLD_CANDIDATES = [
    "msyhbd.ttc", "simhei.ttf", "Dengb.ttf",
    "Noto Sans SC Bold (TrueType).otf", "NotoSansSC-VF.ttf", "msyh.ttc",
]
CJK_REG_CANDIDATES = [
    "msyh.ttc", "simhei.ttf", "Deng.ttf",
    "Noto Sans SC (TrueType).otf", "NotoSansSC-VF.ttf", "simsun.ttc",
]
MONO_CANDIDATES = ["consolab.ttf", "consola.ttf", "courbd.ttf", "arialbd.ttf", "arial.ttf"]

NOTDEF_CHAR = "\U000F0000"  # 私有区，任何字体都不会有这个字形 -> .notdef 参考位图
_FONT_CACHE: dict = {}


def _candidate_paths(names):
    for n in names:
        yield n if os.path.isabs(n) else os.path.join(FONT_DIR, n)


def _glyph_signature(font, ch):
    """渲染单字，返回 (位图字节, ink bbox)。"""
    pad = 6
    box = int(getattr(font, "size", 40) * 1.6) + pad * 2
    img = Image.new("L", (box, box), 0)
    ImageDraw.Draw(img).text((pad, pad), ch, font=font, fill=255)
    return img.tobytes(), img.getbbox()


def glyphs_ok(font, chars):
    """tofu 检测：字形位图与 .notdef 位图完全相同 => 缺字。"""
    ref, ref_box = _glyph_signature(font, NOTDEF_CHAR)
    seen = {}
    for ch in chars:
        if ch.isspace():
            continue
        sig, box = _glyph_signature(font, ch)
        if box is None:
            return False, "字形为空 %r" % ch
        if sig == ref and box == ref_box:
            return False, "缺字(tofu) %r" % ch
        if sig in seen:
            return False, "字形重复 %r/%r" % (seen[sig], ch)
        seen[sig] = ch
    return True, "ok"


def pick_font(candidates, size, probe_chars, label):
    """逐个候选字体做缺字检测，返回第一个可用的 (path, font)。"""
    errors = []
    for path in _candidate_paths(candidates):
        if not os.path.isfile(path):
            errors.append("%s: 文件不存在" % path)
            continue
        try:
            font = ImageFont.truetype(path, size)
        except Exception as exc:  # noqa: BLE001
            errors.append("%s: %s" % (path, exc))
            continue
        ok, why = glyphs_ok(font, probe_chars)
        if ok:
            return path, font
        errors.append("%s: %s" % (path, why))
    raise SystemExit("找不到可用的 %s 字体:\n  %s" % (label, "\n  ".join(errors)))


def font_at(path, size):
    key = (path, size)
    f = _FONT_CACHE.get(key)
    if f is None:
        f = ImageFont.truetype(path, size)
        _FONT_CACHE[key] = f
    return f


# ---------------------------------------------------------------------------
# 文本测量 / 自适应
# ---------------------------------------------------------------------------
def ink_box(font, text):
    return font.getbbox(text)  # 相对 anchor="la" 原点的 ink 包围盒


def tokens(line):
    """折行单元：CJK/标点逐字成组，拉丁单词整体保留，词间空格跟随后一个词。"""
    out = []
    for wi, word in enumerate(line.split(" ")):
        if not word:
            continue
        parts, buf = [], ""
        for ch in word:
            if ch.isascii() and (ch.isalnum() or ch in "._-+/#@"):
                buf += ch
            else:
                if buf:
                    parts.append(buf)
                    buf = ""
                parts.append(ch)
        if buf:
            parts.append(buf)
        if wi and parts:
            parts[0] = " " + parts[0]  # 还原被 split 掉的空格
        out.extend(parts)
    return out


def wrap_line(line, font, max_w):
    """按单元贪心折行；不会把拉丁单词从中间劈开。"""
    if font.getlength(line) <= max_w:
        return [line]
    out, cur = [], ""
    for tk in tokens(line):
        cand = cur + tk
        if cur and font.getlength(cand) > max_w:
            out.append(cur.strip())
            cur = tk.lstrip()
            while font.getlength(cur) > max_w and len(cur) > 1:  # 单词本身超宽才硬拆
                k = len(cur)
                while k > 1 and font.getlength(cur[:k]) > max_w:
                    k -= 1
                out.append(cur[:k])
                cur = cur[k:]
        else:
            cur = cand
    if cur.strip():
        out.append(cur.strip())
    return out


def _measure(lines, font):
    boxes = [ink_box(font, ln) for ln in lines]
    line_h = int(round(font.size * 1.30))
    ink_h = (len(lines) - 1) * line_h + (boxes[-1][3] - boxes[0][1])
    widest = max(font.getlength(ln) for ln in lines)
    return boxes, line_h, ink_h, widest


def fit_title(authored, font_path, max_w, band_h, max_lines=2):
    """由大到小试字号：优先保持作者断行，其次才允许自动折行。"""
    fallback = None
    for allow_wrap in (False, True):
        size = TITLE_MAX
        while size >= TITLE_MIN:
            font = font_at(font_path, size)
            lines = []
            for ln in authored:
                lines.extend(wrap_line(ln, font, max_w))
            boxes, line_h, ink_h, widest = _measure(lines, font)
            fits = (len(lines) <= max_lines and ink_h <= band_h
                    and widest <= max_w and len(lines) == len(authored))
            if fits:
                return font, lines, boxes, line_h, ink_h, False
            if allow_wrap and fallback is None and len(lines) <= max_lines \
                    and ink_h <= band_h and widest <= max_w:
                fallback = (font, lines, boxes, line_h, ink_h, True)
            size -= 2
    if fallback:
        return fallback
    raise SystemExit("标题无法排入 %dpx 宽 / %dpx 高：%r" % (max_w, band_h, authored))


# ---------------------------------------------------------------------------
# 图形元件
# ---------------------------------------------------------------------------
def dot_grid(d, x0, y0, cols, rows, step, r, color):
    for c in range(cols):
        for rr in range(rows):
            cx, cy = x0 + c * step, y0 + rr * step
            d.rectangle([cx - r, cy - r, cx + r, cy + r], fill=color)


def cell_x(i):
    return MARGIN + i * (CELL_W + GAP)


def _box(d, x0, y0, x1, y1, t, accent=False, soft=False, width=1):
    col = CINNABAR if accent else t.mark
    d.rectangle([x0, y0, x1, y1], outline=col, width=width, fill=t.soft if soft else None)


# 底部 4 个单元格的图形：同一套骨架，8 种母题，每张封面选一种 -------------

def m_flow(d, t):
    """节点 → 节点：流程 / 管线。"""
    size, cy = 40, BASE_Y - 42
    xs = [cell_x(i) + (CELL_W - size) // 2 for i in range(4)]
    for i in range(3):
        d.line([(xs[i] + size, cy), (xs[i + 1], cy)], fill=t.detail, width=1)
    for i, x in enumerate(xs):
        accent = i == 3
        _box(d, x, cy - size // 2, x + size - 1, cy + size // 2 - 1, t, accent, width=2 if accent else 1)
        if accent:
            d.rectangle([x + 16, cy - 4, x + 23, cy + 3], fill=CINNABAR)
        else:
            d.line([(x + 11, cy), (x + size - 12, cy)], fill=t.detail, width=1)


def m_branch(d, t):
    """主干 + 分支：分支策略 / 版本流。"""
    y = BASE_Y - 34
    x0, x3 = cell_x(0) + 4, cell_x(3) + CELL_W - 4
    d.line([(x0, y), (x3, y)], fill=t.detail, width=1)
    b1, b2, yb = cell_x(1) + 30, cell_x(3) + 30, y - 32
    d.line([(b1, y), (b1, yb)], fill=t.detail, width=1)
    d.line([(b1, yb), (b2, yb)], fill=t.detail, width=1)
    d.line([(b2, yb), (b2, y)], fill=t.detail, width=1)
    for i, cx in enumerate([x0, b1, b2, x3]):
        if i == 3:
            d.ellipse([cx - 6, y - 6, cx + 6, y + 6], fill=CINNABAR)
        else:
            d.ellipse([cx - 5, y - 5, cx + 5, y + 5], outline=t.mark, width=1)


def m_bars(d, t):
    """柱状对比：排名 / 性能。"""
    heights = [(30, 46, 62), (40, 58, 34), (52, 36, 66), (26, 48, 58)]
    for i in range(4):
        x = cell_x(i) + 30
        for j, h in enumerate(heights[i]):
            bx = x + j * 28
            top = BASE_Y - 2 - h
            accent = i == 3 and j == 2
            d.rectangle(
                [bx, top, bx + 17, BASE_Y - 2],
                fill=CINNABAR if accent else t.soft,
                outline=CINNABAR if accent else t.mark,
                width=1,
            )


def m_lines(d, t):
    """文档行：正文 / 速查。"""
    for i in range(4):
        x = cell_x(i) + 12
        base = BASE_Y - 58
        d.rectangle([x, base, x + 92, base + 5], fill=t.mid if i != 0 else CINNABAR)
        for k in range(3):
            yy = base + 20 + k * 20
            w = 200 - k * 34 - i * 8
            d.rectangle([x, yy, x + w, yy + 3], fill=t.detail)


def m_grid(d, t):
    """方格阵列：像素 / 面板 / 模式。"""
    step = 22
    for i in range(4):
        x = cell_x(i) + (CELL_W - 3 * step) // 2
        y = BASE_Y - 2 * step - 20
        for r in range(3):
            for c in range(3):
                cx, cy = x + c * step, y + r * step
                if i == 3 and (r, c) == (1, 1):
                    d.rectangle([cx - 7, cy - 7, cx + 7, cy + 7], fill=CINNABAR)
                else:
                    d.rectangle([cx - 6, cy - 6, cx + 6, cy + 6], outline=t.mark, width=1)


def m_stack(d, t):
    """层叠：镜像层 / 量化等级 / 结构化输出。"""
    for i in range(4):
        x = cell_x(i) + 34
        w = CELL_W - 68
        for k in range(3):
            y = BASE_Y - 16 - k * 20
            accent = i == 3 and k == 2
            d.rectangle(
                [x, y, x + w, y + 13],
                outline=CINNABAR if accent else t.mark,
                width=1,
                # 深色底上只画线框，避免实心块比其它母题重
                fill=None if (accent or t.dark) else t.soft,
            )


def m_keys(d, t):
    """按键：快捷键。"""
    pairs = [(72, 56), (60, 72), (84, 48), (66, 66)]
    for i in range(4):
        x = cell_x(i) + 26
        y = BASE_Y - 46
        h = 34
        a, b = pairs[i]
        accent = i == 3
        d.rounded_rectangle([x, y, x + a, y + h], radius=5,
                            outline=CINNABAR if accent else t.mark, width=1, fill=t.soft)
        px = x + a + 12
        d.line([(px - 7, y + h // 2), (px + 7, y + h // 2)], fill=t.detail, width=1)
        d.line([(px, y + h // 2 - 7), (px, y + h // 2 + 7)], fill=t.detail, width=1)
        d.rounded_rectangle([px + 12, y, px + 12 + b, y + h], radius=5,
                            outline=t.mark, width=1, fill=t.soft)


def m_ruler(d, t):
    """刻度尺：命令清单 / 巡检项。"""
    for i in range(4):
        x = cell_x(i) + 14
        for k in range(8):
            major = k % 3 == 0
            h = 26 if major else 13
            d.line([(x + k * 26, BASE_Y - 2), (x + k * 26, BASE_Y - 2 - h)],
                   fill=t.mid if major else t.detail, width=1)
        if i == 3:
            d.line([(x + 7 * 26, BASE_Y - 2), (x + 7 * 26, BASE_Y - 46)], fill=CINNABAR, width=2)


MOTIFS = {
    "flow": m_flow,
    "branch": m_branch,
    "bars": m_bars,
    "lines": m_lines,
    "grid": m_grid,
    "stack": m_stack,
    "keys": m_keys,
    "ruler": m_ruler,
}

# ---------------------------------------------------------------------------
# 22 篇文章：文件名 / 是否深色 / 分类 / 母题 / 中文短标题
#   索引 = 列表顺序（AI 教程 01-10，知识库 11-22），共 22 张。
# ---------------------------------------------------------------------------
COVERS = [
    # --- AI 教程（src/data/aiTutorials.json，category="other" -> 显示为「AI 教程」）
    dict(file="ai-model-guide-2025.jpg", dark=False, cat="AI 教程", motif="bars", title=["AI 大模型", "选型指南"]),
    dict(file="ai-coding-agent.jpg", dark=False, cat="AI 教程", motif="flow", title=["AI 编程", "智能体进阶"]),
    dict(file="advanced-prompt.jpg", dark=False, cat="AI 教程", motif="stack", title=["Prompt 工程", "进阶技巧"]),
    dict(file="local-llm.jpg", dark=False, cat="AI 教程", motif="stack", title=["本地部署", "大模型实战"]),
    dict(file="prompt-engineering.jpg", dark=False, cat="AI 教程", motif="lines", title=["如何写好 Prompt"]),
    dict(file="ai-coding.jpg", dark=False, cat="AI 教程", motif="flow", title=["AI 辅助编程", "实战技巧"]),
    dict(file="ai-image.jpg", dark=False, cat="AI 教程", motif="grid", title=["AI 绘图入门"]),
    dict(file="ai-writing.jpg", dark=False, cat="AI 教程", motif="lines", title=["AI 写作提效", "5 个场景"]),
    dict(file="ai-weekly-report.jpg", dark=False, cat="AI 教程", motif="bars", title=["用 AI 写周报", "与工作总结"]),
    dict(file="ai-code-review.jpg", dark=False, cat="AI 教程", motif="flow", title=["AI 代码审查", "提示词模板"]),
    # --- 知识库（src/data/knowledge.json）
    dict(file="git-workflow.jpg", dark=False, cat="开发笔记", motif="branch", title=["Git 工作流", "与分支策略"]),
    dict(file="docker-practice.jpg", dark=False, cat="软件安装配置", motif="stack", title=["Docker 容器化", "部署实战"]),
    # 深色 1/6：服务器命令行
    dict(file="linux-ops.jpg", dark=True, cat="软件安装配置", motif="ruler", title=["Linux 服务器", "运维与安全"]),
    dict(file="frontend-performance.jpg", dark=False, cat="开发笔记", motif="bars", title=["前端性能优化", "与核心指标"]),
    dict(file="markdown-basic.png", dark=False, cat="Markdown 语法", motif="lines", title=["Markdown", "基础语法速查"]),
    # 深色 2/6：命令清单
    dict(file="git-commands.png", dark=True, cat="开发笔记", motif="ruler", title=["常用 Git", "命令清单"]),
    # 深色 3/6：配置文件与命令行
    dict(file="nginx-deploy.png", dark=True, cat="软件安装配置", motif="flow", title=["Nginx 部署", "静态网站"]),
    # 深色 4/6：编辑器快捷键
    dict(file="vscode-shortcuts.png", dark=True, cat="效率技巧", motif="keys", title=["VS Code", "提效快捷键"]),
    # 深色 5/6：命令速查
    dict(file="docker-basic.png", dark=True, cat="开发笔记", motif="stack", title=["Docker", "常用命令"]),
    # 深色 6/6：终端密钥配置
    dict(file="ssh-github-setup.jpg", dark=True, cat="开发笔记", motif="flow", title=["SSH 密钥登录", "与 GitHub 配置"]),
    dict(file="regex-cheatsheet.jpg", dark=False, cat="效率技巧", motif="grid", title=["常用正则", "表达式速查"]),
    dict(file="devtools-tips.jpg", dark=False, cat="开发笔记", motif="grid", title=["Chrome DevTools", "调试技巧"]),
]

TOTAL = len(COVERS)
OUT_DIR = os.path.join("public", "covers")

# ---------------------------------------------------------------------------
# 单张封面
# ---------------------------------------------------------------------------
def probe_chars():
    chars = []
    for spec in COVERS:
        chars.extend(c for c in spec["cat"] if ord(c) > 0x2000)
        for line in spec["title"]:
            chars.extend(c for c in line if ord(c) > 0x2000)
    return sorted(set(chars))


def render(spec, idx, cjk_bold, cjk_reg, mono):
    t = DARK if spec["dark"] else LIGHT
    img = Image.new("RGB", (W, H), t.bg)
    d = ImageDraw.Draw(img)

    # --- 顶部元信息行 -------------------------------------------------------
    d.rectangle([MARGIN, META_BASE_Y - 13, MARGIN + 9, META_BASE_Y - 4], fill=CINNABAR)
    d.text((MARGIN + 24, META_BASE_Y), spec["cat"], font=font_at(cjk_reg, 25),
           fill=t.mid, anchor="ls")
    d.text((RIGHT, META_BASE_Y - 1), "%02d / %d" % (idx, TOTAL), font=font_at(mono, 23),
           fill=t.mid, anchor="rs")
    d.line([(MARGIN, RULE_Y), (RIGHT, RULE_Y)], fill=t.faint, width=1)
    dot_grid(d, RIGHT - 5 * 18, DOTGRID_Y, 6, 2, 18, 2, t.detail)

    # --- 标题 ---------------------------------------------------------------
    font, lines, boxes, line_h, ink_h, wrapped = fit_title(
        spec["title"], cjk_bold, TITLE_MAX_W, BAND_H)
    top = BAND_TOP + (BAND_H - ink_h) // 2
    y = top - boxes[0][1]
    for ln in lines:
        d.text((MARGIN, y), ln, font=font, fill=t.title, anchor="la")
        y += line_h
    ink_bottom = top + ink_h
    widest = int(max(font.getlength(ln) for ln in lines))
    bar_w = min(widest, 460)
    ry = ink_bottom + 30
    d.rectangle([MARGIN, ry, MARGIN + bar_w, ry + 6], fill=CINNABAR)
    d.line([(MARGIN + bar_w + 26, ry + 3), (RIGHT, ry + 3)], fill=t.faint, width=1)

    # --- 底部图形区 ---------------------------------------------------------
    d.line([(MARGIN, BASE_Y), (RIGHT, BASE_Y)], fill=t.faint, width=1)
    MOTIFS[spec["motif"]](d, t)
    for i in range(4):
        d.text((cell_x(i), NUM_BASE_Y), "%02d" % (i + 1), font=font_at(mono, 20),
               fill=CINNABAR if i == 0 else t.detail, anchor="ls")

    return img, dict(size=font.size, lines=len(lines), widest=widest,
                     wrapped=wrapped, text="/".join(lines))


def save(img, path):
    if path.lower().endswith(".png"):
        img.save(path, format="PNG", optimize=True)
    else:
        img.save(path, format="JPEG", quality=92, subsampling=0,
                 optimize=True, progressive=True)


# ---------------------------------------------------------------------------
# 校验
# ---------------------------------------------------------------------------
def blue_dominant_pixels(path):
    """统计蓝通道显著高于红通道（>30）的像素数：霓虹蓝紫残留检测。"""
    with Image.open(path) as im:
        rgb = im.convert("RGB")
        try:
            import numpy as np

            a = np.asarray(rgb).astype("int16")
            return int((a[:, :, 2] - a[:, :, 0] > 30).sum())
        except ImportError:
            from PIL import ImageChops

            r, _, b = rgb.split()
            diff = ImageChops.subtract(b, r).point(lambda v: 255 if v > 30 else 0)
            return int(diff.histogram()[255])


def verify():
    print("== 校验 public/covers ==")
    ok = True
    total_blue = 0
    sizes = []
    for i, spec in enumerate(COVERS, 1):
        path = os.path.join(OUT_DIR, spec["file"])
        if not os.path.isfile(path):
            print("  [缺] %s" % spec["file"])
            ok = False
            continue
        with Image.open(path) as im:
            dim = im.size
            fmt = im.format
        nbytes = os.path.getsize(path)
        sizes.append(nbytes)
        blue = blue_dominant_pixels(path)
        total_blue += blue
        flag = "OK " if dim == (W, H) and blue == 0 else "!! "
        if dim != (W, H) or blue != 0:
            ok = False
        print("  %s%02d %-26s %sx%s %-4s %6.1f KB  蓝偏像素=%d"
              % (flag, i, spec["file"], dim[0], dim[1], fmt, nbytes / 1024.0, blue))
    print("  文件数=%d/%d  尺寸全部 %dx%d  蓝偏像素合计=%d  体积 %.1f~%.1f KB"
          % (len(sizes), TOTAL, W, H, total_blue,
             min(sizes) / 1024.0 if sizes else 0, max(sizes) / 1024.0 if sizes else 0))
    return ok and len(sizes) == TOTAL and total_blue == 0


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="生成 TaoTools 文章封面（纸 / 墨 / 朱砂）")
    ap.add_argument("--verify", action="store_true", help="只校验已有文件，不重新生成")
    args = ap.parse_args()

    chars = probe_chars()
    if args.verify:
        sys.exit(0 if verify() else 1)

    cjk_bold_path, _ = pick_font(CJK_BOLD_CANDIDATES, 120, chars, "中文标题")
    cjk_reg_path, _ = pick_font(CJK_REG_CANDIDATES, 25, chars, "中文正文")
    mono_path, _ = pick_font(MONO_CANDIDATES, 23, [], "等宽")
    print("字体：标题=%s  正文=%s  等宽=%s" % (cjk_bold_path, cjk_reg_path, mono_path))
    print("中文缺字检测通过（%d 个汉字/标点逐个与 .notdef 位图比对）" % len(chars))

    os.makedirs(OUT_DIR, exist_ok=True)
    dark_n = 0
    for i, spec in enumerate(COVERS, 1):
        img, info = render(spec, i, cjk_bold_path, cjk_reg_path, mono_path)
        save(img, os.path.join(OUT_DIR, spec["file"]))
        dark_n += 1 if spec["dark"] else 0
        print("  [%02d/%d] %-26s %s  字号=%3d 行数=%d 最宽=%4d/%d %s  %s"
              % (i, TOTAL, spec["file"], "墨" if spec["dark"] else "纸", info["size"],
                 info["lines"], info["widest"], TITLE_MAX_W,
                 "自动折行" if info["wrapped"] else "       ", info["text"]))
    print("完成：%d 张（纸 %d / 墨 %d），输出目录 %s"
          % (TOTAL, TOTAL - dark_n, dark_n, os.path.abspath(OUT_DIR)))


if __name__ == "__main__":
    main()
