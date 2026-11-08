# What If Pushpa Had a Website?

A cinematic fan-made tribute site for **Pushpa Raj** and the Seshachalam Red Sandalwood world — an interactive 3D timber vault, a live convoy radar, a Syndicate ID pass generator and more.

> Fan conceptual project. Not affiliated with or endorsed by the makers of the *Pushpa* films.

## Features

- **Cinematic hero** with parallax depth, 3D-tilt portrait, animated stats and a live market ticker
- **3D Red Sandalwood Vault** (Three.js) — rotate, zoom and inspect a procedural sandalwood log and a forged axe, with ember particle effects
- **Convoy Radar** — animated tactical map with clickable waypoints and a GPS ping
- **Syndicate Clearance Pass generator** — fill in a name, alias, role and sector, mint a pass with a serial number, then print/save it or copy the serial
- **"Thaggedhe Le" mode** — a full-screen modal with synthesized sound effects
- Scroll progress bar, scroll-reveal animations, section-aware navigation
- Responsive layout, keyboard-accessible controls, and `prefers-reduced-motion` support

## Tech Stack

- HTML, CSS, vanilla JavaScript — no build step, no dependencies to install
- [Three.js](https://threejs.org/) r128 + OrbitControls (loaded from a CDN)
- Google Fonts: Cinzel, Rajdhani, Outfit
- Web Audio API for sound effects

## How to Run

The site is fully static, so there is nothing to install or build.

### Option 1 — Open the file

Double-click `index.html`, or open it in your browser.

> Some browsers restrict features when a page is opened as a plain file. If anything looks off, use Option 2.

### Option 2 — Run a local server (recommended)

From the project folder, run **one** of these:

```bash
# Python 3
python3 -m http.server 8000
```

```bash
# Node.js
npx serve .
```

Then open <http://localhost:8000> in your browser.

### Requirements

- A modern browser (Chrome, Edge, Firefox or Safari) with WebGL enabled
- An internet connection on first load (Three.js and the fonts come from CDNs)

## Project Structure

```
.
├── index.html        # Page structure and content
├── style.css         # Design system, layout and animations
├── app.js            # Particles, audio, radar, pass generator, UI effects
├── three-scene.js    # 3D vault (Three.js scene, models, controls)
└── assets/           # Images
```

## Usage Tips

- **3D Vault:** drag to rotate, scroll to zoom, right-click drag to pan. Use the buttons to switch between the log and the axe, burst embers, or reset the camera.
- **Clearance Pass:** edit the form fields — the card updates live. Click *Mint* for a new serial, then *Print / Save Pass* to save it as a PDF.
- **Sound:** sound effects play only after you interact with the page. Use the *Atmosphere* button in the header to toggle the ambient soundscape.

## Credits

Inspired by the *Pushpa: The Rise* and *Pushpa: The Rule* films. All trademarks and characters belong to their respective owners.
