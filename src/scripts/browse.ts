// Clean up query params (error/deleted banners) from URL
if (window.location.search) {
  const params = new URLSearchParams(window.location.search);
  if (params.has('error') || params.has('deleted')) {
    history.replaceState(null, '', window.location.pathname);
  }
}

// Banner dismiss (close button + auto-dismiss after 5s)
document.querySelectorAll<HTMLElement>('.banner-alert').forEach((banner) => {
  const close = banner.querySelector('.banner-close');
  const dismiss = () => banner.remove();
  close?.addEventListener('click', dismiss);
  setTimeout(dismiss, 5000);
});

// Mobile bottom nav toggle
const tabListings = document.getElementById('tab-listings');
const tabMap = document.getElementById('tab-map');
const listingsView = document.getElementById('listings-view');
const mapView = document.getElementById('map-view');

function showListings() {
  listingsView?.classList.remove('hidden');
  mapView?.classList.add('hidden');
  mapView?.classList.remove('block');
  tabListings?.classList.replace('text-gray-400', 'text-[#2D4A2D]');
  tabListings?.classList.replace('border-transparent', 'border-[#2D4A2D]');
  tabMap?.classList.replace('text-[#2D4A2D]', 'text-gray-400');
  tabMap?.classList.replace('border-[#2D4A2D]', 'border-transparent');
}

function showMap() {
  listingsView?.classList.add('hidden');
  mapView?.classList.remove('hidden');
  mapView?.classList.add('block');
  tabMap?.classList.replace('text-gray-400', 'text-[#2D4A2D]');
  tabMap?.classList.replace('border-transparent', 'border-[#2D4A2D]');
  tabListings?.classList.replace('text-[#2D4A2D]', 'text-gray-400');
  tabListings?.classList.replace('border-[#2D4A2D]', 'border-transparent');
}

tabListings?.addEventListener('click', showListings);
tabMap?.addEventListener('click', showMap);

// Desktop list/map toggle
const desktopTabList = document.getElementById('desktop-tab-list');
const desktopTabMap = document.getElementById('desktop-tab-map');
const desktopListView = document.getElementById('desktop-list-view');
const desktopMapView = document.getElementById('desktop-map-view');

function showDesktopList() {
  desktopListView?.classList.remove('hidden');
  desktopListView?.classList.add('flex');
  desktopMapView?.classList.add('hidden');
  desktopMapView?.classList.remove('block');
  if (desktopTabList) {
    desktopTabList.className = 'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-white text-[#2D4A2D] shadow-sm transition-all';
  }
  if (desktopTabMap) {
    desktopTabMap.className = 'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 transition-all';
  }
}

function showDesktopMap() {
  desktopListView?.classList.add('hidden');
  desktopListView?.classList.remove('flex');
  desktopMapView?.classList.remove('hidden');
  desktopMapView?.classList.add('block');
  if (desktopTabMap) {
    desktopTabMap.className = 'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-white text-[#2D4A2D] shadow-sm transition-all';
  }
  if (desktopTabList) {
    desktopTabList.className = 'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium text-gray-500 transition-all';
  }
  // Trigger Leaflet resize so it renders correctly
  window.dispatchEvent(new Event('resize'));
}

desktopTabList?.addEventListener('click', showDesktopList);
desktopTabMap?.addEventListener('click', showDesktopMap);

// Search + category filtering
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const categoryBtns = document.querySelectorAll<HTMLButtonElement>('.category-btn');
const needCards = document.querySelectorAll<HTMLElement>('.need-card');
let activeCategory = 'all';

function filterCards() {
  const query = searchInput?.value.toLowerCase().trim() || '';
  needCards.forEach((card) => {
    const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
    const matchesSearch = !query || (card.dataset.searchable || '').includes(query);
    card.style.display = matchesCategory && matchesSearch ? '' : 'none';
  });
}

const searchClear = document.getElementById('search-clear');

function updateSearchClear() {
  if (!searchClear || !searchInput) return;
  if (searchInput.value.length > 0) {
    searchClear.classList.remove('hidden');
  } else {
    searchClear.classList.add('hidden');
  }
}

searchInput?.addEventListener('input', () => {
  filterCards();
  updateSearchClear();
});

searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    searchInput.blur();
    filterCards();
    updateSearchClear();
  }
});

searchClear?.addEventListener('click', () => {
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  filterCards();
  updateSearchClear();
});

categoryBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category || 'all';
    categoryBtns.forEach((b) => {
      if (b === btn) {
        b.className = 'category-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-[#2D4A2D] text-white';
      } else {
        b.className = 'category-btn px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-white text-gray-700 border border-gray-300 hover:border-[#2D4A2D] hover:text-[#2D4A2D]';
      }
    });
    filterCards();
  });
});

