import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';

import ImageLightboxDialog from './ImageLightboxDialog';
import useWindowDimensions from '../hooks/getWindowDimensions';
import { getHomepageHeaderImages } from '../utils/homepageHeaderImages';
import { getFullSizeImageUrl, getHeroDisplayUrl } from '../utils/strapiMedia';

/**
 * EXPERIMENT — the scattering stack, tight rim first. Each step travels further from
 * the frame, loses light, and blurs more, the way a longer path through a translucent
 * body scatters more and returns less.
 */
const SSS_LAYERS = [
  { spread: 6, blur: 24, opacity: 0.42, saturate: 1.9, brightness: 1.1 },
  { spread: 20, blur: 46, opacity: 0.26, saturate: 1.75, brightness: 1.06 },
  { spread: 50, blur: 80, opacity: 0.15, saturate: 1.6, brightness: 1.03 },
  { spread: 104, blur: 124, opacity: 0.075, saturate: 1.4, brightness: 1.0 },
];

/**
 * Light arrives from above, so less of it comes back over the top edge than spills out
 * below. The asymmetry is what gives the panel a side that faces the light and a side
 * that does not — a symmetric halo reads as flat however strong it is.
 */
const SSS_BIAS = { top: 0.34, side: 0.8, bottom: 1.35 };

const SLIDE_INTERVAL_MS = 12000;
const FADE_DURATION_MS = 1800;
const sliderAnimationStyles = `
  @keyframes sliderProgressFill {
    from { transform: scaleX(0); opacity: 0.85; }
    to { transform: scaleX(1); opacity: 1; }
  }

  @keyframes heroKenBurnsLeft {
    from { transform: scale(1.04) translate3d(0, 0, 0); }
    to { transform: scale(1.08) translate3d(-1.2%, -0.35%, 0); }
  }

  @keyframes heroLineIn {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes heroKenBurnsRight {
    from { transform: scale(1.04) translate3d(0, 0, 0); }
    to { transform: scale(1.08) translate3d(1.2%, 0.35%, 0); }
  }
`;

/**
 * The introduction, one sentence at a time.
 *
 * Split on sentence endings rather than on line breaks: the text is written as prose in
 * Strapi, and whoever writes it should not have to think about where the slides fall.
 */
/**
 * Builds the mask the shade is seen through: the words' own footprint, blurred until
 * it is a cloud. Rectangles rather than glyphs — at this blur radius the difference is
 * not visible, and it costs no font loading inside the mask.
 */
