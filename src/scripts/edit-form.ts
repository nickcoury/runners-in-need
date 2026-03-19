// Need edit form: disable submit button and show saving state

const editForm = document.querySelector('form[action^="/api/needs/"]') as HTMLFormElement;
editForm?.addEventListener('submit', () => {
  const btn = document.getElementById('edit-submit-btn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Saving...';
});
