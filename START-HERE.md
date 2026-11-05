# START HERE — Do these steps in order (Windows + GitHub + Vercel)

## Stage 1: Extract and prepare the files

1. Download `AHMED-PORTFOLIO-GITHUB-READY.zip`.
2. Right-click the ZIP in Downloads and choose **Extract All...**.
3. Open the extracted folder. It should contain `index.html`, `styles.css`, `app.mjs`, `game.mjs`, `storage.mjs`, `Ahmed-Osama-Resume.pdf`, and other loose files — **NOT** another nested project folder.
4. Important: Never upload the ZIP itself to GitHub; upload every **individual extracted file**.

## Stage 2: Create a fresh GitHub repository

1. Open https://github.com/new and sign in.
2. Repository name: `ahmed-stellar-portfolio` (or any available name).
3. Choose **Public** if you want recruiters to inspect the code; **Private** also works if Vercel has permission.
4. **DO NOT CHECK** “Add a README”, “Add .gitignore”, or “Choose a license”.
5. Select **Create repository**.
6. In the new empty repository page, click the link **“uploading an existing file”**.
7. In File Explorer, open the folder from step 1, press **Ctrl + A** to select every file, then **drag all selected files** into the GitHub upload drop zone. Every file is in ONE folder to prevent missing subfolders.
8. Wait for files to finish uploading. Enter commit message `Initial complete portfolio website` then click **Commit changes**.
9. On the repository Code tab, VERIFY that `index.html`, `styles.css`, `app.mjs`, `game.mjs`, `storage.mjs`, `Ahmed-Osama-Resume.pdf`, and `vercel.json` are individually visible. Click `index.html` and ensure it shows HTML text. No folder should be needed to find it.

**STOP HERE and verify before visiting Vercel.** If these files are not visible, upload the missing files before proceeding.

## Stage 3: Deploy from GitHub to Vercel

1. Visit https://vercel.com/new (sign into the correct Vercel account).
2. Under Git repository imports, find your new repo `ahmed-stellar-portfolio`. Choose **Import**. Allow Vercel access to that GitHub repository if prompted.
3. Choose a project name that is available (for example, `ahmed-stellar-site`).
4. Confirm these settings:
   * **Framework Preset:** `Other`
   * **Root Directory:** `./` (the root of the GitHub repo)
   * **Build Command:** leave **blank**. If it says `npm run build`, enable Override and clear the text.
   * **Output Directory:** `.` (a single period, the site files at the repository root). `vercel.json` also specifies this.
   * **Install Command:** leave blank/default; no dependencies exist.
   * **Environment Variables:** none.
5. Click **Deploy**. This is a *static deployment* — no npm build should run.
6. Wait until the Vercel project displays **Ready** and click **Visit**.

## Stage 4: Verify the website

Using the new Vercel URL, verify:

* `/` shows the full space-themed site, not the repository, a blank page, or 404.
* `/styles.css` shows CSS text beginning with `:root`.
* `/app.mjs` shows JavaScript text (its first two import lines use `./game.mjs` and `./storage.mjs`).
* `/game.mjs` shows JavaScript game logic.
* `/Ahmed-Osama-Resume.pdf` displays/downloads the résumé.
* On the page, test **Explore my work**, project filters, **Ctrl+K**, mobile menu and Signal Decoder game.
* Try a 375px-wide mobile viewport in Chrome's device toolbar.

If CSS or PDF returns 404, check the GitHub repository Code tab and the Vercel Root/Output Directory settings. The missing file must exist at the root and output must be `.`.

## Stage 5: Updating later

Edit a file on GitHub → Commit changes → Vercel automatically deploys the latest commit. `index.html` is the single source of truth for all résumé content; no build step is required.

## Common pitfalls

| Symptom | Reason | Fix |
| --- | --- | --- |
| Vercel tries `npm run build` | Old settings or old ZIP | This ZIP has NO package.json or build script. Framework Other; Build Command blank. |
| `index.html` 404 | Root file missing or nested folder | Put `index.html` directly at repository root; Output Directory `.`. |
| Design looks plain | `styles.css` missing or wrong output path | Confirm https://YOUR-SITE.vercel.app/styles.css loads. |
| Interactive elements fail | JS modules missing | Check `app.mjs`, `game.mjs`, `storage.mjs` exist at root. |
| Résumé button 404 | PDF absent or case mismatch | File must be `Ahmed-Osama-Resume.pdf` exactly. |
| Project name exists | The name is taken | Pick a different project name; URL changes accordingly. |

NOTE: The ZIP file is an archive used to transfer all source files at once. GitHub upload should contain its **extracted files**, not the archive itself.
