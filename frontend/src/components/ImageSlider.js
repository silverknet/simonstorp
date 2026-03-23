import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';

import ImageLightboxDialog from './ImageLightboxDialog';
import useWindowDimensions from '../hooks/getWindowDimensions';
import { getHomepageHeaderImages } from '../utils/homepageHeaderImages';
import { getFullSizeImageUrl, getHeroDisplayUrl } from '../utils/strapiMedia';

const SLIDE_INTERVAL_MS = 12000;
const FADE_DURATION_MS = 1800;
const sliderAnimationStyles = `
  @keyframes sliderProgressFill {
    from { width: 0%; opacity: 0.85; }
    to { width: 100%; opacity: 1; }
  }

  @keyframes heroKenBurnsLeft {
    from { transform: scale(1.04) translate3d(0, 0, 0); }
    to { transform: scale(1.08) translate3d(-1.2%, -0.35%, 0); }
  }

  @keyframes heroKenBurnsRight {
    from { transform: scale(1.04) translate3d(0, 0, 0); }
    to { transform: scale(1.08) translate3d(1.2%, 0.35%, 0); }
  }
`;

const clampProgress = (value) => Math.max(0, Math.min(value, 1));
const getCurrentProgress = (cycleStart) =>
  clampProgress((performance.now() - cycleStart) / SLIDE_INTERVAL_MS);

const getSlideTransform = (index, progress) => {
  const t = clampProgress(progress);
  const direction = index % 2 === 0 ? -1 : 1;
  const scale = 1.04 + 0.04 * t;
  const x = direction * 1.2 * t;
  const y = direction * 0.35 * t;

  return `scale(${scale}) translate3d(${x}%, ${y}%, 0)`;
};

/**
 * Hero slider — fills the App column (w-full). Uses isolation so inner z-index
 * does not compete with fixed nav (z-index: 2) on mobile.
 * Timings match .slideimgActive (5s) / .slideimg (1s) in indextemp.css.
 */
export default function ImageSlider(props) {
  const homeData = props.home?.data?.data;
  const images = getHomepageHeaderImages(homeData);
  const { width } = useWindowDimensions();
  const preferOriginalImage = width > 1024;
  const length = images.length;
  const [activeIndex, setActiveIndex] = useState(() =>
    length ? Math.floor(Math.random() * length) : 0
  );
  const [previousSlide, setPreviousSlide] = useState(null);
  const [cycleToken, setCycleToken] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const cycleStartRef = useRef(performance.now());

  const beginCycle = useCallback((nextIndex) => {
    setPreviousSlide({
      index: activeIndex,
      progress: getCurrentProgress(cycleStartRef.current),
    });
    cycleStartRef.current = performance.now();
    setActiveIndex(nextIndex);
    setCycleToken((token) => token + 1);
  }, [activeIndex]);

  useEffect(() => {
    if (!length || lightboxOpen) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      beginCycle((activeIndex + 1) % length);
    }, SLIDE_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [activeIndex, beginCycle, cycleToken, length, lightboxOpen]);

  useEffect(() => {
    if (!previousSlide) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setPreviousSlide(null);
    }, FADE_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [previousSlide]);

  useEffect(() => {
    if (!length) {
      setActiveIndex(0);
      setPreviousSlide(null);
      setLightboxOpen(false);
      return;
    }

    setActiveIndex((current) => (current >= length ? 0 : current));
  }, [length]);

  if (!length) {
    return <div className="relative isolate z-0 h-[50vh] w-full bg-[#d8d8d8]" />;
  }

  const active = ((activeIndex % length) + length) % length;
  const activeImage = images[active];
  const activeAttrs = activeImage;

  const handleSlideChange = (nextIndex) => {
    if (nextIndex === active) {
      return;
    }

    beginCycle(nextIndex);
  };

  return (
    <div className="relative isolate z-0 h-[50vh] w-full overflow-hidden bg-[#d8d8d8] rounded-md">
      <style>{sliderAnimationStyles}</style>
      {images.map((img, index) => {
        const isActive = index === active;
        const isPrevious = previousSlide?.index === index;
        const motionName = index % 2 === 0 ? 'heroKenBurnsLeft' : 'heroKenBurnsRight';

        return (
          <div
            key={img.id ?? index}
            className={`absolute inset-0 z-[1] transition-opacity duration-[1800ms] ease-out ${
              isActive ? 'cursor-pointer opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={() => isActive && setLightboxOpen(true)}
            onKeyDown={(e) => {
              if (isActive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
            role={isActive ? 'button' : 'presentation'}
            tabIndex={isActive ? 0 : -1}
            aria-label={isActive ? 'Visa bild i full storlek' : undefined}
          >
            <LazyLoadImage
              className={`block h-[50vh] w-full transform-gpu bg-[#272926] object-cover will-change-transform transition-[filter,opacity] duration-[1800ms] ease-out ${
                isActive ? 'opacity-[0.94] blur-0' : 'opacity-[0.86] blur-[1px]'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
              effect="blur"
              src={getHeroDisplayUrl(img, { preferOriginal: preferOriginalImage })}
              alt={img.alternativeText || ''}
              style={
                isActive
                  ? {
                      animation: `${motionName} ${SLIDE_INTERVAL_MS}ms linear forwards`,
                    }
                  : isPrevious
                    ? { transform: getSlideTransform(index, previousSlide.progress) }
                    : { transform: 'scale(1.04)' }
              }
            />
          </div>
        );
      })}
      <div
        className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {images.map((img, index) => {
          const isActive = index === active;

          return (
            <button
              key={`dot-${img.id ?? index}`}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              aria-pressed={isActive}
              onClick={() => handleSlideChange(index)}
              className={`relative overflow-hidden rounded-full border border-white/10 transition-all duration-300 ${
                isActive
                  ? 'h-2.5 w-10 bg-white/20'
                  : 'h-2.5 w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            >
              {isActive ? (
                <>
                  <span
                    key={`progress-${active}-${cycleToken}`}
                    className="absolute left-0 top-0 h-full rounded-full bg-white/70"
                    style={{
                      animation: `sliderProgressFill ${SLIDE_INTERVAL_MS}ms linear forwards`,
                    }}
                  />
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {lightboxOpen && activeAttrs ? (
        <ImageLightboxDialog
          src={getFullSizeImageUrl(activeAttrs)}
          alt={activeAttrs.alternativeText || ''}
          caption={
            typeof activeAttrs.caption === 'string' ? activeAttrs.caption.trim() : ''
          }
          onClose={() => setLightboxOpen(false)}
          ariaLabel="Huvudbild i full storlek"
        />
      ) : null}
    </div>
  );
}
