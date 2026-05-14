# MAJA Creations — Desktop Live Uploader

Lightweight Python tool that watches a folder on your laptop and uploads new photos to the wedding's Live Photo Wall in real time.

## Setup

```bash
pip install watchdog requests
```

## Usage

1. In the photographer dashboard, open **Live Wall → Generate token**.
2. Run:

```bash
python maja_uploader.py \
    --url    https://your-backend.com/api/live-gallery/desktop-upload \
    --token  <token-from-dashboard> \
    --folder /Users/you/CameraTether/Riya-Aarav \
    --event  marriage \
    --name   riya-aarav
```

3. Tether your camera (Capture One / Lightroom / Sony Imaging Edge) so it writes JPEGs into that folder. Each new file is auto-uploaded.

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--url`     | yes | Upload endpoint URL |
| `--token`   | yes | Token from dashboard (72-hour validity) |
| `--folder`  | yes | Folder to watch (recursive) |
| `--event`   | no  | Tag photos by event (`haldi` / `mehendi` / `sangeet` / `marriage` / `reception`) |
| `--caption` | no  | Optional caption applied to all uploads |
| `--name`    | no  | Profile name for state files — allows multiple weddings on one laptop |

## Reliability

- Retries failed uploads with exponential back-off
- Saves seen files to `~/.maja_uploader/` so restarts skip duplicates
- Queues uploads while network is down — retries when back online
- Supports JPG, JPEG, PNG, WEBP, HEIC
