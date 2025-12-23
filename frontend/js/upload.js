import { uploadSbox } from './api.js';

const form = document.getElementById('upload-form');
const analysis = document.getElementById('analysis');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  analysis.innerHTML = 'Uploading...';
  try {
    const html = await uploadSbox(fd);
    analysis.innerHTML = html;
  } catch (err) {
    analysis.textContent = 'Error: ' + err.message;
  }
});
