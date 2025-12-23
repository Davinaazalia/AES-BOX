import { generateSbox } from './api.js';

const btn = document.getElementById('btn-generate');
const result = document.getElementById('result');

btn?.addEventListener('click', async () => {
  btn.disabled = true;
  result.textContent = 'Generating...';
  try {
    const data = await generateSbox();
    result.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    result.textContent = 'Error: ' + e.message;
  } finally {
    btn.disabled = false;
  }
});
