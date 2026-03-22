import React, { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';

const SLIDE_INTERVAL_MS = 12000;
const FADE_DURATION_MS = 1800;

const clampProgress = (value) => Math.max(0, Math.min(value, 1));

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
  const images = props.home.data.data.attributes.headerimages.data;
  const length = images.length;
  const [activeIndex, setActiveIndex] = useState(() =>
    length ? Math.floor(Math.random() * length) : 0
  );
  const [progress, setProgress] = useState(0);
  const [cycleStart, setCycleStart] = useState(() => performance.now());
  const [previousSlide, setPreviousSlide] = useState(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!length) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setPreviousSlide({ index: activeIndex, progress: progressRef.current });
      setActiveIndex((prev) => (prev + 1) % length);
      setCycleStart(performance.now());
      setProgress(0);
    }, SLIDE_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [activeIndex, length]);

  useEffect(() => {
    if (!length) {
      return undefined;
    }

    let frameId;

    const updateProgress = () => {
      const nextProgress = (performance.now() - cycleStart) / SLIDE_INTERVAL_MS;
      const clampedProgress = clampProgress(nextProgress);
      progressRef.current = clampedProgress;
      setProgress(clampedProgress);
      frameId = window.requestAnimationFrame(updateProgress);
    };

    frameId = window.requestAnimationFrame(updateProgress);

    return () => window.cancelAnimationFrame(frameId);
  }, [cycleStart, length]);

  useEffect(() => {
    if (!previousSlide) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setPreviousSlide(null);
    }, FADE_DURATION_MS);

    return () => clearTimeout(timeout);
  }, [previousSlide]);

  if (!length) {
    return <div className="relative isolate z-0 h-[50vh] w-full bg-[#d8d8d8]" />;
  }

  const active = ((activeIndex % length) + length) % length;
  const handleSlideChange = (nextIndex) => {
    if (nextIndex === active) {
      return;
    }

    setPreviousSlide({ index: active, progress: progressRef.current });
    setActiveIndex(nextIndex);
    setCycleStart(performance.now());
    setProgress(0);
  };

  return (
    <div className="relative isolate z-0 h-[50vh] w-full overflow-hidden bg-[#d8d8d8] rounded-md">
      {images.map((img, index) => {
        const isActive = index === active;
        const isPrevious = previousSlide?.index === index;

        return (
          <div
            key={img.id ?? index}
            className={`absolute inset-0 z-[1] transition-opacity duration-[1800ms] ease-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <LazyLoadImage
              className={`block h-[50vh] w-full transform-gpu bg-[#272926] object-cover will-change-transform transition-[filter,opacity] duration-[1800ms] ease-out ${
                isActive ? 'opacity-[0.94] blur-0' : 'opacity-[0.86] blur-[1px]'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
              effect="blur"
              src={img.attributes.url}
              alt=""
              style={
                isActive
                  ? { transform: getSlideTransform(index, progress) }
                  : isPrevious
                    ? { transform: getSlideTransform(index, previousSlide.progress) }
                    : { transform: 'scale(1.04)' }
              }
            />
          </div>
        );
      })}
      <div className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
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
                    className="absolute left-0 top-0 h-full rounded-full bg-white/70"
                    style={{
                      width: `${progress * 100}%`,
                    }}
                  />
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
