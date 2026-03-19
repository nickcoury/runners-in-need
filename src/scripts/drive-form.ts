// Drive form: disable submit button and show submitting state

const driveForm = document.querySelector('form[action="/api/drives"]') as HTMLFormElement;
driveForm?.addEventListener('submit', () => {
  const btn = document.getElementById('drive-submit-btn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Submitting...';
});
