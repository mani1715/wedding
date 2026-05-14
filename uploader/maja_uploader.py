#!/usr/bin/env python3
"""
MAJA Creations — Desktop Live Uploader
========================================
Watches a local folder for new image files and uploads them to the
MAJA Live Photo Wall API in real time.

Setup:
  1. pip install watchdog requests
  2. Get your upload token from the photographer dashboard:
       /admin/profile/<weddingId>/live-gallery
  3. Run:
       python maja_uploader.py \
           --url    https://api.maja-creations.com/api/live-gallery/desktop-upload \
           --token  <YOUR_TOKEN> \
           --folder /Users/you/CameraTether/Wedding-123

Features:
  - Watches a folder recursively
  - Compresses & uploads new JPG/PNG files
  - Retry queue for failed uploads (saved to ~/.maja_uploader/)
  - Skips duplicates (tracked in seen-file index)
  - Optional caption template per file
"""
import argparse
import json
import os
import sys
import time
import threading
from pathlib import Path

try:
    import requests
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError:
    print("Missing deps. Run:  pip install watchdog requests")
    sys.exit(1)


SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
STATE_DIR = Path.home() / ".maja_uploader"
STATE_DIR.mkdir(parents=True, exist_ok=True)


class UploadQueue:
    def __init__(self, name):
        self.path = STATE_DIR / f"{name}_queue.json"
        self.seen_path = STATE_DIR / f"{name}_seen.json"
        self.queue = self._load(self.path, [])
        self.seen = set(self._load(self.seen_path, []))
        self.lock = threading.Lock()

    def _load(self, p, default):
        try:
            return json.loads(p.read_text())
        except Exception:
            return default

    def _save(self):
        try:
            self.path.write_text(json.dumps(self.queue))
            self.seen_path.write_text(json.dumps(list(self.seen)))
        except Exception:
            pass

    def enqueue(self, file_path):
        with self.lock:
            if file_path in self.seen:
                return False
            if file_path not in self.queue:
                self.queue.append(file_path)
                self._save()
            return True

    def mark_done(self, file_path):
        with self.lock:
            if file_path in self.queue:
                self.queue.remove(file_path)
            self.seen.add(file_path)
            self._save()

    def pop_next(self):
        with self.lock:
            return self.queue[0] if self.queue else None


def upload_one(url, token, file_path, caption=None, event_type=None, retries=3):
    """Upload a single file. Returns True on success."""
    if not Path(file_path).exists():
        return True
    for attempt in range(retries):
        try:
            with open(file_path, "rb") as f:
                files = {"file": (os.path.basename(file_path), f, "image/jpeg")}
                data = {}
                if caption:
                    data["caption"] = caption
                if event_type:
                    data["event_type"] = event_type
                headers = {"X-Uploader-Token": token}
                resp = requests.post(url, headers=headers, files=files, data=data, timeout=60)
                if resp.status_code == 200:
                    j = resp.json()
                    print(f"  Uploaded {os.path.basename(file_path)} -> {j.get('id','?')}")
                    return True
                print(f"  Upload failed ({resp.status_code}): {resp.text[:120]}")
                if resp.status_code == 401:
                    print("  Token invalid or expired. Stopping.")
                    sys.exit(1)
        except Exception as e:
            print(f"  Attempt {attempt+1} error: {e}")
        time.sleep(2 ** attempt)
    return False


class Handler(FileSystemEventHandler):
    def __init__(self, queue):
        self.queue = queue

    def _maybe_enqueue(self, path):
        p = Path(path)
        if p.is_dir():
            return
        if p.suffix.lower() not in SUPPORTED_EXTS:
            return
        time.sleep(0.5)
        if self.queue.enqueue(str(p.resolve())):
            print(f"Queued: {p.name}")

    def on_created(self, event): self._maybe_enqueue(event.src_path)
    def on_moved(self, event): self._maybe_enqueue(event.dest_path)


def scan_existing(folder, queue):
    for root, _, files in os.walk(folder):
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() in SUPPORTED_EXTS:
                queue.enqueue(str(p.resolve()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url",    required=True, help="https://api.host/api/live-gallery/desktop-upload")
    ap.add_argument("--token",  required=True, help="Uploader token from dashboard")
    ap.add_argument("--folder", required=True, help="Folder to watch")
    ap.add_argument("--event",  default=None, help="event_type tag (haldi/mehendi/sangeet/marriage)")
    ap.add_argument("--caption", default=None, help="optional caption for every photo")
    ap.add_argument("--name",   default="default", help="Profile name for state files (allows multiple weddings)")
    args = ap.parse_args()

    folder = Path(args.folder).expanduser().resolve()
    if not folder.is_dir():
        print(f"Folder does not exist: {folder}")
        sys.exit(1)

    queue = UploadQueue(args.name)
    print(f"Watching: {folder}")
    print(f"Upload URL: {args.url}")
    print(f"Token: {args.token[:8]}...")
    if args.event:
        print(f"Event tag: {args.event}")

    scan_existing(folder, queue)

    observer = Observer()
    observer.schedule(Handler(queue), str(folder), recursive=True)
    observer.start()

    try:
        while True:
            f = queue.pop_next()
            if f:
                if upload_one(args.url, args.token, f, args.caption, args.event):
                    queue.mark_done(f)
                else:
                    print(f"  Will retry: {f}")
                    time.sleep(5)
            else:
                time.sleep(2)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
