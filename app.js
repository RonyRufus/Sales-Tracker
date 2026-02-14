const voiceBtn = document.getElementById('voiceBtn');
const clearBtn = document.getElementById('clearBtn');
const locateBtn = document.getElementById('locateBtn');
const statusText = document.getElementById('statusText');
const transcriptText = document.getElementById('transcriptText');
const entryList = document.getElementById('entryList');

const STORAGE_KEY = 'voice-map-entries-v1';
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentCoords = null;
let hasCenteredOnUser = false;

const map = L.map('map').setView([40.7128, -74.006], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers = L.layerGroup().addTo(map);
let currentLocationMarker = null;
let currentLocationAccuracy = null;

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

function updateCurrentLocationVisual(position) {
  const { latitude, longitude, accuracy } = position.coords;
  currentCoords = { lat: latitude, lng: longitude, accuracy };

  if (currentLocationMarker) {
    currentLocationMarker.setLatLng([latitude, longitude]);
    currentLocationAccuracy.setLatLng([latitude, longitude]);
    currentLocationAccuracy.setRadius(accuracy);
  } else {
    currentLocationMarker = L.circleMarker([latitude, longitude], {
      radius: 8,
      color: '#1d63ff',
      weight: 2,
      fillColor: '#5f97ff',
      fillOpacity: 0.9
    }).addTo(map).bindPopup('Current location');

    currentLocationAccuracy = L.circle([latitude, longitude], {
      radius: accuracy,
      color: '#5f97ff',
      fillColor: '#8fb5ff',
      fillOpacity: 0.2,
      weight: 1
    }).addTo(map);
  }

  if (!hasCenteredOnUser) {
    map.setView([latitude, longitude], 16);
    hasCenteredOnUser = true;
  }
}

function addEntryFromVoice(transcript) {
  transcriptText.textContent = transcript;

  const parsed = parseCommand(transcript);
  if (!parsed) {
    setStatus('Could not capture useful text from that speech segment.');
    return;
  }

  const point = currentCoords || map.getCenter();
  const entry = {
    ...parsed,
    lat: point.lat,
    lng: point.lng,
    createdAt: Date.now()
  };

  entries.push(entry);
  saveEntries();
  renderMarkers();
  renderEntryList();

  if (currentCoords) {
    setStatus(`Saved "${entry.project}" at your current location.`);
  } else {
    setStatus(`Saved "${entry.project}" at map center (location permission not granted).`);
  }
}

function clearAll() {
  entries = [];
  saveEntries();
  renderMarkers();
  renderEntryList();
  setStatus('All saved locations were cleared.');
}

function startLocationTracking() {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported in this browser.');
    locateBtn.disabled = true;
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      updateCurrentLocationVisual(position);
      locateBtn.disabled = false;
    },
    (error) => {
      locateBtn.disabled = true;
      setStatus(`Location unavailable: ${error.message}`);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    }
  );
}

locateBtn.addEventListener('click', () => {
  if (!currentCoords) {
    setStatus('Current location not ready yet.');
    return;
  }
  map.setView([currentCoords.lat, currentCoords.lng], 16);
  setStatus('Map centered on your current location.');
});

clearBtn.addEventListener('click', clearAll);
renderMarkers();
renderEntryList();
startLocationTracking();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceBtn.disabled = true;
  setStatus('Speech recognition is not supported in this browser.');
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  let isMonitoring = false;
  let shouldRestart = false;
  let restartTimer = null;

  function setVoiceButtonText() {
    voiceBtn.textContent = isMonitoring ? '⏹️ Stop Hands-Free' : '🎙️ Enable Hands-Free';
  }

  function scheduleRestart() {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      if (!shouldRestart) {
        return;
      }
      try {
        recognition.start();
        isMonitoring = true;
        setVoiceButtonText();
      } catch {
        shouldRestart = false;
        setStatus('Could not restart hands-free mode. Tap enable again.');
      }
    }, 850);
  }

  function startMonitoring() {
    try {
      shouldRestart = true;
      recognition.start();
      isMonitoring = true;
      setVoiceButtonText();
      setStatus('Hands-free active. Everything you say will be saved as a location note.');
    } catch {
      setStatus('Mic is busy. Wait and try again.');
    }
  }

  function stopMonitoring() {
    shouldRestart = false;
    clearTimeout(restartTimer);
    recognition.stop();
    isMonitoring = false;
    setVoiceButtonText();
    setStatus('Hands-free stopped.');
  }

  voiceBtn.addEventListener('click', () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  });

  recognition.addEventListener('result', (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) {
        addEntryFromVoice(result[0].transcript);
      }
    }
  });

  recognition.addEventListener('end', () => {
    isMonitoring = false;
    setVoiceButtonText();
    if (shouldRestart) {
      scheduleRestart();
    }
  });

  recognition.addEventListener('error', (event) => {
    if (event.error === 'not-allowed') {
      shouldRestart = false;
      isMonitoring = false;
      setVoiceButtonText();
      setStatus('Microphone permission denied. Please allow mic and try again.');
      return;
    }

    if (event.error !== 'no-speech') {
      setStatus(`Voice error: ${event.error}`);
    }
  });

  setVoiceButtonText();
}
