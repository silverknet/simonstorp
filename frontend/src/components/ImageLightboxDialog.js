import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Shared full-screen image dialog.
 * @param {string} src
 * @param {string} [alt]
 * @param {string} [caption] — shown under the image when non-empty
 * @param {() => void} onClose
 * @param {string} [ariaLabel]
 */
export default function ImageLightboxDialog({
  src,
  alt = '',
  caption = '',
  onClose,
  ariaLabel = 'Bild i full storlek',
}) {
  const captionText = typeof caption === 'string' ? caption.trim() : '';

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6"
      role="presentation"
      onClick={handleBackdrop}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[min(88vw,1100px)] flex-col rounded-2xl bg-[var(--bg-white)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/10"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-white-accent)] text-[var(--grey-text)] shadow-sm ring-1 ring-black/10 transition hover:bg-[#e8e8e8]"
          style={{ zIndex: 100001 }}
          onClick={onClose}
          aria-label="Stäng"
        >
          <X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </button>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 sm:p-5">
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-black/[0.04] p-3 sm:p-4">
            <div className="flex w-full items-center justify-center">
              <img
                src={src}
                alt={alt}
                className="max-h-[min(68vh,calc(90vh-7rem))] w-full max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
          {captionText ? (
            <p className="m-0 border-t border-black/10 pt-4 text-center font-['Heebo',sans-serif] text-sm font-normal leading-relaxed tracking-wide text-[var(--grey-text)]">
              {captionText}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
