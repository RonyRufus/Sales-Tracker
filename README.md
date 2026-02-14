# Sales-Tracker

A lightweight voice-first map logger for travel notes.

## What it does

- Lets you pan/zoom to an exact point on a map.
- Uses one-shot voice commands (no chatbot flow).
- Saves spoken context (for example: `Location — hotel project, X architect, 12345 number`) directly to that map point.
- Persists entries in browser local storage.

## Run locally

Because this app uses browser speech APIs, serve it over HTTP:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
