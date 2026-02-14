# Sales-Tracker

A lightweight voice-first map logger for travel notes.

## What it does

- Uses your current GPS location (like Google Maps "my location").
- Supports a hands-free wake-word flow for travel use.
- Saves spoken context (for example: `Location — hotel project, X architect, 12345 number`) directly to that location.
- Persists entries in browser local storage.

## Voice flow (hands-free)

1. Tap **Enable Hands-Free** once.
2. Say **"Hey Tracker"** (or "OK Tracker").
3. Say your command:
   - `Location — hotel project, X architect, 12345 number`

You can also say it in one line:
- `Hey Tracker, Location — hotel project, X architect, 12345 number`

## Run locally

Because this app uses browser speech + location APIs, serve it over HTTP:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open:

- On the **same machine**: `http://127.0.0.1:4173`
- From **another device on your network**: `http://<your-computer-ip>:4173`

Allow both microphone and location permissions when prompted.