// --- Location-based sorting ---

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const locationBtn = document.getElementById('location-btn');
const locationBtnText = document.getElementById('location-btn-text');
const locationIndicator = document.getElementById('location-indicator');
const locationIndicatorText = document.getElementById('location-indicator-text');
const locationClear = document.getElementById('location-clear');
const cardGrid = document.querySelector('.grid.sm\\:grid-cols-2') as HTMLElement | null;

let sortLat: number | null = null;
let sortLng: number | null = null;
let originalOrder: HTMLElement[] | null = null;

// Save original card order
if (cardGrid) {
  originalOrder = Array.from(cardGrid.querySelectorAll<HTMLElement>('.need-card'));
}

function sortByDistance(lat: number, lng: number, label: string) {
  if (!cardGrid || !originalOrder) return;
  sortLat = lat;
  sortLng = lng;

  const cards = Array.from(cardGrid.querySelectorAll<HTMLElement>('.need-card'));
  cards.sort((a, b) => {
    const aLat = parseFloat(a.dataset.lat || '');
    const aLng = parseFloat(a.dataset.lng || '');
    const bLat = parseFloat(b.dataset.lat || '');
    const bLng = parseFloat(b.dataset.lng || '');
    const aDist = isNaN(aLat) || isNaN(aLng) ? Infinity : haversine(lat, lng, aLat, aLng);
    const bDist = isNaN(bLat) || isNaN(bLng) ? Infinity : haversine(lat, lng, bLat, bLng);
    return aDist - bDist;
  });
  cards.forEach(card => cardGrid.appendChild(card));

  // Update UI
  locationIndicator?.classList.remove('hidden');
  locationIndicator?.classList.add('flex');
  if (locationIndicatorText) locationIndicatorText.textContent = label;
  locationBtn?.classList.add('border-[#2D4A2D]', 'text-[#2D4A2D]');
  locationBtn?.classList.remove('text-gray-700');
}

function clearLocationSort() {
  if (!cardGrid || !originalOrder) return;
  sortLat = null;
  sortLng = null;
  originalOrder.forEach(card => cardGrid.appendChild(card));
  locationIndicator?.classList.add('hidden');
  locationIndicator?.classList.remove('flex');
  locationBtn?.classList.remove('border-[#2D4A2D]', 'text-[#2D4A2D]');
  locationBtn?.classList.add('text-gray-700');
  if (locationBtnText) locationBtnText.textContent = 'Near me';
  localStorage.removeItem('rin-location-pref');
}

// Check for CF geolocation (approximate, no prompt)
const cfEl = document.getElementById('cf-location');
const cfLat = parseFloat(cfEl?.dataset.lat || '');
const cfLng = parseFloat(cfEl?.dataset.lng || '');

// Check localStorage for saved preference
const savedPref = localStorage.getItem('rin-location-pref');
if (savedPref) {
  try {
    const { lat: sLat, lng: sLng, source } = JSON.parse(savedPref);
    if (typeof sLat === 'number' && typeof sLng === 'number') {
      sortByDistance(sLat, sLng, source === 'exact' ? 'Sorted by distance (precise)' : 'Sorted by distance (approximate)');
    }
  } catch {}
} else if (!isNaN(cfLat) && !isNaN(cfLng)) {
  // Auto-sort by CF location
  sortByDistance(cfLat, cfLng, 'Sorted by distance (approximate)');
  localStorage.setItem('rin-location-pref', JSON.stringify({ lat: cfLat, lng: cfLng, source: 'cf' }));
}

// "Near me" button — prompt for exact browser geolocation
locationBtn?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    // Fallback to CF location if available
    if (!isNaN(cfLat) && !isNaN(cfLng)) {
      sortByDistance(cfLat, cfLng, 'Sorted by distance (approximate)');
      localStorage.setItem('rin-location-pref', JSON.stringify({ lat: cfLat, lng: cfLng, source: 'cf' }));
    }
    return;
  }
  if (locationBtnText) locationBtnText.textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      sortByDistance(latitude, longitude, 'Sorted by distance (precise)');
      if (locationBtnText) locationBtnText.textContent = 'Near me';
      localStorage.setItem('rin-location-pref', JSON.stringify({ lat: latitude, lng: longitude, source: 'exact' }));
    },
    () => {
      // Denied or error — fall back to CF if available
      if (!isNaN(cfLat) && !isNaN(cfLng)) {
        sortByDistance(cfLat, cfLng, 'Sorted by distance (approximate)');
        localStorage.setItem('rin-location-pref', JSON.stringify({ lat: cfLat, lng: cfLng, source: 'cf' }));
      }
      if (locationBtnText) locationBtnText.textContent = 'Near me';
    },
    { enableHighAccuracy: false, timeout: 10000 }
  );
});

// Clear location sort
locationClear?.addEventListener('click', clearLocationSort);
