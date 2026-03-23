import React from 'react';
import { AlertCircle } from 'lucide-react';

const fullWrap =
  'box-border flex min-h-[min(70vh,560px)] w-full flex-col items-center justify-center bg-[var(--bg-white)] px-4 py-16';

const inner =
  'flex max-w-md flex-col items-center gap-4 rounded-2xl border border-black/[0.08] bg-[var(--bg-white-accent)] px-8 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] max-[800px]:px-6 max-[800px]:py-8';

const titleClass =
  'm-0 font-[\'Lato\',sans-serif] text-[1.35rem] font-normal leading-snug tracking-[0.02em] text-[var(--grey-text)] max-[800px]:text-xl';

const descClass =
  'm-0 max-w-[28ch] font-[\'Lato\',sans-serif] text-[0.95rem] font-light leading-relaxed tracking-wide text-[var(--main-text)]/90';

const linkClass =
  'mt-1 inline-flex items-center gap-2 font-[\'Lato\',sans-serif] text-sm font-normal tracking-wide text-[var(--accent-one)] underline decoration-[var(--accent-one)]/35 underline-offset-4 transition hover:decoration-[var(--accent-one)]';

const compactBar =
  'flex w-full items-center gap-3 border-b border-[var(--accent-one)]/20 bg-[#829460]/[0.07] px-4 py-3 text-left';

const compactText =
  'm-0 flex-1 font-[\'Lato\',sans-serif] text-sm font-light leading-snug tracking-wide text-[var(--main-text)]';

/**
 * Full-page or compact error UI aligned with site typography (Lato, accent, neutrals).
 * Uses <a href="/"> so it works even when rendered outside <Router> (e.g. App bootstrap errors).
 */
export default function ErrorScreen({
  title = 'Något gick fel',
  description,
  compact = false,
  showHomeLink = true,
  icon: Icon = AlertCircle,
}) {
  if (compact) {
    return (
      <div className={compactBar} role="alert">
        <Icon
          className="h-5 w-5 shrink-0 text-[var(--accent-one)]"
          strokeWidth={2}
          aria-hidden
        />
        <p className={compactText}>{description || title}</p>
      </div>
    );
  }

  return (
    <div className={fullWrap}>
      <div className={inner}>
        <Icon
          className="h-14 w-14 text-[var(--accent-one)] opacity-90"
          strokeWidth={1.35}
          aria-hidden
        />
        <h1 className={titleClass}>{title}</h1>
        {description ? <p className={descClass}>{description}</p> : null}
        {showHomeLink ? (
          <a href="/" className={linkClass}>
            Till startsidan
          </a>
        ) : null}
      </div>
    </div>
  );
}
