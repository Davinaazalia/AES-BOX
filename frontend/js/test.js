import { validateSboxDebug } from './api.js';

const btn = document.getElementById('btn-debug');
const out = document.getElementById('debug-result');

btn?.addEventListener('click', async () => {
  btn.disabled = true;
  out.textContent = 'Running...';
  try {
    const data = await validateSboxDebug();
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  } finally {
    btn.disabled = false;
  }
});
