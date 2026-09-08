import React, { useEffect, useMemo, useState } from 'react';

/**
 * TEMPORARY — a panel for trying typefaces on the live page.
 *
 * Not meant to ship: it overrides styling with !important and pulls fonts from Google
 * at runtime. Delete this file, its mount in Homepage, and the data-font attributes
 * once the choice is made.
 */

const STORAGE_KEY = 'simonstorp_fontlab_v2';

/** Faces already in play on the site, plus a few worth comparing them against. */
const FONTS = [
  { label: 'Lato (nuvarande brödtext)', stack: "'Lato', sans-serif", google: 'Lato' },
  { label: 'Heebo (nuvarande nyheter)', stack: "'Heebo', sans-serif", google: 'Heebo' },
  { label: 'IBM Plex Sans (nuvarande rubrik)', stack: "'IBM Plex Sans', sans-serif", google: 'IBM+Plex+Sans' },
  { label: 'Inter', stack: "'Inter', sans-serif", google: 'Inter' },
  { label: 'Work Sans', stack: "'Work Sans', sans-serif", google: 'Work+Sans' },
  { label: 'Karla', stack: "'Karla', sans-serif", google: 'Karla' },
  { label: 'Public Sans', stack: "'Public Sans', sans-serif", google: 'Public+Sans' },
  { label: 'Space Grotesk', stack: "'Space Grotesk', sans-serif", google: 'Space+Grotesk' },
  { label: 'Source Serif 4', stack: "'Source Serif 4', serif", google: 'Source+Serif+4' },
  { label: 'EB Garamond', stack: "'EB Garamond', serif", google: 'EB+Garamond' },
  { label: 'Libre Baskerville', stack: "'Libre Baskerville', serif", google: 'Libre+Baskerville' },
  { label: 'Fraunces', stack: "'Fraunces', serif", google: 'Fraunces' },
  { label: 'Instrument Serif', stack: "'Instrument Serif', serif", google: 'Instrument+Serif' },
];

const WEIGHTS = [200, 300, 400, 500, 600, 700];

const KARLA = "'Karla', sans-serif";
const SOURCE_SERIF = "'Source Serif 4', serif";
const LATO = "'Lato', sans-serif";

/**
 * Each scope maps to the data-font marks placed on the page, and starts from what the
 * page actually ships now — so opening the panel changes nothing until a control moves.
 */
const SCOPES = [
  { key: 'hero', label: 'Rubrik på bilden', min: 24, max: 96, font: SOURCE_SERIF, weight: 400, size: 65, leading: 0.85 },
  { key: 'newstitle', label: 'Nyhetsrubriker', min: 14, max: 48, font: KARLA, weight: 400, size: 26, leading: 1.1 },
  { key: 'herobody', label: 'Brödtext på bilden', min: 11, max: 26, font: SOURCE_SERIF, weight: 300, size: 14, leading: 1.65 },
  { key: 'newsbody', label: 'Brödtext i nyheter', min: 11, max: 26, font: SOURCE_SERIF, weight: 300, size: 14, leading: 1.65 },
  { key: 'stamp', label: 'Datumstämpel', min: 16, max: 64, font: LATO, weight: 400, size: 32, leading: 1 },
  { key: 'menu', label: 'Menyn', min: 10, max: 24, font: KARLA, weight: 300, size: 15, leading: 1.25 },
];

/** The news thumbnail, sized and shaped from the same panel. */
const IMAGE_CONTROLS = [
  { key: 'width', label: 'Bredd', min: 80, max: 340, step: 2, unit: 'px', value: 124 },
  { key: 'height', label: 'Höjd', min: 60, max: 300, step: 2, unit: 'px', value: 192 },
  { key: 'radius', label: 'Hörnradie', min: 0, max: 40, step: 1, unit: 'px', value: 3 },
  { key: 'mat', label: 'Passepartout', min: 0, max: 28, step: 1, unit: 'px', value: 0 },
];

