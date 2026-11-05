# Ahmed Osama — Stellar Portfolio (GitHub-ready, no build required)

This archive is the complete website. **All files are at the top level of this ZIP.**
It is a self-contained, accessible, SEO-friendly HTML/CSS/JavaScript site with no external dependencies, no backend, and no build step.

## What is included

| File | Purpose |
| --- | --- |
| `index.html` | The whole résumé content and portfolio HTML — **the homepage** |
| `styles.css` | Responsive styling, cosmic layout, reduced-motion rules |
| `app.mjs` | Navigation, filters, command palette, game UI, copy email |
| `game.mjs` | Tested game rules and state machine |
| `storage.mjs` | Safe achievement persistence |
| `Ahmed-Osama-Resume.pdf` | The actual uploaded résumé used by the download button |
| `favicon.svg` | Browser tab icon |
| `og-image.png` | Social link preview image |
| `robots.txt` | Search engine crawl guidance |
| `vercel.json` | Vercel static deployment output and security headers |
| `portfolio.test.mjs` | Automated tests for page files, paths, résumé, and interactions |
| `README.md` | This documentation |
| `START-HERE.md` | Complete beginner-friendly GitHub → Vercel instructions |

## Most important: This site has NO build process

* **Do not use** old ZIP files with `package.json`, `scripts/build.mjs`, or `dist/`.
* **Do not select** `npm run build` in Vercel. No `npm install` is needed.
* Vercel: Framework **Other**, Root Directory **`./`**, Build Command **blank** (enable override only if Vercel auto-populates one), Output Directory **`.`** (project root).
* **All files in this ZIP must be uploaded to the root of one GitHub repository.** Upload the extracted FILES, not the ZIP file.

## Edit résumé, projects and contact

Everything recruiters read is already in the static `index.html`, so it also works if JavaScript is disabled.
Open `index.html` in the GitHub editor or your code editor and search for the text to change:

* `Hey, I'm Ahmed Osama` — intro; `hero-title` — headline.
* `id="work"` — project cards and case studies; update titles, descriptions, outcomes, tags.
* `id="experience"` — work history.
* `id="skills"` — technologies and capabilities.
* `id="about"` — degree, certifications and languages.
* `id="contact"` — email, phone, location.
* Change `Ahmed-Osama-Resume.pdf` **only by replacing the PDF with one using the exact same filename**, or update the corresponding link in `index.html`.
* You can add real GitHub, LinkedIn or project-demo URLs later. No unverified social/profile links were invented.
* `og-image.png` can be replaced with a branded preview image of the same filename.

**Only use accurate claims that you can substantiate.** Existing portfolio content comes from the attached résumé. Project case studies were written from the résumé bullets (no invented public URLs).

## Testing

You can test with Node.js 20+ without installing packages:

```sh
node --test portfolio.test.mjs
```

Or preview locally using built-in Python (if installed):

```sh
python -m http.server 8000
```

Open http://localhost:8000/ . Do not double-click `index.html` to test the module script, because file:// module security rules may block JavaScript.

The portfolio content loads without JavaScript; the menu, filters, quick navigation, copy-email interaction and game need JavaScript enabled.

## SEO & accessibility

* Semantic landmarks/headings, skip navigation, focus indicators, contrast-conscious styling and reduced-motion support.
* No remote fonts, trackers or image dependencies.
* Native browser `<dialog>` quick-jump UI.
* The résumé is real, downloadable, and included in the GitHub repository.
* Game logic, storage fallbacks, structure, link targets, and asset paths are tested.

## Support and maintenance

See `START-HERE.md` for the exact, safe beginner deployment workflow. After GitHub is connected to Vercel, editing/committing files normally creates new deployments automatically.
