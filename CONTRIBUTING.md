# Contributing

Thanks for wanting to make the page better. Fixes, accessibility and performance work, and ideas for the art are all welcome.

## Setup

You need Node 20 or later.

```sh
git clone https://github.com/bas3line/nodeny
cd nodeny
npm install
npm run dev        # http://localhost:5173
```

The intro plays once per browser session. To see it again, open a new window, or run `sessionStorage.removeItem('nodeny:intro')` in the console.

## How it fits together

- `src/App.tsx`: the page, top to bottom, in sections.
- `src/site/`: one file per section (`Hero.tsx`, `RefusalGrid.tsx`, `Footer.tsx`, ...), plus what they share:
  - `hooks.ts`: `useMedia`, `useReducedMotion`, `useInView`.
  - `shared.tsx`: the mark and wordmark, buttons, section heads, the coin icon, and `Redact`, the redaction bars over headings.
  - `Dissolve.tsx`, `Halftone.tsx`: images drawn on a canvas as dots. `Odometer.tsx`, `Reveal.tsx`, `Strike.tsx`: the rolling numbers, the answer that types in from behind bars, and the hand-drawn strike.
  - `logos.ts`: the model and app marks.
- `src/index.css`: the palette, as CSS variables and Tailwind tokens, and the few classes Tailwind can't express.
- `public/art/`: the prepared museum images. `src/assets/`: the logos and icons, bundled.

## The rules the page follows

- **One palette.** Paper, ink, the ultramarine ramp from `--brand-900` to `--brand-300`, and `--marker` yellow as the one warm note. Use the tokens (`bg-brand`, `text-ink-2`, `text-marker`), not new hex values.
- **Art is public domain, and credited on the page.** New museum images come from an open-access collection under CC0 (The Met's is a good start), with the object, the artist or workshop and the date in a caption or the footer credit, and the object's link in the README.
- **Prepare images before they land in `public/art/`.** Crop to what's shown, size to at most twice the largest size it's drawn at, and save as WebP (or PNG for the canvas sources). The footer figures are about 80 KB each; stay near that.
- **Reduced motion is respected.** Anything that moves on its own checks `useReducedMotion()` and holds still: the intro is skipped, canvases draw their last frame, counters jump.
- **No new runtime dependencies without a reason.** The art is canvas 2D and CSS. If something needs a library, say why in the pull request.
- **Copy says what things are.** Plain verbs, sentence case, no filler. The product's numbers on the page are placeholders until it launches; keep them consistent with each other.

## Checks

```sh
npm run check      # typecheck, lint, production build
```

CI runs the same on every pull request. Before you open one, also look at your change in a browser at a phone width (390 px) and a laptop one (1440 px), and with reduced motion on (in Chrome's DevTools, Rendering, "Emulate CSS media feature prefers-reduced-motion").

## Pull requests

Keep each one to one change, and say what it changes, how you checked it, and include a screenshot for anything visual. Commits in the imperative ("Add the hydria scene"), one idea each.