/** The desktop nav row: how tall each item is and how much room it claims. */
const MENU_CONTROLS = [
  { key: 'height', label: 'Höjd', min: 32, max: 112, step: 1, unit: 'px', value: 44 },
  { key: 'minWidth', label: 'Minbredd', min: 40, max: 200, step: 2, unit: 'px', value: 98 },
  { key: 'padding', label: 'Sidpadd.', min: 0, max: 48, step: 1, unit: 'px', value: 37 },
];

/** What sits behind the hero caption: the veil, the softening and the shade. */
const HERO_CONTROLS = [
  { key: 'veil', varName: '--hero-veil', label: 'Slöja', min: 0, max: 0.4, step: 0.01, unit: '', value: 0.1 },
  { key: 'blur', varName: '--hero-blur', label: 'Oskärpa', min: 0, max: 24, step: 1, unit: 'px', value: 5 },
  { key: 'shade', varName: '--hero-shade', label: 'Mörker', min: 0, max: 0.8, step: 0.02, unit: '', value: 0.4 },
  { key: 'maskSoft', varName: '--hero-mask-soft', label: 'Mjukhet', min: 4, max: 70, step: 1, unit: '', value: 26 },
];

/** EXPERIMENT — the light leaking out around the picture. */
const SSS_CONTROLS = [
  { key: 'strength', varName: '--sss-strength', label: 'Styrka', min: 0, max: 2.5, step: 0.05, unit: '×', value: 1 },
  { key: 'spread', varName: '--sss-spread', label: 'Spridning', min: 0.2, max: 3, step: 0.05, unit: '×', value: 1 },
  { key: 'contrast', varName: '--sss-contrast', label: 'Tröskel', min: 0.5, max: 2.5, step: 0.05, unit: '×', value: 1 },
  { key: 'brightness', varName: '--sss-brightness', label: 'Ljus', min: 0.5, max: 2.5, step: 0.05, unit: '×', value: 1 },
  { key: 'saturate', varName: '--sss-saturate', label: 'Mättnad', min: 0.4, max: 2.5, step: 0.05, unit: '×', value: 1 },
  { key: 'top', varName: '--sss-top', label: 'Uppåt', min: 0, max: 2, step: 0.02, unit: '', value: 0.34 },
  { key: 'side', varName: '--sss-side', label: 'I sidled', min: 0, max: 2.5, step: 0.05, unit: '', value: 0.8 },
  { key: 'bottom', varName: '--sss-bottom', label: 'Nedåt', min: 0, max: 3.5, step: 0.05, unit: '', value: 1.35 },
];

const IMAGE_KEY = 'newsimage';
const MENUITEM_KEY = 'menuitem';
const HERO_KEY = 'herobackdrop';
const SSS_KEY = 'scatter';

const TOUCHED_KEY = 'touched';

const defaults = () => ({
  ...Object.fromEntries(
    SCOPES.map((s) => [s.key, { font: s.font, weight: s.weight, size: s.size, leading: s.leading }])
  ),
  [IMAGE_KEY]: Object.fromEntries(IMAGE_CONTROLS.map((c) => [c.key, c.value])),
  [MENUITEM_KEY]: Object.fromEntries(MENU_CONTROLS.map((c) => [c.key, c.value])),
  [HERO_KEY]: Object.fromEntries(HERO_CONTROLS.map((c) => [c.key, c.value])),
  [SSS_KEY]: Object.fromEntries(SSS_CONTROLS.map((c) => [c.key, c.value])),
});

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const base = defaults();

    // Merge per scope, not just at the top level: settings saved before a control
    // existed would otherwise replace a whole scope and drop the new field.
    return {
      ...Object.fromEntries(
        Object.entries(base).map(([key, value]) => [key, { ...value, ...(saved[key] ?? {}) }])
      ),
      [TOUCHED_KEY]: Boolean(saved[TOUCHED_KEY]),
    };
  } catch (err) {
    return defaults();
  }
}

/** Reads back as the font name rather than the CSS stack, so the copied text is legible. */
function labelFor(stack) {
  return FONTS.find((f) => f.stack === stack)?.label ?? stack;
}

