# Reading notes design system

The reading notes live at `/notes` as static pages in `public/notes`. They use their own small design system and do not depend on Tailwind or the rest of the site. Next.js rewrites in `next.config.mjs` give them clean URLs.

```
public/notes/
  index.html                         library (all books)
  assets/
    notes.css                        tokens, layout, type, figure frame, components
    notes.js                         runtime: chrome, theme, lift, scroll spy, builders
    library.js                       data: books and chapters, the single source of truth
  <book-slug>/
    index.html                       book contents
    ch<n>/
      index.html                     chapter content (HTML)
      figures.js                     chapter figures (JavaScript)
```

URLs: `/notes`, `/notes/<book-slug>`, `/notes/<book-slug>/ch<n>`.

## Principles

1. Hairline drawing. Strokes are 1.4 units (`--hair`), fills are faint tints, labels are mono. Figures are thin line drawings on a drafting-paper ground.
2. One accent, one warning color. Green (`--acc`) marks the subject, orange (`--warn`) marks cost, delay or the thing to watch. Nothing else is colored.
3. A figure earns its place by showing a mechanism the reader can operate: a slider, a drag, a toggle, a replay. Static figures are for flows and maps.
4. The page is complete at rest. Lines draw on scroll only through CSS scroll-driven animation, so unsupported browsers and print show finished figures. The first screen never depends on an animation.
5. Honest labels. Every figure caption says `illustrative` when numbers are made up and `synthesis` when the arrangement is mine and not the book's.
6. Paraphrase, do not copy. Notes restate ideas in my own words and every figure is redrawn. No book figures, no long quotes.
7. Writing style: plain, professional sentences. No emojis, no em dashes, no decorative formatting.

## Tokens

Defined in `notes.css` under `:root`, redefined for dark under `prefers-color-scheme` and `[data-theme="dark"]`.

| Token | Role |
| --- | --- |
| `--bg`, `--panel` | page ground, figure panel |
| `--ink`, `--ink2` | text and strokes, muted text |
| `--line`, `--line2` | hairline strokes, faint rules |
| `--acc`, `--acc-ink`, `--acc-soft` | accent stroke, accent text, accent tint |
| `--warn`, `--warn-ink`, `--warn-soft` | warning stroke, text, tint |
| `--fd`, `--fb`, `--fm` | display (Instrument Serif), body (Instrument Sans), mono (JetBrains Mono) |
| `--hair` | stroke width for drawings |

Use `--acc-ink` and `--warn-ink` for text, never `--acc` or `--warn`, which are for strokes and fills. Do not use literal colors in components.

## Type

- Display: Instrument Serif, used for the page title, section titles and big numbers.
- Body: Instrument Sans, 17px, 1.65 line height, 64 character measure.
- Mono: JetBrains Mono for labels, captions, figure text and controls, uppercase with letter spacing for captions.
- Section structure uses the book's real numbering (`1.2`, `1.2.1`) as a mono kicker. Numbers appear only when they come from the book.

## Page anatomy (chapter)

```html
<body data-page="chapter" data-book="<slug>" data-chapter="<n>">
<header id="notes-top"></header>          <!-- filled by notes.js -->
<div class="shell">
  <aside class="rail" id="notes-rail"></aside>   <!-- filled by notes.js -->
  <main>
    <section class="sec" id="overview" data-nav="Overview" data-chip="Overview">...</section>
    <section class="sec" id="s11" data-nav="1.1 Title" data-chip="1.1">...</section>
  </main>
</div>
<footer id="notes-foot"></footer>          <!-- filled by notes.js -->
<script src="/notes/assets/library.js"></script>
<script src="/notes/assets/notes.js"></script>
<script src="/notes/<slug>/ch<n>/figures.js"></script>
```

Each `main > section` with `data-nav` becomes a rail link and a phone chip. `data-chip` is the short label. The top bar, rail, pager and footer text come from `library.js`, so a chapter page only contains content.

