import React, { useCallback, useState } from 'react';

import ImageLightboxDialog from './ImageLightboxDialog';
import { getFullSizeImageUrl, getOptimizedDisplayUrl } from '../utils/strapiMedia';
import { getImageFrame } from '../utils/infoPageImageLayout';

/**
 * Infopage image: framed preview, caption/credit, lightbox to full size.
 * Strapi Upload: `caption`, `alternativeText` on the media object.
 */
export default function InfopageImageDisplay({ media, onDimensions, hideCaptionWhenEmpty = false }) {
  const attrs = media || {};
  const imageId = media?.id;
  const caption = typeof attrs.caption === 'string' ? attrs.caption.trim() : '';
  const alt = attrs.alternativeText || '';

  const displaySrc = getOptimizedDisplayUrl(attrs);
  const fullSizeSrc = getFullSizeImageUrl(attrs);

  const [frame, setFrame] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleLoad = useCallback(
    (e) => {
      const { naturalWidth: w, naturalHeight: h } = e.target;
      setFrame(getImageFrame(w, h));
      if (onDimensions && imageId != null) onDimensions(imageId, w, h);
    },
    [imageId, onDimensions]
  );

  const openLightbox = useCallback(() => {
    if (fullSizeSrc) setLightboxOpen(true);
  }, [fullSizeSrc]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  return (
    <div className="group flex flex-col gap-0">
      <div
        className={
          'cursor-pointer rounded-[6px] outline-none transition-opacity duration-150 ease-in-out ' +
          'hover:opacity-[0.94] focus-visible:ring-2 focus-visible:ring-[var(--accent-one)]'
        }
        role="button"
        tabIndex={0}
        onClick={openLightbox}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
          }
        }}
        aria-label={alt ? `Visa större: ${alt}` : 'Visa bild i full storlek'}
      >
        <figure
          className="relative m-0 overflow-hidden rounded-[5px] bg-gradient-to-br from-[var(--bg-white-accent)] to-[#ebebeb]"
          style={
            frame
              ? { aspectRatio: frame.aspectRatio }
              : { aspectRatio: '3 / 2', minHeight: 160 }
          }
        >
          <img
            src={displaySrc}
            alt={alt}
            className="absolute left-0 top-0 block h-full w-full object-center"
            onLoad={handleLoad}
            loading="lazy"
            style={{
              objectFit: frame?.objectFit ?? 'contain',
            }}
          />
        </figure>
      </div>

      {caption || !hideCaptionWhenEmpty ? (
        <div className="mt-[0.45rem]">
          {caption ? (
            <p className="m-0 font-['Heebo',sans-serif] text-xs font-normal leading-[1.45] tracking-wide text-[var(--grey-text)]">
              {caption}
            </p>
          ) : (
            <p
              className="m-0 font-['Heebo',sans-serif] text-xs italic text-[#8a8a8a] opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
              lang="sv"
            >
              Ingen bildtext
            </p>
          )}
        </div>
      ) : null}

      {lightboxOpen && fullSizeSrc ? (
        <ImageLightboxDialog
          src={fullSizeSrc}
          alt={alt}
          caption={caption}
          onClose={closeLightbox}
        />
      ) : null}
    </div>
  );
}