export default function FontLab() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(load);
  /* Until a control moves, the page styles itself: the panel's !important rules would
   * otherwise pin whatever was saved last and quietly outrank the real design. */
  const [touched, setTouched] = useState(() => Boolean(load()[TOUCHED_KEY]));
  const [copied, setCopied] = useState(false);

  /* Pull every face up front: switching should be instant, and this panel is temporary. */
  useEffect(() => {
    const id = 'fontlab-google';
    if (document.getElementById(id)) return;

    const families = FONTS.map((f) => `family=${f.google}:wght@200;300;400;500;600;700`).join('&');
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }, []);

  const css = useMemo(() => {
    const type = SCOPES.map((scope) => {
      const v = state[scope.key];
      return `[data-font="${scope.key}"], [data-font="${scope.key}"] * {
  font-family: ${v.font} !important;
  font-weight: ${v.weight} !important;
  font-size: ${v.size}px !important;
  line-height: ${v.leading} !important;
}`;
    }).join('\n');

    const img = state[IMAGE_KEY];
    const image = `[data-newsimg="wrap"] {
  padding: ${img.mat}px !important;
  border-radius: ${img.radius}px !important;
}
[data-newsimg="inner"] {
  width: ${img.width}px !important;
  height: ${img.height}px !important;
  border-radius: ${img.radius}px !important;
}`;

    const nav = state[MENUITEM_KEY];
    const menuitem = `[data-menuitem="shell"] {
  height: ${nav.height}px !important;
  min-width: ${nav.minWidth}px !important;
}
[data-menuitem="shell"] > p {
  padding-left: ${nav.padding}px !important;
  padding-right: ${nav.padding}px !important;
}`;

    /* Plain custom properties: the slider reads these, so a knob can reach values that
       live in JS (an SVG filter, a blend of layers) and not only in a stylesheet. */
    const vars = [
      ...HERO_CONTROLS.map((c) => `  ${c.varName}: ${state[HERO_KEY][c.key]};`),
      ...SSS_CONTROLS.map((c) => `  ${c.varName}: ${state[SSS_KEY][c.key]};`),
    ].join('\n');

    return touched ? `:root {\n${vars}\n}\n${type}\n${image}\n${menuitem}` : '';
  }, [state, touched]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, [TOUCHED_KEY]: touched }));
    } catch (err) {
      /* ignore */
    }
  }, [state, touched]);

  /* The hero mask's softness is baked into an SVG data URI, out of CSS's reach, so the
     slider is told to rebuild it whenever anything here moves. */
  useEffect(() => {
    window.dispatchEvent(new Event('fontlab:change'));
  }, [state, touched]);

  /* What to hand back: named faces and plain numbers, not internal keys. */
  const summary = useMemo(
    () =>
      JSON.stringify(
        Object.fromEntries([
          ...SCOPES.map((scope) => [
            scope.label,
            {
              typsnitt: labelFor(state[scope.key].font),
              css: state[scope.key].font,
              tjocklek: state[scope.key].weight,
              storlek: `${state[scope.key].size}px`,
              radavstånd: state[scope.key].leading,
            },
          ]),
          ['Nyhetsbild', state[IMAGE_KEY]],
          ['Menyrad', state[MENUITEM_KEY]],
          ['Rubrikbild', state[HERO_KEY]],
          ['Ljusläckage', state[SSS_KEY]],
        ]),
        null,
        2
      ),
    [state]
  );

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  }

  const set = (scopeKey, patch) => {
    setTouched(true);
    setState((prev) => ({ ...prev, [scopeKey]: { ...prev[scopeKey], ...patch } }));
  };

  return (
    <>
      <style>{css}</style>

      {open ? (
        <div className="fixed bottom-4 right-4 z-[100] max-h-[85vh] w-[22rem] overflow-y-auto rounded-xl bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/10">
          <div className="mb-3 flex items-center justify-between">
            <p className="m-0 text-sm font-semibold">Typsnitt — test</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded border border-black/15 px-2 py-1 text-xs"
                onClick={() => {
                  setTouched(false);
                  setState(defaults());
                }}
              >
                Återställ
              </button>
              <button
                type="button"
                className="rounded border border-black/15 px-2 py-1 text-xs"
                onClick={() => setOpen(false)}
              >
                Stäng
              </button>
            </div>
          </div>

          {SCOPES.map((scope) => {
            const v = state[scope.key];

            return (
              <div key={scope.key} className="mb-4 border-t border-black/10 pt-3 first:border-t-0 first:pt-0">
                <p className="m-0 mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {scope.label}
                </p>

                <select
                  className="mb-2 w-full rounded border border-black/15 px-2 py-1.5 text-sm"
                  value={v.font}
                  onChange={(e) => set(scope.key, { font: e.target.value })}
                >
                  {FONTS.map((f) => (
                    <option key={f.stack} value={f.stack}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <div className="mb-2 flex items-center gap-2">
                  <span className="w-14 shrink-0 text-xs text-neutral-500">Tjocklek</span>
                  <select
                    className="flex-1 rounded border border-black/15 px-2 py-1 text-sm"
                    value={v.weight}
                    onChange={(e) => set(scope.key, { weight: Number(e.target.value) })}
                  >
                    {WEIGHTS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <span className="w-14 shrink-0 text-xs text-neutral-500">Storlek</span>
                  <input
                    type="range"
                    className="flex-1"
                    min={scope.min}
                    max={scope.max}
                    value={v.size}
                    onChange={(e) => set(scope.key, { size: Number(e.target.value) })}
                  />
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-neutral-600">
                    {v.size}px
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-xs text-neutral-500">Radavst.</span>
                  <input
                    type="range"
                    className="flex-1"
                    min={0.85}
                    max={2.4}
                    step={0.05}
                    value={v.leading}
                    onChange={(e) => set(scope.key, { leading: Number(e.target.value) })}
                  />
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-neutral-600">
                    {Number(v.leading).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {[
            { key: IMAGE_KEY, label: 'Nyhetsbild', controls: IMAGE_CONTROLS },
            { key: MENUITEM_KEY, label: 'Menyrad', controls: MENU_CONTROLS },
            { key: HERO_KEY, label: 'Bakom rubriken', controls: HERO_CONTROLS },
            { key: SSS_KEY, label: 'Ljusläckage', controls: SSS_CONTROLS },
          ].map((group) => (
            <div key={group.key} className="mb-4 border-t border-black/10 pt-3">
              <p className="m-0 mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                {group.label}
              </p>

              {group.controls.map((control) => (
                <div key={control.key} className="mb-2 flex items-center gap-2">
                  <span className="w-[4.5rem] shrink-0 text-xs text-neutral-500">{control.label}</span>
                  <input
                    type="range"
                    className="flex-1"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={state[group.key][control.key]}
                    onChange={(e) => {
                      setTouched(true);
                      setState((prev) => ({
                        ...prev,
                        [group.key]: { ...prev[group.key], [control.key]: Number(e.target.value) },
                      }));
                    }}
                  />
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-neutral-600">
                    {state[group.key][control.key]}
                    {control.unit}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <button
            type="button"
            onClick={copySummary}
            className="mb-2 w-full rounded-md bg-black/85 px-3 py-2 text-sm text-white"
          >
            {copied ? 'Kopierat ✓' : 'Kopiera inställningar (JSON)'}
          </button>

          <textarea
            readOnly
            value={summary}
            onFocus={(e) => e.target.select()}
            className="mb-2 h-28 w-full resize-none rounded border border-black/15 p-2 font-mono text-[11px] leading-snug"
          />

          <p className="m-0 text-[11px] leading-snug text-neutral-500">
            Sparas i webbläsaren. Tillfälligt verktyg — tas bort sen.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[100] rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg"
        >
          Typsnitt
        </button>
      )}
    </>
  );
}
