#!/usr/bin/env python3
"""ISO 27001 資安島 區網伺服器：提供 test_lan.html、共用模板庫與進度。
用法：  Í [port]
- 沒設 ISO_KEY：所有人都能上傳／修改。
- 有設 ISO_KEY：客戶唯讀（可看、可下載），顧問在頁面按「顧問模式」輸入金鑰後才能上傳與更新進度。
資料存在 ./data/（files/、files.json、progress.json）。"""
import json, os, re, socket, sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, quote

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data"); FILES = os.path.join(DATA, "files")
IDX = os.path.join(DATA, "files.json"); PRG = os.path.join(DATA, "progress.json")
KEY = os.environ.get("ISO_KEY", ""); MAXB = 200 * 1024 * 1024
os.makedirs(FILES, exist_ok=True)

def load(p, d):
    try:
        with open(p, encoding="utf-8") as f: return json.load(f)
    except Exception: return d

def save(p, o):
    t = p + ".tmp"
    with open(t, "w", encoding="utf-8") as f: json.dump(o, f, ensure_ascii=False)
    os.replace(t, p)

clean = lambda s: re.sub(r"[^a-z0-9]", "", (s or "").lower())[:24]

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def send_json(self, o, code=200):
        b = json.dumps(o, ensure_ascii=False).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store"); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def authed(self):
        if not KEY or self.headers.get("X-Key") == KEY: return True
        self.send_json({"error": "forbidden"}, 403); return False
    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(n) if 0 <= n <= MAXB else None
    def do_GET(self):
        u = urlparse(self.path); p = u.path
        if p == "/api/info": return self.send_json({"auth": bool(KEY)})
        if p == "/api/files": return self.send_json(load(IDX, []))
        if p == "/api/progress": return self.send_json(load(PRG, {}))
        if p.startswith("/files/"):
            fid = clean(p[7:]); m = next((f for f in load(IDX, []) if f["id"] == fid), None); fp = os.path.join(FILES, fid)
            if not m or not os.path.isfile(fp): return self.send_error(404)
            self.send_response(200); self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Disposition", "attachment; filename*=UTF-8''" + quote(m["name"]))
            self.send_header("Content-Length", str(os.path.getsize(fp))); self.end_headers()
            with open(fp, "rb") as f: self.wfile.write(f.read())
            return
        if p.startswith("/data") or p.endswith("server.py"): return self.send_error(404)
        super().do_GET()
    def do_POST(self):
        u = urlparse(self.path); q = parse_qs(u.query); p = u.path
        if not self.authed(): return
        if p == "/api/auth": return self.send_json({"ok": True})
        b = self.body()
        if b is None: return self.send_json({"error": "too large"}, 413)
        if p == "/api/upload":
            fid = clean(q.get("id", [""])[0]) or clean(os.urandom(6).hex())
            name = os.path.basename(q.get("name", ["file"])[0]) or "file"
            ctl = [c for c in q.get("ctl", [""])[0].split(",") if re.fullmatch(r"\d+\.\d+", c)]
            with open(os.path.join(FILES, fid), "wb") as f: f.write(b)
            idx = [f for f in load(IDX, []) if f["id"] != fid]
            idx.append({"id": fid, "name": name, "size": len(b), "ctl": ctl, "ts": int(__import__("time").time() * 1000)})
            save(IDX, idx); return self.send_json({"ok": True, "id": fid})
        if p == "/api/meta":
            j = json.loads(b or b"{}"); idx = load(IDX, [])
            for f in idx:
                if f["id"] == clean(j.get("id")): f["ctl"] = [c for c in j.get("ctl", []) if re.fullmatch(r"\d+\.\d+", str(c))]
            save(IDX, idx); return self.send_json({"ok": True})
        if p == "/api/progress":
            save(PRG, json.loads(b or b"{}")); return self.send_json({"ok": True})
        self.send_error(404)
    def do_DELETE(self):
        u = urlparse(self.path)
        if u.path != "/api/files" or not self.authed(): return
        fid = clean(parse_qs(u.query).get("id", [""])[0])
        save(IDX, [f for f in load(IDX, []) if f["id"] != fid])
        try: os.remove(os.path.join(FILES, fid))
        except OSError: pass
        self.send_json({"ok": True})

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    try: ip = socket.gethostbyname(socket.gethostname())
    except Exception: ip = "127.0.0.1"
    print(f"開啟： http://{ip}:{port}/test_lan.html   （顧問金鑰：{'已啟用' if KEY else '未設定，所有人皆可編輯'}）")
    ThreadingHTTPServer(("0.0.0.0", port), H).serve_forever()