/**
 * Property Agent Website — app.js
 * 
 * Pipeline: listings-index.json → listing/{id}/listing.json → rendered UI
 * Works with a local HTTP server (python3 -m http.server 8080)
 */

'use strict';

/* ============================================================
   CONFIG — edit these to match your site
   ============================================================ */
const CONFIG = {
  siteName:    'Joshua C Estates',
  agentName:   'Joshua Chew',
  agentLicense:'CEA Reg. No. R072867H',
  agentPhone:  '+65 8845 2785',
  agentEmail:  'joshuachewshiyang@gmail.com',
  agentPhoto:  'images/agent/JoshuaChew.jpg',
  currency:    'S$',
  dataDir:     'data/',
  listingsDir: 'listings/',
};

/* ============================================================
   HELPERS
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatPrice(num) {
  if (!num) return '—';
  return CONFIG.currency + Number(num).toLocaleString('en-SG');
}
function formatPsf(num) {
  if (!num) return '';
  return CONFIG.currency + Number(num).toLocaleString('en-SG') + ' psf';
}
function formatSize(num) {
  if (!num) return '—';
  return Number(num).toLocaleString('en-SG') + ' sqft';
}
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/* Icon SVGs (inline) */
const ICONS = {
  bed:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 14h20M7 14V9a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5"/></svg>`,
  bath: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4z"/><path d="M4 12V6a2 2 0 0 1 2-2h2v2"/><path d="M8 20v2M16 20v2"/></svg>`,
  area: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/></svg>`,
  car:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17v2M19 17v2M7 12h10"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/></svg>`,
  pin:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  phone:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.41 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.32 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 5.89 5.89l.77-.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>`,
  wa:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  video:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  arrow:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  img:  `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
};

/* ============================================================
   DATA LOADING
   ============================================================ */
let _allListings = null;

