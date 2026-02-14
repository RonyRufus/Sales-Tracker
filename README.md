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
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open:

- On the **same machine**: `http://127.0.0.1:4173`
- From **another device on your network**: `http://<your-computer-ip>:4173`

## If you see "127.0.0.1 refused to connect"

- Make sure the server command above is still running in a terminal.
- `127.0.0.1` always means "this same machine" (not a remote server/container).
- If you're connecting from another device, use your host machine IP instead of `127.0.0.1`.
