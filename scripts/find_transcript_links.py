import json
import re

found = set()
with open(r'C:\Users\10\.gemini\antigravity-ide\brain\ccee5865-ff7e-4ef3-a3fa-a721efde7fd4\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        matches = re.findall(r'https?://[^\s"\'\\]+', line)
        for m in matches:
            if 'drive.google.com' in m or 'alborada' in m.lower() or 'domus' in m.lower():
                found.add(m)

for url in sorted(found):
    print(url)
