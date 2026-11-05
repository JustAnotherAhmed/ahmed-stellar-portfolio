# Start here — Ahmed's Stellar Portfolio v3

This ZIP contains the **whole site and tests**, with **no install/build step**.

1. Unzip, keeping all files at the root of one directory.
2. Preview locally with `python -m http.server 8000`, then open `http://localhost:8000`.
3. Run all unit/structural tests with `node --test *.test.mjs` (Node 20+).
4. Update the contents of the existing GitHub repository with these top-level files.
5. Leave Vercel as **Framework Other; Root `./`; Build blank; Output `.`**. Git pushes to `main` deploy automatically.
6. Test Sun, Earth, Moon, Mars and Neptune selection, quiz Easy/Medium/Hard, reduced-motion mode, WhatsApp CTA and résumé download.

The Three.js part uses a pinned external CDN. If that source is blocked or WebGL2 is disabled, you should still see the 2D orbits, planet buttons, themes and explanations. This is intentional, not a broken website.

Architecture, editing guide, fact sources, test commands and a production checklist are in `README.md`.