function buildTextMask(boxes, width, height) {
  if (!boxes.length || !width || !height) return null;

  // Read as a custom property so the panel can turn this without a rebuild; the
  // stdDeviation lives inside an SVG data URI, where CSS cannot reach it.
  const soft =
    Number(
      getComputedStyle(document.documentElement).getPropertyValue('--hero-mask-soft')
    ) || 26;

  const shapes = boxes
    .map(
      (b) =>
        `<rect x='${b.x.toFixed(1)}' y='${b.y.toFixed(1)}' width='${b.width.toFixed(1)}' ` +
        `height='${b.height.toFixed(1)}' rx='${(b.height / 2).toFixed(1)}'/>`
    )
    .join('');

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${Math.round(width)}' height='${Math.round(height)}'>` +
    `<filter id='s' x='-60%' y='-60%' width='220%' height='220%'>` +
    `<feGaussianBlur stdDeviation='${soft}'/></filter>` +
    `<g filter='url(#s)' fill='#fff'>${shapes}</g></svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const splitSentences = (text) =>
  String(text ?? '')
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

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
export default function ImageSlider({ eyebrow, title, bodyText, ...props }) {
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
  const frameRef = useRef(null);
  const captionRef = useRef(null);
  const [textMask, setTextMask] = useState(null);
  const cycleStartRef = useRef(performance.now());

  /* Remeasure whenever the words or the frame change: the mask has to sit exactly
     where the type is, at every width, or it becomes a shape of its own again. */
  useEffect(() => {
    const frame = frameRef.current;
    const caption = captionRef.current;
    if (!frame || !caption) return undefined;

    const measure = () => {
      const frameBox = frame.getBoundingClientRect();
      if (!frameBox.width || !frameBox.height) return;

      const boxes = [];
      caption.querySelectorAll('p').forEach((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        // Per line, not per paragraph: a wrapped sentence should cast two clouds.
        Array.from(range.getClientRects()).forEach((r) => {
          if (r.width < 1 || r.height < 1) return;
          boxes.push({
            x: r.left - frameBox.left,
            y: r.top - frameBox.top,
            width: r.width,
            height: r.height,
          });
        });
        range.detach?.();
      });

      setTextMask(buildTextMask(boxes, frameBox.width, frameBox.height));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(caption);
    window.addEventListener('fontlab:change', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('fontlab:change', measure);
    };
  });


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
    return <div className="relative isolate z-0 h-[min(56vh,600px)] w-full bg-[#272926]" />;
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

  const glowSrc = getHeroDisplayUrl(activeImage, { preferOriginal: false });
  const sentences = splitSentences(bodyText);
  // Sentences and images cycle independently; whichever list is shorter simply repeats.
  const sentence = sentences.length ? sentences[active % sentences.length] : null;

  return (
    <div className="relative w-full">
      {/*
        EXPERIMENT — subsurface scattering. Delete this block and the SSS_LAYERS
        constant to go back to the plain backlight.

        Light behaves in translucent material the way it does in skin or a leaf: it
        enters, bounces around inside, and leaves at the edges carrying the colour of
        whatever it travelled through. There is no way to sample a neighbouring pixel
        in CSS, so this stacks copies of the photograph itself, each pushed further out
        and blurred harder, sitting behind the frame. Only the rim of each copy is ever
        visible, so every edge leaks the colour of the picture directly inside it, and
        the stack's falloff stands in for the depth the light travelled.
      */}
      {SSS_LAYERS.map((layer) => (
        <div
          key={layer.spread}
          className="pointer-events-none absolute z-0"
          style={{
            top: `calc(${layer.spread}px * var(--sss-top, ${SSS_BIAS.top}) * -1)`,
            right: `calc(${layer.spread}px * var(--sss-side, ${SSS_BIAS.side}) * -1)`,
            bottom: `calc(${layer.spread}px * var(--sss-bottom, ${SSS_BIAS.bottom}) * -1)`,
            left: `calc(${layer.spread}px * var(--sss-side, ${SSS_BIAS.side}) * -1)`,
          }}
          aria-hidden
        >
          <img
            src={glowSrc}
            alt=""
            className="h-full w-full object-cover transition-opacity duration-[1800ms]"
            style={{
              // Scattered light can only add. Screened against the page, a black pixel
              // contributes nothing at all, so the picture's dark edges leak no light
              // instead of leaking darkness — which is what read as a shadow.
              mixBlendMode: 'screen',
              opacity: `calc(${layer.opacity} * var(--sss-strength, 1))`,
              // Scattered light comes back more saturated and a touch brighter than
              // what went in — that is what sells it as light rather than a copy.
              filter:
                `blur(calc(${layer.blur}px * var(--sss-spread, 1))) ` +
                `saturate(calc(${layer.saturate} * var(--sss-saturate, 1))) ` +
                `brightness(${layer.brightness})`,
            }}
          />
        </div>
      ))}

    <div
      ref={frameRef}
      className="relative isolate z-[1] h-[min(56vh,600px)] w-full overflow-hidden bg-[#272926] rounded-md"
    >
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
              wrapperClassName="!block h-full w-full"
              className={`block h-full w-full transform-gpu bg-[#272926] object-center object-cover will-change-transform transition-[filter,opacity] duration-[1800ms] ease-out ${
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
        className="absolute bottom-4 right-4 z-[3] flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm"
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
                    className="absolute left-0 top-0 h-full w-full origin-left transform-gpu rounded-full bg-white/70 will-change-transform"
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

      {title ? (
        <>
          {/*
              EXPERIMENT — the other half of the effect: in a translucent body the rim
              is where scattered light gathers before it escapes, so the picture lifts
              very slightly at its own edges.
          */}
          <div
            className="pointer-events-none absolute inset-0 z-[2]"
            aria-hidden
            style={{
              boxShadow:
                'inset 0 0 22px rgba(255,255,255,0.07), inset 0 0 70px rgba(255,255,255,0.045)',
            }}
          />

          {/* An even veil over the whole picture, to flatten it into the page. */}
          <div
            className="pointer-events-none absolute inset-0 z-[2]"
            aria-hidden
            style={{ backgroundColor: 'rgba(8,10,7,var(--hero-veil, 0.1))' }}
          />

          {/*
              Softening and shade, seen only through the words' own blurred footprint:
              the picture gives way where the type sits and nowhere else, with no edge
              anywhere for the eye to catch.
          */}
          {textMask ? (
            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              aria-hidden
              style={{
                backdropFilter: 'blur(calc(var(--hero-blur, 5) * 1px)) saturate(104%)',
                WebkitBackdropFilter: 'blur(calc(var(--hero-blur, 5) * 1px)) saturate(104%)',
                backgroundColor: 'rgba(8,10,7,var(--hero-shade, 0.4))',
                maskImage: textMask,
                WebkitMaskImage: textMask,
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%',
              }}
            />
          ) : null}

          <div
            ref={captionRef}
            className="pointer-events-none absolute bottom-0 left-0 z-[3] p-6 md:p-10"
          >
            {eyebrow ? (
              <p
                data-font="herobody"
                className="m-0 mb-2 font-['Source_Serif_4',serif] text-sm tracking-[0.04em] md:text-base"
                // Set here rather than as a utility: the global stylesheet colours <p>,
                // and an opacity variant Tailwind has not emitted loses to it silently.
                style={{ color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 6px rgba(8,10,7,0.35)' }}
              >
                {eyebrow}
              </p>
            ) : null}

            <p
              data-font="hero"
              className="m-0 font-['Source_Serif_4',serif] text-[clamp(2rem,5.4vw,4.0625rem)] font-normal leading-[0.85] tracking-[-0.01em] text-white"
              style={{ textShadow: '0 1px 8px rgba(8,10,7,0.32)' }}
            >
              {title}
            </p>

            {sentence ? (
              <p
                key={`${active}-${cycleToken}`}
                data-font="herobody"
                className="m-0 mt-4 h-[4.6rem] max-w-[62ch] overflow-hidden font-['Source_Serif_4',serif] text-[0.875rem] font-light leading-[1.65] text-white md:mt-5 md:h-[4.8rem]"
                style={{
                  textShadow: '0 1px 6px rgba(8,10,7,0.35)',
                  animation: 'heroLineIn 900ms ease-out both',
                }}
              >
                {sentence}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

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
    </div>
  );
}
