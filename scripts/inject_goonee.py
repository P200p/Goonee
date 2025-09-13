"""Inject goonee collapsible nav into HTML files that don't already include it.

Usage: run from repo root:
    python scripts/inject_goonee.py

This script:
- Finds all .html files under the repo
- Skips files that already have 'data-goonee-toggle' or link to goonee-collapsible-nav.css
- Inserts <link> and <script> into <head>
- Inserts the menu markup after <body> open tag
- Uses unique numeric suffix per-file for ids to avoid collisions
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_HREF = 'assets/goonee-collapsible-nav.css'
JS_HREF = 'assets/goonee-collapsible-nav.js'

MENU_TEMPLATE = '''<!-- Goonee collapsible nav injected (auto) -->
<div class="goonee-cnav-root">
  <button class="goonee-cnav-toggle goonee-cnav-left" aria-label="Open navigation" data-goonee-toggle data-goonee-target="{panel_id}" data-goonee-overlay="{overlay_id}" aria-expanded="false">☰</button>
  <div id="{overlay_id}" class="goonee-cnav-overlay" tabindex="-1"></div>
  <nav id="{panel_id}" class="goonee-cnav-panel" aria-hidden="true">
    <div class="goonee-cnav-header">
      <div class="goonee-cnav-title">เมนู</div>
      <button class="goonee-cnav-close" aria-label="Close">✕</button>
    </div>
    <ul class="goonee-cnav-list">
      <li><a href="/">หน้าแรก</a></li>
      <li><a href="/guide.html">เกี่ยวกับ</a></li>
      <li class="goonee-cnav-item">
        <button class="goonee-cnav-subtoggle" data-goonee-subtoggle data-goonee-subtarget="{sublist_id}" aria-controls="{sublist_id}">ตัวอย่างผลงานอื่นๆ <span class="goonee-cnav-caret">›</span></button>
        <ul id="{sublist_id}" class="goonee-cnav-sublist" aria-hidden="true">
          <li><a href="https://sharkkadaw.netlify.app/" target="_blank" rel="noopener">Sharkkadaw</a></li>
          <li><a href="https://goonee.netlify.app/ai/scan" target="_blank" rel="noopener">Goonee Scan</a></li>
        </ul>
      </li>
      <li><a href="/contact.html">ติดต่อ</a></li>
    </ul>
  </nav>
</div>
'''

HEAD_INSERT = f'    <link rel="stylesheet" href="{CSS_HREF}">\n    <script defer src="{JS_HREF}"></script>\n'


def inject_file(path: Path, idx: int):
    text = path.read_text(encoding='utf-8')
    # skip if already injected
    if 'data-goonee-toggle' in text or CSS_HREF in text:
        print(f"Skipping (already has goonee): {path}")
        return False
    # insert into head
    new_text = text
    head_match = re.search(r"<head[^>]*>", new_text, flags=re.IGNORECASE)
    if head_match:
        insert_pos = head_match.end()
        # find the next newline after head tag to insert comfortably
        new_text = new_text[:insert_pos] + '\n' + HEAD_INSERT + new_text[insert_pos:]
    else:
        print(f"No <head> tag found in {path}, skipping")
        return False
    # insert menu after <body>
    body_match = re.search(r"<body[^>]*>", new_text, flags=re.IGNORECASE)
    if body_match:
        panel_id = f'goonee-panel-auto-{idx}'
        overlay_id = f'goonee-overlay-auto-{idx}'
        sublist_id = f'goonee-sublist-auto-{idx}'
        menu = MENU_TEMPLATE.format(panel_id=panel_id, overlay_id=overlay_id, sublist_id=sublist_id)
        bp = body_match.end()
        new_text = new_text[:bp] + '\n' + menu + new_text[bp:]
    else:
        print(f"No <body> tag found in {path}, skipping")
        return False
    path.write_text(new_text, encoding='utf-8')
    print(f"Injected goonee nav into {path}")
    return True


def main():
    html_files = list(ROOT.rglob('*.html'))
    print(f'Found {len(html_files)} html files')
    idx = 1
    modified = 0
    for p in html_files:
        # skip files in assets or node_modules or .git
        if any(part in ('assets','node_modules','.git') for part in p.parts):
            pass
        try:
            if inject_file(p, idx):
                modified += 1
                idx += 1
        except Exception as e:
            print(f'Error processing {p}: {e}')
    print(f'Injection complete, modified {modified} files')


if __name__ == '__main__':
    main()
