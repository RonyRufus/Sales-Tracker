const voiceBtn = document.getElementById('voiceBtn');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const transcriptText = document.getElementById('transcriptText');
const entryList = document.getElementById('entryList');

const STORAGE_KEY = 'voice-map-entries-v1';
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const map = L.map('map').setView([40.7128, -74.006], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = L.layerGroup().addTo(map);

function setStatus(text) {
  statusText.textContent = text;
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function parseCommand(rawCommand) {
  const cleaned = rawCommand
    .replace(/^[\s-–—]*(location|log location|save location)\s*[:\-–—]?\s*/i, '')
    .trim();

  if (!cleaned) {
    return null;
  }

  const parts = cleaned.split(',').map((part) => part.trim()).filter(Boolean);
  const project = parts[0] || 'Untitled';
  const details = parts.slice(1);

  return {
    project,
    details,
    raw: cleaned
  };
}

function renderEntryList() {
  entryList.innerHTML = '';

  const sorted = [...entries].reverse();
  sorted.forEach((entry) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${entry.project}</strong><br />
      ${entry.details.length ? `${entry.details.join(' • ')}<br />` : ''}
      <small>${entry.lat.toFixed(5)}, ${entry.lng.toFixed(5)}</small>
    `;
    entryList.appendChild(item);
  });
}

function renderMarkers() {
  markers.clearLayers();

  entries.forEach((entry) => {
    const detailsHtml = entry.details.map((d) => `<li>${d}</li>`).join('');
    L.marker([entry.lat, entry.lng])
      .bindPopup(`
        <strong>${entry.project}</strong>
        ${detailsHtml ? `<ul>${detailsHtml}</ul>` : ''}
        <small>${entry.raw}</small>
      `)
      .addTo(markers);
  });
}

function addEntryFromVoice(transcript) {
  transcriptText.textContent = transcript;

  const parsed = parseCommand(transcript);
  if (!parsed) {
    setStatus('Could not parse command. Try again.');
    return;
  }

  const center = map.getCenter();
  const entry = {
    ...parsed,
    lat: center.lat,
    lng: center.lng,
    createdAt: Date.now()
  };

  entries.push(entry);
  saveEntries();
  renderMarkers();
  renderEntryList();
  setStatus(`Saved "${entry.project}" at map center.`);
}

function clearAll() {
  entries = [];
  saveEntries();
  renderMarkers();
  renderEntryList();
  setStatus('All saved locations were cleared.');
}

clearBtn.addEventListener('click', clearAll);
renderMarkers();
renderEntryList();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceBtn.disabled = true;
  setStatus('Speech recognition is not supported in this browser.');
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  let isListening = false;

  function startListening() {
    try {
      recognition.start();
      setStatus('Listening...');
      voiceBtn.textContent = '⏹️ Stop Listening';
      isListening = true;
    } catch {
      setStatus('Mic is busy. Wait and try again.');
    }
  }

  function stopListening() {
    recognition.stop();
    setStatus('Stopping...');
  }

  voiceBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    addEntryFromVoice(transcript);
  });

  recognition.addEventListener('end', () => {
    isListening = false;
    voiceBtn.textContent = '🎙️ Start Voice Input';
    if (statusText.textContent === 'Listening...' || statusText.textContent === 'Stopping...') {
      setStatus('Idle');
    }
  });

  recognition.addEventListener('error', (event) => {
    setStatus(`Voice error: ${event.error}`);
  });
}
