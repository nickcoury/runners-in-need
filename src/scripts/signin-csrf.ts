// Sign-in page: fetch CSRF token, populate hidden inputs, enable submit buttons

fetch('/api/auth/csrf')
  .then(r => r.json())
  .then(data => {
    document.querySelectorAll<HTMLInputElement>('.signin-form input[name="csrfToken"]')
      .forEach(input => { input.value = data.csrfToken; });
    document.querySelectorAll<HTMLButtonElement>('.signin-submit')
      .forEach(btn => { btn.disabled = false; });
  });
