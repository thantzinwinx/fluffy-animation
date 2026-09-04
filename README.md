# Fluffy Hugs

Canvas landing animation. Scroll / wheel / touch / keyboard to move between scenes.

## Features

- **Canvas animation** - all scenes drawn on HTML5 canvas, smooth and fast.
- **Scroll driven scenes** - wheel, touch, and keyboard move between scenes.
- **GSAP transitions** - smooth scene transitions and hover animations.
- **Loading screen** - loading screen before the main animation shows.

## Setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 (or the port shown in terminal).

```bash
pnpm build
pnpm start
pnpm lint
pnpm exec tsc --noEmit
```

## 3 scenes implemented

1. **Loading Screen** - breathing logo image, hides once all canvas images are loaded.
2. **Hero** - human character bouncing in the middle, crowd of crew characters scattered around.
3. **Floating Human scene (next)** - human rotates to horizontal, crowd drops away, bubbles + big logo + tagline fade in.

Move between Hero and Floating Human with wheel, touch swipe, or arrow/page/space keys.

## Folder structure

```
fluffy-animation/
├── app/
│   ├── components/
│   │   ├── Canvas.tsx              # main canvas component
│   │   ├── canvasAssets.ts         # image loading
│   │   ├── canvasState.ts          # animation state
│   │   ├── useCanvasInput.ts       # wheel/touch/keyboard input
│   │   ├── useCanvasDraw.ts        # draw loop, resize
│   │   ├── canvasLayout.ts         # responsive sizing
│   │   ├── canvasRenderPolicy.ts   # pause when tab hidden
│   │   ├── canvasSurface.ts        # canvas resize helper
│   │   ├── sceneNavigation.ts      # scene target helper
│   │   ├── SiteChrome.tsx          # header + footer
│   │   └── Loader.tsx              # splash screen
│   ├── layout.tsx                  # root layout, fonts
│   ├── page.tsx                    # page wiring
│   └── globals.css                 # global styles
├── lib/
│   ├── gsap.ts                     # gsap setup
│   ├── useCanvasAssets.ts          # asset loading hook
│   └── useReducedMotion.ts         # motion preference hook
├── public/
│   └── assets/                     # images
└── package.json
```

## Libraries and why

- **Next.js** - base of the project, app router.
- **React** - components.
- **Tailwind CSS v4** - all styling (header, footer, loader). No separate CSS files.
- **GSAP** - scene transition timeline (crowd drop, character rotate, bubble/logo fade) and footer icon hover scale. Chosen for easy timeline sequencing with offsets, harder to do cleanly with plain CSS.

## Animation / scroll / responsiveness

- Everything in the Hero/Floating scenes is drawn on canvas with `requestAnimationFrame`, not DOM elements. Gives more control for the scattered crowd and the looping bubble background.
- No real page scroll. Wheel/touch/keyboard events call `navigate()`, which runs a GSAP timeline on a small state object (`crowdDrop`, `characterProgress`, `nextAlpha`, `logoAlpha`) from 0 to 1. The draw loop reads this state every frame.
- Canvas size and positions come from `window.innerWidth/innerHeight` and a `compact` flag (`width < 768`). Sizes blend smoothly between mobile and desktop instead of jumping at a breakpoint. Header/footer use Tailwind `clamp()`/`vw` classes, with extra overrides under 375px.

## Performance notes

- Canvas DPR capped at 1.35 mobile / 1.75 desktop.
- Draw loop throttled to ~60fps.
- Canvas stops drawing when the tab is hidden.
- Resize only recomputes if width/height/dpr/compact actually changed.
- Canvas wrapped in `overflow-hidden` + `contain: strict` so it can't grow the page layout.
- Images preload before the loader hides (onload and onerror both count as ready).
- `prefers-reduced-motion` respected - bounce/scroll freezes, scene transitions jump instantly.

## Assumptions

- Footer social icons and "View collection" button don't link anywhere yet - no real destination pages.
- pnpm as package manager (packageManager field + lockfile already set).
- Vercel as deploy target.
