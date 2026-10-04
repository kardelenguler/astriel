"""Bir kerelik: satır sonlarındaki boşlukları siler. Çalıştırdıktan sonra bu dosyayı sil."""

import re
from pathlib import Path

EXTENSIONS = {".py", ".ts", ".html", ".scss", ".md", ".txt", ".json", ".ini", ".example", ".mako"}
SKIP = {"node_modules", ".venv", "dist", ".angular", ".git", "__pycache__", ".pytest_cache"}
NAMES = {"Dockerfile", ".gitignore", ".dockerignore"}

changed = 0
for path in Path(".").rglob("*"):
    if not path.is_file() or SKIP & set(path.parts):
        continue
    if path.suffix not in EXTENSIONS and path.name not in NAMES:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    cleaned = re.sub(r"[ \t]+(?=\r?\n|\Z)", "", text)
    if cleaned != text:
        path.write_text(cleaned, encoding="utf-8", newline="")
        changed += 1
        print("temizlendi:", path)

print(f"Toplam {changed} dosya temizlendi.")
