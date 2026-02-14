# Sales-Tracker

A lightweight voice-first map logger for travel notes.

## What it does

- Uses your current GPS location (like Google Maps "my location").
- Supports true hands-free capture for travel use.
- Saves spoken context (for example: `hotel project, X architect, 12345 number`) directly to that location.
- Persists entries in browser local storage.

## Voice flow (hands-free)

1. Tap **Enable Hands-Free** once.
2. Talk naturally at each stop (no trigger phrase required).
3. Each finalized speech segment is saved as a location note.

## Why you hear beeps

Some browsers/phones play a system tone whenever speech recognition starts listening again. This tone is browser/OS-controlled and cannot be fully disabled from JavaScript. The app now adds a short restart delay to reduce frequent beeping.

## Run locally

Because this app uses browser speech + location APIs, serve it over HTTP:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open:

- On the **same machine**: `http://127.0.0.1:4173`
- From **another device on your network**: `http://<your-computer-ip>:4173`

Allow both microphone and location permissions when prompted.
