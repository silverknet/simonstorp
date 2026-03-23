import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider';
import NewsMetaDates from '../components/NewsMetaDates';
import useFetch from '../hooks/useFetch';
import apiBaseUrl from '../config/apiBaseUrl';
import { getOptimizedDisplayUrl } from '../utils/strapiMedia';
import { getNyhetSlug } from '../utils/utils';

/** Latest two by publish time — never the full nyhets list */
const HOME_NEWS_URL = `${apiBaseUrl}/api/nyhets?populate=%2A&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=2`;

/* -------------------------------------------------------------------------- */
/*  Layout — two columns below hero; wraps at lg (matches old max-[1200px])   */
/* -------------------------------------------------------------------------- */

const twoColumnRow =
  'flex flex-row flex-nowrap justify-evenly max-[1200px]:flex-wrap max-[800px]:mt-0 max-[800px]:p-0';

/** Shared “home_B” column shell: half width desktop, full width mobile */
const columnShell =
  'box-border w-1/2 min-w-96 max-w-3xl font-light leading-relaxed tracking-wide transition-all duration-700 ease-out ' +
  'm-4 p-8 max-[1200px]:w-auto max-[800px]:m-0 max-[800px]:min-w-0 max-[800px]:w-full max-[800px]:max-w-none max-[800px]:p-0';

const columnIntro = `${columnShell} font-['Lato',sans-serif]`;

const columnNews = `${columnShell} font-['Heebo',sans-serif] max-[800px]:m-2.5`;

/* -------------------------------------------------------------------------- */
/*  Intro column — title + markdown                                           */
/* -------------------------------------------------------------------------- */

const introTitle =
  'mb-4 text-3xl font-light max-[800px]:mx-8 max-[800px]:mt-12 max-[800px]:text-center max-[800px]:leading-snug';

const introMarkdown =
  'text-left font-["Lato",sans-serif] text-base leading-relaxed tracking-wide text-[var(--main-text)] ' +
  '[&_p]:m-0 [&_a]:text-[var(--accent-one)] [&_strong]:font-semibold ' +
  'max-[800px]:m-9 max-[800px]:text-lg';

/* -------------------------------------------------------------------------- */
/*  News column — “Aktuellt” + cards + “Se alla”                                */
/* -------------------------------------------------------------------------- */

/** Stack: heading, cards, “Se alla” — tight gap under Aktuellt; compact gap between cards */
const newsSection = 'mt-0 flex flex-col gap-2';

const aktuelltHeadingWrap = 'border-[#b0b0b0] p-0 pb-1';

const aktuelltHeading = '-m-0.5 ml-1 text-lg font-light text-[#131313]';

/** Page-load fade only on the outer Link — avoids transition-delay slowing hover */
const newsCardLink =
  'relative -ml-1 block w-full cursor-pointer no-underline text-inherit transition-[opacity,transform] duration-700 ease-out max-[800px]:ml-0';

/** Hover lives here so it isn’t delayed by the entrance `transitionDelay` on the Link */
const newsCardBase =
  'flex min-h-28 w-full flex-row items-stretch overflow-hidden rounded-lg bg-[#f9f9f9] ' +
  'text-[var(--main-text)] shadow-none transition-[transform,box-shadow] duration-200 ease-out ' +
  'hover:scale-[1.01] hover:shadow-lg';

const newsThumbWrap =
  'relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-[var(--bg-white-accent)]';

const newsThumb = 'absolute inset-0 h-full w-full object-cover';

const newsCardBody =
  'flex min-h-28 min-w-0 flex-1 flex-col justify-center gap-1 bg-[#f9f9f9] px-4 py-2';

const newsCardTitleBlock = 'flex min-w-0 flex-col gap-1 text-[var(--main-text)]';

const newsCardTitle = 'm-0 min-w-0 font-normal leading-tight';

const newsCardExcerpt =
  'm-0 overflow-hidden pr-1 pb-px text-sm leading-normal text-[#403939] ' +
  '[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]';

const seeAllWrap =
  'group w-fit px-1 py-0 text-neutral-700 no-underline transition-all duration-700 ease-out ' +
  'hover:cursor-pointer hover:bg-[#f9f9f9] hover:text-neutral-800';

const seeAllLink =
  'm-0 inline-flex w-fit items-center gap-1.5 text-neutral-600 no-underline transition-colors duration-300 ' +
  'group-hover:border-l-2 group-hover:border-[var(--accent-one)] group-hover:pl-1.5';

export default function Homepage(props) {
  const { data: newsTeaser, loading: newsLoading, error: newsError } = useFetch(HOME_NEWS_URL);
  const homeData = props.homecontent?.data?.data ?? {};

  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setContentVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const introFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';
  const newsColFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0';
  const newsCardFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';
  const seeAllFade = contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0';

  return (
    <div className="min-h-[calc(100vh-437px)] pb-0">
      <div className="box-border w-full">
        <ImageSlider home={props.homecontent} />
      </div>

      <div className={twoColumnRow}>
        {/* Left: site intro */}
        <div
          className={`${columnIntro} ${introFade}`}
          style={{ transitionDelay: '140ms' }}
        >
          <h1 className={introTitle}>{homeData.upper}</h1>
          <ReactMarkdown className={introMarkdown}>
            {homeData.Huvudtext}
          </ReactMarkdown>
        </div>

        {/* Right: news teaser */}
        <div
          className={`${columnNews} ${newsColFade}`}
          style={{ transitionDelay: '260ms' }}
        >
          <div className={newsSection}>
            <div className={aktuelltHeadingWrap}>
              <p className={aktuelltHeading}>Aktuellt</p>
            </div>

            {newsLoading || newsError
              ? null
              : (Array.isArray(newsTeaser?.data) ? newsTeaser.data : []).map((value, index) => {
                  const title = value.title ?? value.Rubrik ?? '';
                  const imgUrl = getOptimizedDisplayUrl(value.Bild) || null;
                  const pathSlug = getNyhetSlug(value);
                  if (!pathSlug) return null;
                  return (
                    <Link
                      key={value.id}
                      className={`${newsCardLink} ${newsCardFade}`}
                      style={{ transitionDelay: `${340 + index * 140}ms` }}
                      to={'/' + pathSlug}
                      state={{ newsFrom: 'home' }}
                    >
                      <div className={newsCardBase}>
                        {imgUrl ? (
                          <div className="flex shrink-0 items-center justify-center p-1.5">
                            <div className={newsThumbWrap}>
                              <img className={newsThumb} src={imgUrl} alt="" />
                            </div>
                          </div>
                        ) : null}
                        <div className={newsCardBody}>
                          <div className={newsCardTitleBlock}>
                            <p className={newsCardTitle}>{title}</p>
                            <NewsMetaDates data={value} variant="teaserCompact" />
                          </div>
                          <p className={newsCardExcerpt}>{value.Beskrivning}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}

            <div
              className={`${seeAllWrap} ${seeAllFade}`}
              style={{ transitionDelay: '620ms' }}
            >
              <Link className={seeAllLink} to="/allanyheter">
                <span>Se alla nyheter</span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.1} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
