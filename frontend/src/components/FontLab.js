import React, { useEffect, useMemo, useState } from 'react';

/**
 * TEMPORARY — a panel for trying typefaces on the live page.
 *
 * Not meant to ship: it overrides styling with !important and pulls fonts from Google
 * at runtime. Delete this file, its mount in Homepage, and the data-font attributes
 * once the choice is made.
 */

const STORAGE_KEY = 'simonstorp_fontlab';

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

/** Each scope maps to the data-font marks placed on the page. */
const SCOPES = [
  { key: 'hero', label: 'Rubrik på bilden', min: 24, max: 96, size: 60, leading: 1 },
  { key: 'newstitle', label: 'Nyhetsrubriker', min: 14, max: 48, size: 23, leading: 1.2 },
  { key: 'body', label: 'Brödtext', min: 11, max: 26, size: 16, leading: 1.75 },
  { key: 'stamp', label: 'Datumstämpel', min: 16, max: 64, size: 32, leading: 1 },
];

const defaults = () =>
  Object.fromEntries(
    SCOPES.map((s) => [
      s.key,
      { font: FONTS[0].stack, weight: 300, size: s.size, leading: s.leading },
    ])
  );

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const base = defaults();

    // Merge per scope, not just at the top level: settings saved before a control
    // existed would otherwise replace a whole scope and drop the new field.
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [key, { ...value, ...(saved[key] ?? {}) }])
    );
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

  const css = useMemo(
    () =>
      SCOPES.map((scope) => {
        const v = state[scope.key];
        return `[data-font="${scope.key}"], [data-font="${scope.key}"] * {
  font-family: ${v.font} !important;
  font-weight: ${v.weight} !important;
  font-size: ${v.size}px !important;
  line-height: ${v.leading} !important;
}`;
      }).join('\n'),
    [state]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* ignore */
    }
  }, [state]);

  /* What to hand back: named faces and plain numbers, not internal keys. */
  const summary = useMemo(
    () =>
      JSON.stringify(
        Object.fromEntries(
          SCOPES.map((scope) => [
            scope.label,
            {
              typsnitt: labelFor(state[scope.key].font),
              css: state[scope.key].font,
              tjocklek: state[scope.key].weight,
              storlek: `${state[scope.key].size}px`,
              radavstånd: state[scope.key].leading,
            },
          ])
        ),
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

  const set = (scopeKey, patch) =>
    setState((prev) => ({ ...prev, [scopeKey]: { ...prev[scopeKey], ...patch } }));

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
                onClick={() => setState(defaults())}
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
