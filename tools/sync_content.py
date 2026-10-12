"""Regenerate the browser data file after editing assets/content.json."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'assets' / 'content.json').read_text(encoding='utf-8'))
(root / 'assets' / 'content.js').write_text(
    'window.CV_CONTENT = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n',
    encoding='utf-8',
)
print('Updated assets/content.js')
