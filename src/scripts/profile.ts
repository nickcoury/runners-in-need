// Profile page: tab switching, profile/org form submission,
// account deletion, sign out

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const validProfileTabs = ['profile', 'organization'];

function switchToTab(tab: string) {
  if (!validProfileTabs.includes(tab)) tab = 'profile';
  tabBtns.forEach((b) => {
    b.classList.remove('border-[#2D4A2D]', 'text-[#2D4A2D]');
    b.classList.add('border-transparent', 'text-gray-500');
    b.setAttribute('aria-selected', 'false');
  });
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  activeBtn?.classList.add('border-[#2D4A2D]', 'text-[#2D4A2D]');
  activeBtn?.classList.remove('border-transparent', 'text-gray-500');
  activeBtn?.setAttribute('aria-selected', 'true');
  document.getElementById('tab-profile')?.classList.toggle('hidden', tab !== 'profile');
  document.getElementById('tab-organization')?.classList.toggle('hidden', tab !== 'organization');
}

// Read hash on load
const initialHash = window.location.hash.replace('#', '');
if (initialHash && validProfileTabs.includes(initialHash)) {
  switchToTab(initialHash);
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  switchToTab(hash);
});

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = (btn as HTMLElement).dataset.tab!;
    window.location.hash = tab;
    switchToTab(tab);
  });
});

// Profile name update
const profileForm = document.getElementById('profile-form') as HTMLFormElement;
profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  const saveStatus = document.getElementById('save-status')!;
  const saveError = document.getElementById('save-error')!;

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  saveStatus.classList.add('hidden');
  saveError.classList.add('hidden');

  try {
    const formData = new FormData(profileForm);
    const res = await fetch('/api/user/update', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      saveStatus.classList.remove('hidden');
      // Update the name display on the page
      const nameEl = document.getElementById('profile-name');
      if (nameEl) nameEl.textContent = formData.get('name') as string;
      setTimeout(() => saveStatus.classList.add('hidden'), 3000);
    } else {
      const text = await res.text();
      saveError.textContent = text || 'Failed to save';
      saveError.classList.remove('hidden');
    }
  } catch {
    saveError.textContent = 'Network error';
    saveError.classList.remove('hidden');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
});

// Org update
const orgForm = document.getElementById('org-form') as HTMLFormElement;
orgForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('org-save-btn') as HTMLButtonElement;
  const status = document.getElementById('org-save-status')!;
  const orgError = document.getElementById('org-save-error')!;

  btn.disabled = true;
  btn.textContent = 'Saving...';
  status.classList.add('hidden');
  orgError.classList.add('hidden');

  try {
    const res = await fetch('/api/org/update', {
      method: 'POST',
      body: new FormData(orgForm),
    });

    if (res.ok) {
      status.classList.remove('hidden');
      setTimeout(() => status.classList.add('hidden'), 3000);
    } else {
      const text = await res.text();
      orgError.textContent = text || 'Failed to save';
      orgError.classList.remove('hidden');
    }
  } catch {
    orgError.textContent = 'Network error';
    orgError.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Organization';
  }
});

// Delete account
document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
  if (!confirm('This will permanently delete your account, withdraw your pledges, and remove your data. Continue?')) return;
  try {
    const res = await fetch('/api/user/delete', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/?deleted=1';
    } else {
      alert('Failed to delete account. Please try again.');
    }
  } catch {
    alert('Network error. Please try again.');
  }
});

// Sign out — uses global handler defined in Layout
document.getElementById('sign-out-profile-btn')?.addEventListener('click', () => {
  (window as any).signOut?.();
});
