# Hosting HealthyWAI2 on a Public Domain

HealthyWAI2 is an Expo web app. You build a **static bundle** once, then deploy it to any static host or use Expo’s hosting.

---

## 1. Build the web bundle (do this first)

From the project root:

```bash
cd healthywai2
npx expo export --platform web
```

This creates a **`dist`** folder with the production web app. Use this folder for every option below.

---

## Option A: EAS Hosting (Expo’s own hosting)

**Best for:** Staying inside the Expo ecosystem, simple deploys, optional custom domain (paid).

**Steps:**

1. **Install EAS CLI and log in**
   ```bash
   npm install -g eas-cli
   eas login
   ```
   Create a free Expo account at [expo.dev](https://expo.dev) if needed.

2. **Configure EAS (first time only)**
   ```bash
   eas build:configure
   ```
   You can accept defaults. For web-only you mainly need the project linked.

3. **Export and deploy**
   ```bash
   npx expo export --platform web
   eas deploy
   ```
   First run will ask for a **preview subdomain** (e.g. `healthywai2`). You get a URL like:
   `https://healthywai2--&lt;id&gt;.expo.app`

4. **Production URL**
   ```bash
   eas deploy --prod
   ```
   Use the production URL they give you as your “public” site.

5. **Custom domain (paid)**  
   In [expo.dev](https://expo.dev) → your project → **Hosting** → **Custom domain**. Add your domain and follow their DNS instructions.

**Docs:** [Deploy web](https://docs.expo.dev/deploy/web/), [EAS Hosting](https://docs.expo.dev/eas/hosting/introduction)

---

## Option B: Vercel

**Best for:** Free tier, GitHub/GitLab integration, automatic deploys on push.

**Steps:**

1. Push `healthywai2` to a Git repo (e.g. GitHub).

2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.

3. **Project settings:**
   - **Root Directory:** `healthywai2` (if the app lives in a subfolder of the repo).
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Deploy. Vercel gives you a URL like `https://healthywai2-xxx.vercel.app`.

5. **Custom domain:** Project → **Settings** → **Domains** → add your domain and set the DNS records they show.

---

## Option C: Netlify

**Best for:** Simple UI, drag-and-drop or Git-based deploys, free tier.

**Steps:**

1. **Build locally (or use Netlify build):**
   ```bash
   npx expo export --platform web
   ```

2. **Deploy:**
   - **Drag-and-drop:** Go to [app.netlify.com](https://app.netlify.com) → **Sites** → **Add new site** → **Deploy manually** → drag the **`dist`** folder.
   - **Git:** Connect your repo, set:
     - **Base directory:** `healthywai2`
     - **Build command:** `npx expo export --platform web`
     - **Publish directory:** `healthywai2/dist`

3. Netlify gives a URL like `https://random-name.netlify.app`.

4. **Custom domain:** Site **Domain settings** → **Add custom domain** → follow DNS instructions.

---

## Option D: Cloudflare Pages

**Best for:** Free tier, global CDN, simple Git or upload deploy.

**Steps:**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (or **Upload assets**).

2. **If using Git:**
   - Select repo and branch.
   - **Build configuration:**
     - **Build command:** `cd healthywai2 && npm install && npx expo export --platform web`
     - **Build output directory:** `dist` (often you set “Root directory” to `healthywai2` and output to `dist`).

3. **If uploading:** Run `npx expo export --platform web` locally, then **Upload** the contents of **`dist`**.

4. You get a URL like `https://healthywai2.pages.dev`.

5. **Custom domain:** Pages project → **Custom domains** → add domain and update DNS.

---

## Option E: GitHub Pages

**Best for:** Free, repo and site in one place.

**Steps:**

1. In `healthywai2`, add to `package.json` scripts:
   ```json
   "deploy:web": "npx expo export --platform web"
   ```

2. Build:
   ```bash
   npx expo export --platform web
   ```

3. Use a GitHub Action or the `gh-pages` package to push the **`dist`** contents to a `gh-pages` branch (or to `main` in a `docs/` or root folder, depending on repo settings).

4. In GitHub: **Settings** → **Pages** → Source: **Deploy from a branch** → branch `gh-pages` (or chosen branch) → folder `/ (root)` (or where you put `dist` contents).

5. Site URL: `https://&lt;username&gt;.github.io/&lt;repo&gt;/` (or custom domain in Pages settings).

---

## Summary

| Option           | Free tier | Custom domain     | Ease of setup |
|------------------|-----------|-------------------|----------------|
| **EAS Hosting**  | Yes       | Yes (paid plan)   | Easy           |
| **Vercel**       | Yes       | Yes               | Easy           |
| **Netlify**      | Yes       | Yes               | Easy           |
| **Cloudflare Pages** | Yes   | Yes               | Easy           |
| **GitHub Pages** | Yes       | Yes (optional)    | Medium         |

**Recommended:** Use **Vercel** or **Netlify** if you want a custom domain and zero cost; use **EAS Hosting** if you want everything in the Expo dashboard and may add mobile builds later.

**Always run** `npx expo export --platform web` before deploying (or rely on the host’s build step). The deployable output is always the **`dist`** directory.
