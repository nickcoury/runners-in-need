// Header navigation: mobile menu toggle, user menu dropdown,
// session detection, sign out handler, admin link visibility

const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
btn?.addEventListener('click', () => {
  const open = menu?.classList.toggle('hidden') === false;
  btn.setAttribute('aria-expanded', String(open));
});

// Close mobile menu when a link is clicked
menu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.add('hidden');
    btn?.setAttribute('aria-expanded', 'false');
  });
});

// Close mobile menu on Escape
menu?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu.classList.add('hidden');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.focus();
  }
});

// Check for session cookie and fetch user info
const hasSession = document.cookie.includes('authjs.session-token') || document.cookie.includes('__Secure-authjs.session-token');
if (hasSession) {
  fetch('/api/auth/session')
    .then(r => r.json())
    .then(session => {
      if (!session?.user) return;
      const user = session.user;
      const name = user.name || 'User';
      const email = user.email || '';
      const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

      // Hide sign-in links
      document.getElementById('auth-link')?.classList.add('hidden');
      document.getElementById('auth-link-mobile')?.classList.add('hidden');

      // Desktop user menu
      const userMenu = document.getElementById('user-menu');
      if (userMenu) {
        userMenu.classList.remove('hidden');
        userMenu.classList.add('flex');
      }
      const nameEl = document.getElementById('user-name-display');
      if (nameEl) nameEl.textContent = name;
      const initialsEl = document.getElementById('user-initials');
      if (initialsEl) {
        if (user.image) {
          const img = document.createElement('img');
          img.src = user.image;
          img.alt = name;
          img.className = 'w-full h-full object-cover';
          img.referrerPolicy = 'no-referrer';
          initialsEl.parentElement?.replaceChildren(img);
        } else {
          initialsEl.textContent = initials;
        }
      }
      const dropdownName = document.getElementById('dropdown-name');
      if (dropdownName) dropdownName.textContent = name;
      const dropdownEmail = document.getElementById('dropdown-email');
      if (dropdownEmail) dropdownEmail.textContent = email;

      // Admin links (show only for admin role)
      if (user.role === 'admin') {
        const adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.classList.remove('hidden'), adminLink.classList.add('block');
        const mobileAdminLink = document.getElementById('mobile-admin-link');
        if (mobileAdminLink) mobileAdminLink.classList.remove('hidden'), mobileAdminLink.classList.add('block');
      }

      // Mobile user section
      const mobileSection = document.getElementById('mobile-user-section');
      if (mobileSection) mobileSection.classList.remove('hidden');
      const mobileName = document.getElementById('mobile-user-name');
      if (mobileName) mobileName.textContent = name;
      const mobileInitials = document.getElementById('mobile-user-initials');
      if (mobileInitials) {
        if (user.image) {
          const img = document.createElement('img');
          img.src = user.image;
          img.alt = name;
          img.className = 'w-full h-full object-cover';
          img.referrerPolicy = 'no-referrer';
          mobileInitials.parentElement?.replaceChildren(img);
        } else {
          mobileInitials.textContent = initials;
        }
      }
    })
    .catch(() => { /* session fetch failed, keep showing Sign In */ });
}

// Desktop dropdown toggle
const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');

function closeDropdown() {
  userDropdown?.classList.add('hidden');
  userMenuBtn?.setAttribute('aria-expanded', 'false');
}
function toggleDropdown() {
  const isHidden = userDropdown?.classList.toggle('hidden');
  userMenuBtn?.setAttribute('aria-expanded', String(!isHidden));
}

userMenuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown();
  // Focus first menu item when opening
  if (userDropdown && !userDropdown.classList.contains('hidden')) {
    const firstItem = userDropdown.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();
  }
});
document.addEventListener('click', closeDropdown);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !userDropdown?.classList.contains('hidden')) {
    closeDropdown();
    userMenuBtn?.focus();
  }
});

// Arrow key navigation and focus trap within dropdown
userDropdown?.addEventListener('keydown', (e) => {
  const items = Array.from(userDropdown.querySelectorAll<HTMLElement>('[role="menuitem"]:not(.hidden)'));
  const idx = items.indexOf(document.activeElement as HTMLElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    items[(idx + 1) % items.length]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    items[(idx - 1 + items.length) % items.length]?.focus();
  } else if (e.key === 'Tab') {
    // Trap focus within dropdown
    closeDropdown();
    userMenuBtn?.focus();
  }
});

// Sign out handler (POST with CSRF) — global so other pages can reuse it
(window as any).signOut = async function signOut() {
  try {
    const csrfRes = await fetch('/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();
    const form = new FormData();
    form.set('csrfToken', csrfToken);
    await fetch('/api/auth/signout', { method: 'POST', body: form });
    window.location.href = '/';
  } catch {
    window.location.href = '/api/auth/signout';
  }
};
document.getElementById('sign-out-btn')?.addEventListener('click', (window as any).signOut);
document.getElementById('mobile-sign-out-btn')?.addEventListener('click', (window as any).signOut);

// Back-to-top button: show on scroll, smooth scroll to top
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.remove('hidden');
      backToTop.classList.add('flex');
    } else {
      backToTop.classList.add('hidden');
      backToTop.classList.remove('flex');
    }
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
