# Ahmed Osama — Stellar Portfolio v4 (Free Offline Quiz)

A lightweight accessible vanilla JavaScript portfolio with a cinematic Three.js planet explorer, working WebGL/SVG fallback, and a **completely free local technical quiz**. No API keys, models, token credits, registrations, databases, installs, or backend hosting are required.

## Run locally

Requirements: Python 3 or any basic local static server; Node.js 20+ for automated tests.

```bash
python -m http.server 8000
# Open http://localhost:8000
```

You can explore the full portfolio without JavaScript. The interactive solar system and quiz need JavaScript. Three.js is loaded from a pinned CDN when WebGL is supported; if unavailable, the interactive SVG fallback remains.

## Test

```bash
node --test *.test.mjs
```

Browser smoke test (optional, requires Playwright Python and Chrome/Chromium):

```bash
python smoke_browser.py
```

## Deploy to Vercel

Connect the root of your GitHub repository to Vercel; framework **Other**, output directory `.`, root `./`, and **no build command**. Existing `vercel.json` contains static security headers. A push to the connected `main` branch redeploys automatically.

No environment variables are required. You do **not** need an OpenAI API key or a Vercel Function. This edition removes the previous `api/` directory and the AI-generation feature entirely.

## Architecture

| File | Purpose |
|---|---|
| `index.html`, `styles.css` | Accessible résumé, solar controls, responsive layouts and offline quiz form |
| `app.mjs` | Navigation, project filtering, commands and optional interactive initialization |
| `solar-system.mjs` | Three.js scene, planet picker, cinematic zoom and return, graphics fallback, motion lifecycle |
| `camera-focus.mjs` | Pure easing and camera interpolation, independently tested |
| `planet-textures.mjs` | Procedural surfaces, atmosphere, sunlight and planet-appropriate ring geometry |
| `planets.mjs` | Solar facts, positions, theme palettes and accessibility contrast calculations |
| `quiz-bank.mjs` | 108 curated technical questions in 6 categories and 3 difficulty levels |
| `quiz.mjs` | Pure no-repeat deck selection, choice shuffling, scoring and state transitions |
| `quiz-ui.mjs` | Topic/difficulty picker and accessible multiple-choice experience |
| `*.test.mjs` | Node test suite for bank, scoring, camera, assets and accessibility |
| `vercel.json` | Build-free static deployment and security headers |

## Quiz details

The user selects a topic: **Surprise me**, **AI & ML**, **Neural Networks**, **Python**, **Cybersecurity**, **Web Development**, or **Databases & SQL**. The user selects **Beginner**, **Intermediate** or **Advanced**. Each round samples five distinct questions, randomizes answer order, gives feedback and keeps score. Replays prefer previously unseen questions where possible. **Topics are deliberately limited to the bundled bank**; the quiz does not claim to generate custom new questions for arbitrary prompts.

To update quiz content, edit `quiz-bank.mjs`. Each entry has one question, correct answer, three distractors and a factual explanation. After edits run `node --test *.test.mjs`. The `TOPICS` list and data must stay in sync.

## Planet explorer

Selecting the Sun, one of the eight planets or the Moon updates the page theme and animates the camera toward the chosen body with a 1.45-second eased transition. **Return to orbit** restores the overview. Planet surfaces are procedural approximations rather than NASA photo textures. Saturn's ring dimensions were corrected to prevent the oversized yellow ring from the prior version. Motion is reduced or paused when appropriate; the SVG/2D planet selector works without WebGL.

## Editing résumé and contacts

The résumé sections are in `index.html`. The downloadable PDF is `Ahmed-Osama-Resume.pdf`. The WhatsApp button uses the verified résumé contact number and the email-copy control remains. Keep the HTML, PDF, and real professional claims consistent when changing information.

## Limitations and dependencies

The **quiz works fully offline once the website files are loaded**. The 3D Three.js layer is a free, pinned, open-source CDN dependency and needs internet the first time unless a local copy is bundled. It always has a no-WebGL/no-CDN fallback. There are no paid AI-provider calls.

