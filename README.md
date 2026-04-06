# 🏠 Singapore Property Agent Website

A self-hosted, luxury-themed property listing site. No backend needed — runs entirely on static files + JSON.

---

## QUICK START

```bash
cd property-site
python3 -m http.server 8080
# Open: http://localhost:8080
```

> ⚠️  Must be served over HTTP (not opened directly as file://).
> Any static host works: Nginx, Apache, Netlify, GitHub Pages, Vercel.

---

## 1 — CONFIGURE YOUR DETAILS

Open `assets/js/app.js` and update the CONFIG block at the top:

```js
const CONFIG = {
  siteName:     'Your Name',          // ← logo text in nav
  agentName:    'Your Name',
  agentTitle:   'Senior Property Consultant',
  agentLicense: 'CEA Reg. No. RXXXXXXXX',
  agentPhone:   '+65 9123 4567',
  agentEmail:   'joshuachewshiyang@gmail.com',
  agentPhoto:   'images/agent/photo.png',
  agentBio:     'Your bio here...',
  ...
};
```

Also do a find-replace in the 4 HTML files for `Your<em>Name</em>` → your actual name.

---

## 2 — ADD YOUR PHOTO

Drop your professional photo at:
```
images/agent/photo.png
```
See `images/agent/README.txt` for tips. A transparent-background PNG looks best.

---

## 3 — ADD A NEW LISTING

**Option A — Script (recommended):**
```bash
./new-listing.sh river-valley-condo
```
This creates the folder, copies the template, and registers it automatically.

**Option B — Manual:**
1. Create folder: `listings/YOUR-ID/`
2. Copy `listings/_template/listing.json` → `listings/YOUR-ID/listing.json`
3. Edit the JSON with your listing details
4. Drop photos into `listings/YOUR-ID/photos/` named `photo1.jpg`, `photo2.jpg` …
5. Add `{"id": "YOUR-ID", "active": true}` to `data/listings-index.json`

---

## 4 — LISTING JSON FIELDS

| Field | Description |
|-------|-------------|
| `id` | Must match folder name |
| `title` | Listing headline |
| `type` | `"condo"` / `"hdb"` / `"landed"` / `"commercial"` |
| `status` | `"For Sale"` / `"For Rent"` / `"Sold"` / `"Featured"` |
| `price` | e.g. `"S$2,980,000"` |
| `psf` | e.g. `"S$1,850 psf"` |
| `size` | e.g. `"1,615 sqft"` |
| `bedrooms` | number |
| `bathrooms` | number |
| `carparks` | number |
| `address` | Full address string |
| `district` | e.g. `"D09"` |
| `tenure` | `"Freehold"` / `"99-year Leasehold"` |
| `TOP` | e.g. `"2019"` |
| `description` | Long-form description |
| `highlights` | Array of short bullet strings |
| `amenities` | Array of amenity names |
| `nearbyMRT` | e.g. `"Orchard MRT (3 min walk)"` |
| `nearbySchools` | Array of school names |
| `nearbyMalls` | Array of mall names |
| `photos` | Array of filenames, e.g. `["photo1.jpg","photo2.jpg"]` |
| `videoUrl` | YouTube embed URL (optional) |
| `featured` | `true` to show on homepage |
| `active` | Set `false` to hide without deleting |

---

## 5 — EMBED A VIDEO

In any listing's `listing.json`, set:
```json
"videoUrl": "https://www.youtube.com/embed/VIDEO_ID"
```
A responsive 16:9 video section will appear automatically on that listing's page.

---

## 6 — DEACTIVATE A LISTING

In `data/listings-index.json`, set the listing to `"active": false`:
```json
{"id": "old-listing", "active": false}
```
The listing disappears from the site but all files are preserved.

---

## FILE STRUCTURE

```
property-site/
├── index.html              ← Homepage
├── listings.html           ← Full listings grid with filters
├── listing.html            ← Individual listing detail (uses ?id= URL param)
├── contact.html            ← Contact page
├── new-listing.sh          ← Scaffold script for new listings
├── assets/
│   ├── css/main.css        ← Full design system
│   └── js/app.js           ← Data pipeline + CONFIG
├── data/
│   └── listings-index.json ← Master index of active listing IDs
├── images/
│   ├── skyline/
│   │   ├── skyline-night.svg  ← Night skyline (used in hero)
│   │   └── skyline-day.svg    ← Day skyline (alternate)
│   └── agent/
│       └── photo.png       ← DROP YOUR PHOTO HERE
└── listings/
    ├── _template/
    │   └── listing.json    ← Template — copy this for new listings
    ├── orchard-valley/     ← Sample listing
    ├── marina-bay-suites/  ← Sample listing (with video)
    └── sentosa-cove/       ← Sample listing
```

---

## HOSTING OPTIONS

| Platform | Steps |
|----------|-------|
| **Nginx** | Point root to `property-site/` folder |
| **Netlify** | Drag-and-drop the folder at netlify.com/drop |
| **GitHub Pages** | Push to a repo, enable Pages in Settings |
| **Vercel** | `vercel deploy` in the folder |
| **Local** | `python3 -m http.server 8080` |
