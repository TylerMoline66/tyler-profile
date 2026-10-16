# Tyler Moline — Portfolio

3D planet portfolio built with React, Vite, and Three.js.

**Live:** https://tylermoline66.github.io/tyler-profile/

## Local development

```bash
npm install
npm run dev
```

## GitHub Pages

The production build lives in `docs/` (committed). The root `index.html` redirects there so GitHub Pages works when the source is **Deploy from a branch → main → / (root)**.

After changing the site:

```bash
npm run build
git add docs index.html
git commit -m "Update Pages build"
git push
```

### Pages settings

https://github.com/TylerMoline66/tyler-profile/settings/pages

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)** — or **/docs** if you prefer skipping the redirect
