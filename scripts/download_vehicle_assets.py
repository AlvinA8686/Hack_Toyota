import concurrent.futures
import json
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
entries = json.loads((root / 'scripts/vehicle-photo-sources.json').read_text())
destination = root / 'assets/vehicles'
destination.mkdir(exist_ok=True)

def download(entry):
    if (destination / entry['filename']).exists():
        return entry
    request = urllib.request.Request(entry['sourceImage'], headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=20) as response:
        content = response.read()
    if content[:8] != b'\x89PNG\r\n\x1a\n':
        raise RuntimeError(f'{entry["key"]}: expected PNG, got {content[:30]!r}')
    (destination / entry['filename']).write_bytes(content)
    print(entry['key'], len(content), flush=True)
    return entry

success = []
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    tasks = {pool.submit(download, entry): entry['key'] for entry in entries}
    for future in concurrent.futures.as_completed(tasks):
        try:
            success.append(future.result())
        except Exception as error:
            print('ERROR', tasks[future], str(error), flush=True)
(destination / 'sources.json').write_text(json.dumps(sorted(success, key=lambda x: x['key']), indent=2), encoding='utf-8')
print(f'{len(success)} of {len(entries)} assets downloaded')