async function fetchJSON(path) {
  const res = await fetch(path + '?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadAllListings(featuredOnly = false) {
  if (_allListings) {
    return featuredOnly ? _allListings.filter(l => l.featured) : _allListings;
  }
  const index = await fetchJSON(CONFIG.dataDir + 'listings-index.json');
  const promises = index.listings
    .filter(entry => entry.active !== false)
    .map(entry =>
      fetchJSON(CONFIG.listingsDir + entry.id + '/listing.json').catch(() => null)
    );
  const results = await Promise.all(promises);
  _allListings = results
    .filter(Boolean)
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  return featuredOnly ? _allListings.filter(l => l.featured) : _allListings;
}

/* ============================================================
   CARD TEMPLATE
   ============================================================ */
function getFirstPhoto(listing) {
  if (listing.photos && listing.photos.length > 0) {
    return CONFIG.listingsDir + listing.id + '/photos/' + listing.photos[0];
  }
  return null;
}

function createCard(listing) {
  const photo = getFirstPhoto(listing);
  const imgHtml = photo
    ? `<img src="${photo}" alt="${listing.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-img-placeholder>${ICONS.img}</div>'">`
    : `<div class="card-img-placeholder">${ICONS.img}</div>`;

  const statusBadge = listing.status === 'Sold'
    ? `<span class="badge badge-sold">Sold</span>`
    : listing.status === 'For Rent'
    ? `<span class="badge badge-rent">For Rent</span>`
    : `<span class="badge badge-sale">For Sale</span>`;

  const psfHtml = listing.psf ? `<div class="card-psf">${formatPsf(listing.psf)}</div>` : '';
  const carHtml = listing.carparks
    ? `<span class="spec">${ICONS.car} ${listing.carparks} Car</span>` : '';

  return `
<a href="listing.html?id=${listing.id}" class="listing-card reveal">
  <div class="listing-card-img">
    ${imgHtml}
    ${statusBadge}
  </div>
  <div class="listing-card-body">
    <div class="card-price">${listing.price ? formatPrice(listing.price) : (listing.priceDisplay || '—')}</div>
    ${psfHtml}
    <div class="card-title">${listing.title}</div>
    ${listing.subtitle ? `<div class="card-subtitle">${listing.subtitle}</div>` : ''}
    <div class="card-address">${ICONS.pin} ${listing.address}</div>
    <div class="card-specs">
      ${listing.bedrooms ? `<span class="spec">${ICONS.bed} ${listing.bedrooms} Bed</span>` : ''}
      ${listing.bathrooms ? `<span class="spec">${ICONS.bath} ${listing.bathrooms} Bath</span>` : ''}
      <span class="spec">${ICONS.area} ${formatSize(listing.size)}</span>
      ${carHtml}
    </div>
  </div>
</a>`;
}

function createSkeletons(n = 3) {
  return Array(n).fill(0).map(() => `
<div class="skel-card">
  <div class="skel-img skeleton-pulse"></div>
  <div class="skel-body">
    <div class="skel-line h-lg skeleton-pulse w-70"></div>
    <div class="skel-line skeleton-pulse w-full"></div>
    <div class="skel-line skeleton-pulse w-40"></div>
  </div>
</div>`).join('');
}

/* ============================================================
   PAGE: HOME — featured listings by category
   ============================================================ */
async function initHome() {
  const containers = {
    commercial:  document.getElementById('featuredCommercial'),
    residential: document.getElementById('featuredResidential'),
    rental:      document.getElementById('featuredRentals'),
  };
  if (!containers.commercial && !containers.residential && !containers.rental) return;

  Object.values(containers).forEach(c => { if (c) c.innerHTML = createSkeletons(3); });

  try {
    const listings = await loadAllListings();

    const groups = {
      commercial:  listings.filter(l => l.category === 'commercial'),
      residential: listings.filter(l => l.category === 'residential'),
      rental:      listings.filter(l => l.category === 'rental'),
    };

    Object.entries(groups).forEach(([key, items]) => {
      const container = containers[key];
      if (!container) return;
      const featured = items.filter(l => l.featured);
      const toShow   = (featured.length ? featured : items).slice(0, 3);
      container.innerHTML = toShow.length
        ? toShow.map(createCard).join('')
        : `<div class="empty-state"><p>No ${key} listings yet.</p></div>`;
    });

    triggerReveal();
  } catch (e) {
    Object.values(containers).forEach(c => { if (c) c.innerHTML = buildServerNotice(); });
    console.warn('Home listings error:', e);
  }
}

/* ============================================================
   PAGE: LISTINGS — full grid with two-level filters
   ============================================================ */
async function initListings() {
  const container = document.getElementById('listingsGrid');
  if (!container) return;

  container.innerHTML = createSkeletons(6);

  let allListings = [];
  try {
    allListings = await loadAllListings();
  } catch(e) {
    container.innerHTML = buildServerNotice();
    console.warn(e);
    return;
  }

  const countEl  = document.getElementById('listingCount');
  const subBar   = document.getElementById('subFilters');
  let primary    = 'all';
  let sub        = 'all';

  function render() {
    let filtered = allListings;

    if (primary === 'sale') filtered = filtered.filter(l => l.status === 'For Sale');
    if (primary === 'rent') filtered = filtered.filter(l => l.status === 'For Rent');

    if (sub !== 'all') {
      filtered = filtered.filter(l => {
        const type = l.type?.toLowerCase() || '';
        const cat  = l.category?.toLowerCase() || '';
        if (sub === 'commercial') return cat === 'commercial' || cat === 'rental' ||
          type.includes('industrial') || type.includes('office') ||
          type.includes('commercial') || type.includes('food');
        if (sub === 'condo')   return type.includes('condo');
        if (sub === 'hdb')     return type.includes('hdb');
        if (sub === 'landed')  return type.includes('landed');
        return true;
      });
    }

    if (countEl) countEl.textContent = filtered.length;
    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          ${ICONS.img}
          <h3>No listings found</h3>
          <p>Try a different filter.</p>
        </div>`;
      return;
    }
    container.innerHTML = filtered.map(createCard).join('');
    triggerReveal();
  }

  // Primary filter buttons
  $$('.filter-btn[data-primary]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn[data-primary]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      primary = btn.dataset.primary;

      if (primary === 'all') {
        subBar?.classList.remove('visible');
      } else {
        subBar?.classList.add('visible');
      }

      // Reset sub filter
      sub = 'all';
      $$('.filter-sub').forEach(b => b.classList.remove('active'));
      $$('.filter-sub[data-sub="all"]')[0]?.classList.add('active');

      render();
    });
  });

  // Sub filter buttons
  $$('.filter-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-sub').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sub = btn.dataset.sub;
      render();
    });
  });

  render();
}

/* ============================================================
   PAGE: LISTING DETAIL
   ============================================================ */
async function initListingDetail() {
  const id = getParam('id');
  const root = document.getElementById('listingRoot');
  if (!root || !id) {
    if (root) root.innerHTML = '<p style="padding:4rem 2rem;color:var(--text-muted)">Listing not found.</p>';
    return;
  }

  root.innerHTML = `<div style="padding:4rem 2rem;text-align:center;color:var(--text-muted)">Loading…</div>`;

  let listing;
  try {
    listing = await fetchJSON(CONFIG.listingsDir + id + '/listing.json');
  } catch(e) {
    root.innerHTML = buildServerNotice() + `<p style="padding:2rem;color:var(--text-muted)">Could not load listing <strong>${id}</strong>.</p>`;
    return;
  }

  document.title = `${listing.title} — ${CONFIG.siteName}`;

  // Build photo gallery
  const photos = (listing.photos || []).map(p => CONFIG.listingsDir + id + '/photos/' + p);
  const galleryHtml = buildGallery(photos);

  // Build highlights
  const highlightsHtml = listing.highlights?.length
    ? `<ul class="highlights-list">${listing.highlights.map(h => `<li>${h}</li>`).join('')}</ul>`
    : '';

  // Build amenities
  const amenitiesHtml = listing.amenities?.length
    ? `<div class="pills">${listing.amenities.map(a => `<span class="pill">${a}</span>`).join('')}</div>`
    : '';

  // Video section
  const videoHtml = listing.videoUrl
    ? `<div class="detail-block">
        <h3>Video Tour</h3>
        <div class="video-wrap">
          <iframe src="${listing.videoUrl}" allowfullscreen loading="lazy"></iframe>
        </div>
       </div>`
    : '';

  // Nearby
  const nearbyHtml = [
    listing.nearbyMRT     ? `<li>${listing.nearbyMRT}</li>` : '',
    ...(listing.nearbySchools || []).map(s => `<li>${s}</li>`),
    ...(listing.nearbyMalls   || []).map(m => `<li>${m}</li>`),
  ].join('');

  root.innerHTML = `
    <!-- Gallery -->
    ${galleryHtml}

    <!-- Listing Info -->
    <div class="container">
      <div class="listing-layout">

        <!-- Main Content -->
        <div class="listing-main">

          <!-- Title block -->
          <div class="detail-block">
            <span class="eyebrow">${listing.type || 'Residential'} · ${listing.district || ''}</span>
            <h2 style="margin-bottom:0.35rem">${listing.title}</h2>
            <p style="font-size:1rem;margin-bottom:1.5rem">${ICONS.pin} &nbsp;${listing.address}</p>
            <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:baseline">
              <span style="font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:600;color:var(--text)">${formatPrice(listing.price)}</span>
              ${listing.psf ? `<span style="color:var(--text-muted);font-size:0.9rem">${formatPsf(listing.psf)}</span>` : ''}
            </div>
          </div>

          <!-- Key Specs -->
          <div class="detail-block">
            <h3>Property Details</h3>
            <div class="specs-grid">
              ${listing.bedrooms  ? specBlock('Bedrooms',  listing.bedrooms)  : ''}
              ${listing.bathrooms ? specBlock('Bathrooms', listing.bathrooms) : ''}
              ${specBlock('Size',        listing.size ? formatSize(listing.size) : '—')}
              ${specBlock('Floor',       listing.floor ? `${listing.floor} / ${listing.totalFloors || '?'}` : '—')}
              ${specBlock('Tenure',      listing.tenure)}
              ${specBlock('TOP',         listing.TOP)}
              ${specBlock('Developer',   listing.developer)}
              ${specBlock('Car Parks',   listing.carparks ?? '—')}
              ${specBlock('District',    listing.district)}
              ${specBlock('Status',      listing.status)}
            </div>
          </div>

          <!-- Description -->
          ${listing.description ? `
          <div class="detail-block">
            <h3>About This Property</h3>
            <div style="line-height:1.75;color:var(--text-muted);white-space:pre-line">${listing.description}</div>
            ${highlightsHtml}
          </div>` : ''}

          <!-- Amenities -->
          ${listing.amenities?.length ? `
          <div class="detail-block">
            <h3>Facilities & Amenities</h3>
            ${amenitiesHtml}
          </div>` : ''}

          <!-- Location -->
          ${nearbyHtml ? `
          <div class="detail-block">
            <h3>Location & Nearby</h3>
            <ul class="highlights-list">${nearbyHtml}</ul>
          </div>` : ''}

          <!-- Video -->
          ${videoHtml}

        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <div class="enquiry-card">
            <div class="agent-row">
              <img class="agent-avatar"
                   src="${CONFIG.agentPhoto}"
                   alt="${CONFIG.agentName}"
                   onerror="this.style.display='none'">
              <div>
                <div class="agent-name">${listing.agent?.name || CONFIG.agentName}</div>
                <div class="agent-license">${listing.agent?.license || CONFIG.agentLicense}</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Your Name</label>
              <input type="text" class="form-input" placeholder="Full name">
            </div>
            <div class="form-group">
              <label class="form-label">Phone / WhatsApp</label>
              <input type="tel" class="form-input" placeholder="+65 XXXX XXXX">
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea class="form-input" placeholder="I'm interested in ${listing.title}. Please contact me."></textarea>
            </div>
            <a href="https://wa.me/${(listing.agent?.phone||CONFIG.agentPhone).replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I'm interested in ${listing.title} (${listing.address}). Price: ${formatPrice(listing.price)}. Please contact me.`)}"
               class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:0.6rem"
               target="_blank" rel="noopener">
              ${ICONS.wa} WhatsApp Agent
            </a>
            <a href="tel:${(listing.agent?.phone||CONFIG.agentPhone).replace(/\s/g,'')}"
               class="btn btn-outline" style="width:100%;justify-content:center">
              ${ICONS.phone} Call Now
            </a>
          </div>

          <div class="info-card">
            <div class="info-row">
              <span class="info-row-label">Property Type</span>
              <span class="info-row-value">${listing.type || '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Listing Status</span>
              <span class="info-row-value" style="color:var(--gold)">${listing.status || '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Size</span>
              <span class="info-row-value">${formatSize(listing.size)}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Price PSF</span>
              <span class="info-row-value">${formatPsf(listing.psf)}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Listed</span>
              <span class="info-row-value">${listing.dateAdded || '—'}</span>
            </div>
          </div>

          <a href="listings.html" style="display:block;text-align:center;font-size:0.82rem;color:var(--text-muted);margin-top:1rem;padding:0.75rem">
            ← Back to all listings
          </a>
        </div>

      </div>
    </div>`;

  // Init lightbox
  initLightbox(photos);
  triggerReveal();
}

function specBlock(label, value) {
  return `
<div class="spec-block">
  <div class="spec-block-label">${label}</div>
  <div class="spec-block-value">${value ?? '—'}</div>
</div>`;
}

function buildGallery(photos) {
  if (!photos.length) return '';

  const makeItem = (src, cls) => `
<div class="${cls} gallery-item" data-src="${src}">
  <img src="${src}" alt="Property photo" loading="lazy"
       onerror="this.parentElement.innerHTML='<div class=placeholder>${ICONS.img}</div>'">
</div>`;

  let inner = '';
  if (photos.length === 1) {
    inner = `<div class="gallery-main gallery-item" data-src="${photos[0]}">
      <img src="${photos[0]}" alt="Property photo" loading="lazy"></div>`;
    return `<div class="photo-gallery" style="grid-template-columns:1fr;grid-template-rows:auto;height:460px">${inner}</div>`;
  }
  if (photos.length === 2) {
    inner = makeItem(photos[0], 'gallery-main') + makeItem(photos[1], '');
    return `<div class="photo-gallery" style="grid-template-rows:auto;height:460px">${inner}</div>`;
  }

  const rest = photos.slice(1, 5);
  const extraCount = photos.length - 5;
  const restItems = rest.map((src, i) => {
    if (i === 3 && extraCount > 0) {
      return `<div class="gallery-item" data-src="${src}">
        <img src="${src}" alt="" loading="lazy">
        <div class="gallery-more-overlay">+${extraCount + 1} more</div>
      </div>`;
    }
    return makeItem(src, '');
  }).join('');

  return `<div class="photo-gallery">${makeItem(photos[0], 'gallery-main')}${restItems}</div>`;
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function initLightbox(photos) {
  let current = 0;
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg    = lb.querySelector('.lb-img');
  const lbCount  = lb.querySelector('.lb-counter');
  const lbClose  = lb.querySelector('.lb-close');
  const lbPrev   = lb.querySelector('.lb-prev');
  const lbNext   = lb.querySelector('.lb-next');

  function show(idx) {
    current = (idx + photos.length) % photos.length;
    lbImg.src = photos[current];
    if (lbCount) lbCount.textContent = `${current + 1} / ${photos.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  $$('.gallery-item').forEach((el, i) => {
    el.addEventListener('click', () => show(i < photos.length ? i : 0));
  });

  lbClose?.addEventListener('click', close);
  lbPrev?.addEventListener('click',  () => show(current - 1));
  lbNext?.addEventListener('click',  () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

/* ============================================================
   NOTICE (server not running)
   ============================================================ */
function buildServerNotice() {
  return `<div class="notice-bar">${ICONS.info}
    <span><strong>Local server required.</strong>
    JSON data can't be loaded via <code>file://</code>.
    Run: <code>python3 -m http.server 8080</code> then open <code>http://localhost:8080</code></span>
  </div>`;
}

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const nav  = document.getElementById('mainNav');
  const ham  = document.getElementById('hamburger');
  const mob  = document.getElementById('mobileNav');

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  if (window.scrollY > 40) nav?.classList.add('scrolled');

  // Mobile menu
  ham?.addEventListener('click', () => {
    mob?.classList.toggle('open');
    const spans = ham.querySelectorAll('span');
    const isOpen = mob?.classList.contains('open');
    if (spans[0]) spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    if (spans[1]) spans[1].style.opacity   = isOpen ? '0' : '1';
    if (spans[2]) spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href')?.split('?')[0];
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('in-view'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => obs.observe(el));
}

function triggerReveal() {
  // Small delay so DOM is painted first
  requestAnimationFrame(() => {
    $$('.reveal:not(.in-view)').forEach((el, i) => {
      el.style.transitionDelay = `${i * 60}ms`;
    });
    initScrollReveal();
  });
}

/* ============================================================
   PAGE: CONTACT
   ============================================================ */
function initContact() {
  // Populate agent contact details
  const emailLinks  = $$('[data-agent-email]');
  const phoneLinks  = $$('[data-agent-phone]');
  const waLinks     = $$('[data-agent-wa]');

  emailLinks.forEach(el => {
    el.textContent = CONFIG.agentEmail;
    el.href        = `mailto:${CONFIG.agentEmail}`;
  });
  phoneLinks.forEach(el => {
    el.textContent = CONFIG.agentPhone;
    el.href        = `tel:${CONFIG.agentPhone.replace(/\s/g,'')}`;
  });
  waLinks.forEach(el => {
    const num = CONFIG.agentPhone.replace(/\D/g,'');
    el.href = `https://wa.me/${num}`;
  });

  // Simple form → mailto fallback
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.querySelector('[name=name]')?.value || '';
    const email   = form.querySelector('[name=email]')?.value || '';
    const phone   = form.querySelector('[name=phone]')?.value || '';
    const message = form.querySelector('[name=message]')?.value || '';
    const subject = encodeURIComponent('Property Enquiry from ' + name);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`);
    window.location.href = `mailto:${CONFIG.agentEmail}?subject=${subject}&body=${body}`;
  });
}

/* ============================================================
   BOOT — detect page and init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();

  const page = document.body.dataset.page;
  switch (page) {
    case 'home':    initHome();    break;
    case 'listings':initListings();break;
    case 'listing': initListingDetail(); break;
    case 'contact': initContact(); break;
  }
});
