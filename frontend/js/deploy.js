const buttons = document.querySelectorAll('.btn-download');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    window.location.href = `/download-example/${id}`;
  });
});