References: [Three.js](https://threejs.org/) (MIT license), [NASA Solar System](https://science.nasa.gov/solar-system/).

## V5: full-bleed HD solar system

The Three.js canvas now fills the entire hero background instead of a fixed 440×440 pixel element. The responsive DOM/SVG orbit picker stays aligned to the full-width scene via `sceneAnchoring()` in `render-quality.mjs`. A ResizeObserver updates the camera projection and high-DPI render target; the 9.5-million-pixel budget balances clarity with GPU demands. More detailed 128×96 sphere meshes, realistic direct lighting and a translucent Earth cloud layer improve close-up quality. The chosen planet progressively upgrades its surface to 2K; nearby unrelated planets are hidden during close-ups, and Earth's Moon is kept fully inside the viewport even on phones.

**Optional planet photo-map credit:** [Solar System Scope](https://www.solarsystemscope.com/textures/) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). These visual maps use NASA mission data, and may have color adjustments or inferred terrain. Credit also appears in the live planet panel. Image requests occur only on selection, and the generated textures remain a no-network fallback. No API keys or paid services are needed.

The source stays vanilla JS and no-build Vercel. Run `node --test *.test.mjs` and `python smoke_browser.py` to verify the added layout, moon framing, image error fallback and the unchanged offline quiz behavior.

## Focus-camera regression fix (November 2026)

The WebGL renderer spans the full hero, while its orbital world is translated
to a right-hand explorer stage. An orthographic zoom magnifies that translation.
The focus camera now compensates for the world anchor at every frame using
`anchoredCameraOffset` in `render-quality.mjs`, keeping the selected planet in
view during animation, after zooming, and when the viewport is resized.

Verification: run `node --test *.test.mjs` locally. Added regression tests
cover the Sun, all eight planets, the Moon, desktop/mobile positioning,
and invalid zoom values. The quiz, résumé, WhatsApp and free hosting are unchanged.


## Official public address and optional original soundtrack

The canonical portfolio URL is **https://ahmedosama-dev.vercel.app/**. This is
an already-verified Vercel project domain. Older Vercel aliases remain live to
avoid breaking existing links; new sharing and social preview metadata use the
new short address. There is no paid domain registration.

**Orbital Drift** is an original, algorithmically synthesized cinematic ambient
track created with native Web Audio (`ambient-audio.mjs`). It is not a copy of,
or an embedded file from, the U.S. Space Force website. No audio downloads,
third-party music licenses, backend, network requests, or API keys are needed.

- **Off by default.** The header's **♫ Sound off** button starts the score only
  after a visitor clicks it (browser autoplay requirements).
- Click again to pause, or use the labelled volume slider. The site pauses
  playback when the browser tab is hidden and does not auto-resume unexpectedly.
- Unsupported or blocked Web Audio shows a non-blocking error; everything else
  on the résumé keeps working. Mobile controls remain keyboard/screen-reader
  accessible even when the visual volume slider is hidden.
- Run `node --test *.test.mjs`; this includes original score data, voluntary
  playback, pause/volume behaviour, browser visibility and failure/retry tests.

## Sound preference, planetary effects and career targeting

The original **Orbital Drift** soundtrack is enabled by default. Modern browsers
may block actual playback until a visitor's first click or keypress; the UI
reports that state without bypassing browser restrictions. After activation,
playback pauses when a tab is hidden and resumes when visible again, except
when the visitor manually muted it. The shared switch and volume slider govern
both ambient playback and sound effects. Mute choice persists in localStorage
where available. The Sun, eight planets, and Moon each have distinct synthesized
cues; other clickable controls use a subtle universal click. No paid APIs,
external audio assets, or licensed recordings are needed.

The hero and About sections explicitly show the breadth of technical roles
being pursued: AI engineering, automation, web development, IT support and
closely related work. Run `node --test *.test.mjs` to check regressions.

## Performance optimization (v8)

- The offline technology quiz now loads its curated question bank only when a visitor approaches the quiz section, instead of during the homepage's initial render.
- The first Three.js frame appears with simple colored planet materials; detailed procedural planet surfaces and Earth's clouds are added in separate idle tasks. Photographic 2K planet textures still load for selected close-ups when available.
- Planet HTML controls update at 24 Hz separately from WebGL's frame rendering, and their layout scale is calculated on resize rather than for every frame.
- WebGL adapts its frame budget: up to 60 FPS on desktop, 45 FPS on tablets and 30 FPS on small/low-memory devices. Actual frame rates vary with hardware.
- Preconnect to the existing Three.js CDN to reduce connection setup latency when external Three.js loads.
- No paid services, build tooling, or changes to the score, audio preference, accessibility, or orbital camera framing.
- Validate with `node --test *.test.mjs`. No specific Core Web Vitals or percentage gains are claimed without real-user measurement.