Every page also carries the small inline script in `<head>` that sets `data-theme` before first paint, so there is no flash. Copy it from an existing page.

## Components (CSS classes)

| Class | Use |
| --- | --- |
| `.eyebrow`, `.display`, `.lede` | hero block |
| `.sec`, `.kick`, `.sec-h`, `.sub-h` | section, mono kicker, section title, subsection title |
| `.fig`, `.fig-cap`, `.scroll` | dashed figure frame with corner crosshairs, caption, horizontal scroller for wide SVG |
| `.cards`, `.card`, `.twocol` | grids of small notes, optional `.lift` |
| `.tbl`, `.tblwrap` | hairline table |
| `.read` (`.warn`) | readout panel under a figure, `h4` label plus `p` |
| `.btn`, `[aria-pressed]` | segmented toggles and presets |
| `.ctl`, `.stats`, `.bars` | sliders, stat tiles, horizontal meters |
| `.fcs`, `.fc` | recall flashcards |
| `.toc` | contents list used by the library and book pages |

SVG classes: `.ln` (stroke), `.ln.soft`, `.ln.thin`, `.ln.a`, `.ln.w`, `.ln.dash`; `.t`, `.tm`, `.tb`, `.ts` for text; `.ta`, `.tw` for accent and warning text; `.fa`, `.fw` for tints; `.node` (with `.acc`, `.warn`, `.on`) for boxes.

Motion classes: `.draw` plus `pathLength="1"` on a path draws it on scroll, with `style="--s:8%"` to stagger. `.lift` makes an element rise toward the pointer. Both respect reduced motion and the Lift slider.

## Figure rules

- SVG `viewBox` is 720 wide. Wide figures sit in `.scroll`, which gives them `min-width: 640px` and scrolls sideways on phones. Use class `fit` on the `svg` and enlarge its text in a `max-width: 640px` rule only when the figure must fit a phone (see the triangle).
- Every interactive figure needs a non-pointer path: a slider, buttons or a keyboard-focusable node.
- Put the readout in a `.read` panel with `aria-live="polite"`.
- Do not put `.draw` on a figure in the first screen of a chapter.
- Each figure id is `f-<name>` and its caption starts with `Fig. <letter>`.

## Builders in notes.js

Register a figure with `Notes.figure(name, fn)`. A failing figure logs to the console and never breaks the page.

| Function | Purpose |
| --- | --- |
| `Notes.drag(svg, handler, {hover})` | pointer drag surface, optional mouse hover |
| `Notes.tween(from, to, ms, cb)` | animate an array of numbers, returns a cancel function |
| `Notes.radial(svg, {items, read, list, center})` | radial question map with a readout and a phone list |
| `Notes.mindmap(svg, tree, rootLabel)` | left to right mind map from `[[branch, [leaf, ...]], ...]` |
| `Notes.flashcards(el, cards)` | question and answer cards from `[[q, a], ...]` |
| `Notes.se`, `Notes.sp`, `Notes.clamp`, `Notes.setPressed` | SVG element, pointer to SVG point, clamp, toggle group state |

## Adding a chapter

1. In `library.js`, set the chapter `status` to `'live'` and add `pages`.
2. Create `public/notes/<slug>/ch<n>/index.html` from chapter 1, change the `<title>`, description, canonical and `data-chapter`.
3. Write the sections. Keep the sequence: overview and hero figure, the chapter's sections with one operable figure each, a chapter map (`Notes.mindmap`), recall cards (`Notes.flashcards`).
4. Put figure code in `figures.js` using `Notes.figure`.
5. Add the URL to `src/app/sitemap.ts`.
6. Check desktop and phone widths in light and dark, and confirm there are no console errors and no horizontal page scroll.

## Adding a book

Add an entry to `library.js`, copy `public/notes/inference-engineering/index.html` to `public/notes/<slug>/index.html`, and change its text and `data-book`.
