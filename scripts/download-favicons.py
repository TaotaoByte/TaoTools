import json
import os
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAVICONS_DIR = ROOT / 'public' / 'favicons'
FAVICONS_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/',
}


def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
        return resp.url, data


def extract_icon_url(html, base_url):
    match = re.search(r'<link[^>]+rel=["\']?(?:shortcut\s+)?icon["\']?[^>]*>', html, re.IGNORECASE)
    if not match:
        return None
    href_match = re.search(r'href=["\']([^"\']+)["\']', match.group(0), re.IGNORECASE)
    if not href_match:
        return None
    return urllib.parse.urljoin(base_url, href_match.group(1))


def download_favicon(item):
    item_id = item['id']
    url = item.get('url', '')
    try:
        parsed = urllib.parse.urlparse(url)
        origin = f'{parsed.scheme}://{parsed.netloc}'
    except Exception:
        print(f'⏭️ 跳过 {item_id}: URL 无效')
        return

    dest = FAVICONS_DIR / f'{item_id}.ico'
    if dest.exists() and dest.stat().st_size > 0:
        print(f'✅ {item_id}: 已存在')
        return

    candidates = [
        f'{origin}/favicon.ico',
        f'{origin}/favicon.png',
        f'{origin}/apple-touch-icon.png',
        f'{origin}/images/favicon.ico',
        f'{origin}/front-static/favicon.ico',
    ]

    for candidate in candidates:
        try:
            _, data = fetch(candidate)
            if len(data) < 50:
                print(f'⏭️ {item_id}: {candidate} 内容太小 ({len(data)} bytes)')
                continue
            dest.write_bytes(data)
            print(f'✅ {item_id}: 已下载 {candidate} ({len(data)} bytes)')
            return
        except Exception as e:
            print(f'⏭️ {item_id}: {candidate} 失败 ({e})')

    # Try parsing HTML for icon link
    try:
        final_url, html_bytes = fetch(url)
        html = html_bytes.decode('utf-8', errors='ignore')
        icon_url = extract_icon_url(html, final_url)
        if icon_url:
            _, data = fetch(icon_url)
            if len(data) >= 50:
                dest.write_bytes(data)
                print(f'✅ {item_id}: 已解析下载 {icon_url} ({len(data)} bytes)')
                return
    except Exception as e:
        print(f'⏭️ {item_id}: 解析 HTML 失败 ({e})')

    print(f'❌ {item_id}: 未找到 favicon')


def main():
    data_dir = ROOT / 'src' / 'data'

    tools = json.loads((data_dir / 'tools.json').read_text(encoding='utf-8'))
    resources = json.loads((data_dir / 'resources.json').read_text(encoding='utf-8'))
    software = json.loads((data_dir / 'software.json').read_text(encoding='utf-8'))

    items = [
        *filter(lambda i: i.get('type') == 'external', tools['items']),
        *resources['items'],
        *software['items'],
    ]

    for item in items:
        download_favicon(item)

    print('\n全部完成')


if __name__ == '__main__':
    main()
