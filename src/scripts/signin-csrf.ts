// Sign-in page: fetch CSRF token, populate hidden inputs, enable submit buttons, init Turnstile

const turnstileWindow = window as Window & {
  turnstile?: TurnstileInstance;
  onTurnstileLoad?: () => void;
};

const signInButtons = () =>
  document.querySelectorAll<HTMLButtonElement>('.signin-submit');
const authEnabled = document.querySelector<HTMLElement>('[data-auth-enabled]')?.dataset.authEnabled !== 'false';

function enableSignInButtons() {
  signInButtons().forEach(btn => {
    btn.disabled = false;
  });
}

if (authEnabled) {
  fetch('/api/auth/csrf')
    .then(r => {
      if (!r.ok) throw new Error('csrf fetch failed');
      return r.json();
    })
    .then(data => {
      document.querySelectorAll<HTMLInputElement>('.signin-form input[name="csrfToken"]')
        .forEach(input => { input.value = data.csrfToken; });
      enableSignInButtons();
    })
    .catch(() => {
      enableSignInButtons();
    });
} else {
  enableSignInButtons();
}

// Turnstile bot prevention on magic link form
const widget = document.getElementById('turnstile-widget');
if (widget) {
  const sitekey = widget.dataset.sitekey;
  if (sitekey) {
    const scriptId = 'cf-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      document.head.appendChild(script);
    }
    const render = () => {
      if (turnstileWindow.turnstile && widget) {
        turnstileWindow.turnstile.render(widget, {
          sitekey,
          callback: (_token: string) => {
            // Token is automatically added to form as cf-turnstile-response hidden input
          },
        });
      }
    };
    turnstileWindow.onTurnstileLoad = render;
    if (turnstileWindow.turnstile) render();
  }
}
