#!/usr/bin/env python3
"""掃描 Files/ 資料夾，依「文件代號」自動對應到島上的條文，寫出 files.json。
用法（在 test_lan.html / index.html 所在的資料夾執行）：  python3 build_files_json.py
- 條文編號：附錄 A 控制措施用「5.1」「8.13」；ISMS 本文條款用「C」開頭，如「C6.1.2」。
- 代號對不到的檔案，若舊的 files.json 有手動設定的 ctl 就保留，否則視為通用模板。
- 之後新增文件：放進 Files/ 再重新執行一次，然後 git add / commit / push。"""
import hashlib, json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(ROOT, "Files")
OUT = os.path.join(ROOT, "files.json")
A = lambda p, a, b: ["%s.%d" % (p, i) for i in range(a, b + 1)]

# 代號 -> 條文。依據 ISO 27001:2022 Checklist（強制文件 + 建議文件）。
MAP = {
    # 強制文件（本文條款）
    "G1": ["C4.3", "C4.1", "C4.2"], "G3": ["C5.1"], "G8": ["C5.3", "5.2"], "G2": ["C6.2"],
    "RT1": ["C6.1.2", "C6.1"], "RT2": ["C6.1.2", "C6.1.3", "C8.2"], "RT3": ["C6.1.3", "C8.3"], "SA1": ["C6.1.3d"],
    "R4": ["C7.2"], "R3": ["6.3", "C7.2", "C7.3"], "C1": ["C7.3", "C7.4"], "M7": ["C7.5"],
    "G10": ["C9.1"], "G7": ["C9.2", "5.35"], "IA2": ["C9.2", "5.35"], "ISG2": ["C9.3"], "M8": ["C10.2", "C10.1"],
    # 建議文件（附錄 A）
    "P1": ["C5.2", "5.1", "8.24"], "P2": ["5.10"], "P3": ["5.15"], "P6": ["5.33", "8.13"], "P8": ["5.17"],
    "P9": ["8.8"], "P11": ["5.19", "5.20", "5.21", "5.22"], "P12": ["5.9"], "P13": ["5.23"],
    "R1": ["5.9"], "R5": ["5.22"], "R7": ["5.19", "5.23"], "IR3": ["5.24", "5.25", "5.26", "5.27"],
    "G11": ["5.31"], "G12": ["5.29", "5.30"], "G13": ["5.6"], "M2": ["8.25"],
}
# 檔名沒有代號時，用關鍵字（全小寫比對）
KEYWORDS = [
    ("nonconformity log", ["C10.2"]), ("backup", ["8.13"]), ("encryption", ["8.24"]),
    ("physical locations", A("7", 1, 14)), ("incident response", ["5.24", "5.25", "5.26", "5.27"]),
]

def code(name):
    m = re.match(r"\s*([A-Za-z]+)\s*(\d+)", name)
    return (m.group(1) + m.group(2)).upper() if m else ""

def guess(name, rel):
    c = code(name)
    if c in MAP: return MAP[c]
    low = (name + " " + rel).lower()
    for k, v in KEYWORDS:
        if k in low: return v
    return None

old = {}
try:
    for f in json.load(open(OUT, encoding="utf-8")): old[f.get("path") or f["name"]] = f
except Exception:
    pass

out = []
for base, _, names in os.walk(DIR):
    for n in sorted(names):
        if n.startswith((".", "~$")): continue
        full = os.path.join(base, n)
        rel = os.path.relpath(full, DIR).replace(os.sep, "/")
        ctl = guess(n, rel)
        if ctl is None:
            ctl = (old.get(rel) or old.get(n) or {}).get("ctl", [])
            print("未對應（保留既有或設為通用）：", rel)
        out.append({"id": "f_" + hashlib.md5(rel.encode("utf-8")).hexdigest()[:8], "name": n, "path": rel,
                    "size": os.path.getsize(full), "ctl": ctl, "ts": int(os.path.getmtime(full) * 1000)})
out.sort(key=lambda f: f["path"].lower())
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("已寫入 files.json：%d 份文件" % len(out))