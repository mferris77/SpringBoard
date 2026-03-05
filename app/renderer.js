async function checkHealth() {
  try {
    const res = await fetch('http://127.0.0.1:5000/health');
    const json = await res.json();
    document.getElementById('health').textContent = json.status || 'unknown';
  } catch (err) {
    document.getElementById('health').textContent = 'unreachable';
  }
}

setInterval(checkHealth, 2000);
checkHealth();
