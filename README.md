# Heurystics — website

AI deployment consultancy site, built with [Astro](https://astro.build).

Case studies live as Markdown files in `src/content/case-studies/` — each one becomes
a page automatically at `/work/<filename>`. To add a new case study, add a new `.md`
file there following the schema in `src/content/config.ts`.

## Local development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs to `dist/`, deployed via Firebase Hosting.

Live at [heurystics.com](https://heurystics.com).
