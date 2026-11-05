# Ahmed Osama · Stellar Portfolio v3

A premium, accessible, single-page personal portfolio built with **semantic HTML, CSS, and vanilla JavaScript ES modules**. No React, Node dependencies or compilation is required. Existing résumé sections and the WhatsApp contact link are retained.

## Quick start

1. Extract this entire ZIP into one folder. **Keep the files in the project root** (especially `index.html`, `app.mjs`, `styles.css` and `vercel.json`).
2. Use a local static server (ES modules cannot reliably load from `file://`):

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in a current browser.
4. For the online WebGL Three.js scene, the browser must be able to reach `https://cdn.jsdelivr.net`. If it cannot, the accessible animated 2D orbit explorer remains fully usable.

There are **no `npm install` or `npm run build` steps**. With modern browsers supporting CSS `color-mix`, WebGL2 and ES modules, the full experience is available. Older/restricted devices use the 2D fallback instead of crashing.

## Deploy / update Vercel

The project remains compatible with the existing GitHub→Vercel setup.

- Framework: **Other**
- Root directory: `./`
- Build command: **empty**
- Output directory: `.`
- Environment variables: **none**

Push all top-level files to the existing GitHub repository; Vercel's Git integration deploys commits on its production branch. You can also deploy the unzipped root directory through a static-hosting workflow. Do **not** upload a ZIP as though it were a single website file.

## Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Recruiter-first résumé, projects, design laboratory, solar-explorer and quiz shells |
| `styles.css` | Design system, planet-shifted colors, responsive layout, reduced-motion and interactive styles |
| `app.mjs` | Existing navigation, filters, command palette, website-design lab and safe feature initializers |
| `planets.mjs` | Solar body facts, scaled orbital model, theme tokens, and WCAG contrast calculation helpers |
| `solar-system.mjs` | 2D SVG orbital paths, keyboard/mouse planet controls, Three.js WebGL2 scene, animation lifecycle, fallback |
| `question-bank.mjs` | 45 curated multiple-choice questions (15 per difficulty) spanning science, history, geography, arts and computing |
| `quiz.mjs` | Pure quiz state machine, Fisher–Yates shuffle, scores, correctness and no-repeat behavior |
| `quiz-ui.mjs` | Accessible browser quiz UI with immediate feedback, continue, replay and stop controls |
| `*.test.mjs` | Unit/structural regression tests (Node standard test runner) |
| `smoke_browser.py` | Optional browser smoke checks, including WebGL-disabled fallback |
| `vercel.json` | Static host configuration and security headers |
| `Ahmed-Osama-Resume.pdf` | Source résumé used for download |

### Solar scene design

- **Hybrid rendering:** SVG ellipses remain visible as 2D orbital paths. A Three.js `WebGLRenderer` paints spherical bodies and sparse star points behind the transparent SVG/DOM controls.
- Relative orbit periods and radius proportions are **illustrative, not astronomically to scale**. Mercury moves fastest, outer planets slowest, and the Moon travels around the moving Earth.
- The camera includes subtle pointer parallax. Device pixel ratio is capped, point count is small, and the frame loop pauses when the tab is hidden or the orrery is offscreen.
- Under `prefers-reduced-motion: reduce`, motion is not started. Failed WebGL initialization, missing CDN, or lost graphics context never hides the fact panel, theme buttons or résumé.
- Each Sun/planet/Moon selection updates the body fact card and CSS theme variables. All theme palette foreground/background pairs are tested for at least **4.5:1** contrast.

### General knowledge quiz design

- Player selects **Easy**, **Medium**, or **Hard**. Each level contains 15 distinct four-choice questions drawn from a separate data module.
- Questions are Fisher–Yates shuffled at the start of each run; the opening questions are explicitly changed for consecutive runs of the same difficulty. Each question appears at most once **within one game session**.
- An answer immediately locks and displays whether it was correct plus a brief explanation. The score increases only on a correct answer.
- Players can answer 10 questions, stop at any time, replay a fresh subset, or switch difficulty. Replaying starts a new session; extending a bank is straightforward.

## Tests

Node 20+ is recommended (no packages to install):

```bash
node --test *.test.mjs
```

Checks cover body count and facts, orbit geometry, theme contrast ratios for every body, question bank validity and breadth, deterministic shuffle and no-repeat logic, feedback/score/stop, static assets, fallback/error-handling declarations, and Vercel configuration.

Optional browser smoke tests:

```bash
python -m pip install playwright
python -m playwright install chromium
python smoke_browser.py
```

The smoke test loads modules into an isolated browser page and intentionally exercises the WebGL-unavailable path. It clicks planets/themes, starts a quiz, answers questions, verifies the design lab and WhatsApp link, and checks mobile overflow. The bundled script assumes `/usr/bin/chromium` on Linux; modify `executable_path` to use your local browser on other platforms.

## Customize

- **Portfolio copy:** edit `index.html` directly. Search for `id="work"`, `id="experience"`, `id="skills"`, `id="about"`, and `id="contact"`. Resume-linked information is sourced from the user's uploaded PDF; do not replace measurements with invented ones.
- **WhatsApp:** in `index.html`, search for `https://wa.me/971521133465` and edit the country-code number and prefilled message as necessary.
- **Solar bodies/facts:** update `SOLAR_BODIES` in `planets.mjs`. Data includes accessible name, description, fact, colors, size and scaled orbit period. Facts are short paraphrases of NASA's Solar System Exploration resources.
- **Theme colors:** adjust `accent` and `background` in `planets.mjs`; rerun the contrast tests. Every theme keeps light text over a dark background.
- **Quiz topics:** add an entry to the appropriate array in `question-bank.mjs` as `[id, topic, question, [option1,option2,option3,option4], correctOption, explanation]`. Keep IDs unique, answer options distinct, and the correct answer included in the options.
- **Resume:** replace `Ahmed-Osama-Resume.pdf` with a file using the same filename.

## External resources and factual sources

- **Three.js** 0.187.0 (MIT license), pinned ESM CDN delivery: https://github.com/mrdoob/three.js . The library is **optional at runtime**; the portfolio and SVG/DOM orbital controls remain functional when the CDN cannot be reached. No other runtime scripts, trackers or web-font network requests are used.
- Solar-system descriptions and facts verified against **NASA Science**: https://science.nasa.gov/solar-system/solar-system-facts/ and https://science.nasa.gov/planetary-science/focus-areas/ .

## Graceful degradation and accessibility

The critical résumé is static HTML, so it remains readable if scripts fail. Planet selection uses real buttons with names and `aria-pressed`; the keyboard-accessible selector supports Arrow Left/Right, Home and End. Quiz answers use real buttons, with status announcements for feedback. Focus styles, skip navigation and reduced-motion preferences are respected throughout. No game gates access to contact details.
