import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Link, useLocation } from 'react-router-dom';

import InfopageImageDisplay from '../components/InfopageImageDisplay';
import NewsMetaDates from '../components/NewsMetaDates';
import { getOptimizedDisplayUrl } from '../utils/strapiMedia';

/** Centrerad artikel, lite bredare så bildkolumnen får mer utrymme */
const articleShellClasses = 'box-border flex w-full max-w-[1040px] flex-col items-center px-4 pt-5 pb-12 max-[800px]:pt-4 max-[800px]:pb-8';

const proseColumnClasses =
  'flex min-w-0 w-full max-w-[54ch] flex-col items-stretch max-[960px]:max-w-[min(54ch,100%)]';

const newsTitleClasses =
  'w-full text-left font-[\'Lato\',sans-serif] text-[25px] font-normal leading-[1.28] tracking-[0.04rem] text-[var(--grey-text)] antialiased ' +
  'mb-1 max-[800px]:text-[29px] max-[800px]:font-light max-[800px]:text-left';

const newsBodyClasses =
  'text-left font-[\'Lato\',sans-serif] text-[16px] font-light leading-[180%] tracking-[0.5px] text-[var(--main-text)] antialiased ' +
  '[&_p]:mt-0 [&_p]:mb-[1em] [&_p:last-child]:mb-0 ' +
  '[&_ul]:mb-[1em] [&_ol]:mb-[1em] [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1 ' +
  '[&_h1]:mt-5 [&_h2]:mt-5 [&_h3]:mt-5 [&_h4]:mt-5 [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 [&_h4]:mb-2 ' +
  '[&_h1]:font-medium [&_h2]:font-medium [&_h3]:font-medium [&_h4]:font-medium ' +
  '[&_h1:first-child]:mt-0 [&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0 [&_h4:first-child]:mt-0 ' +
  '[&_a]:text-[var(--accent-one)] [&_strong]:font-semibold ' +
  'max-[800px]:m-0 max-[800px]:text-[17px]';

const backLinkClasses =
  'group mb-2 inline-flex w-fit items-center gap-2.5 font-[\'Lato\',sans-serif] text-[0.95rem] font-normal leading-snug tracking-[0.02em] ' +
  'text-[var(--grey-text)] no-underline transition-colors hover:text-[var(--main-text)] ' +
  'max-[800px]:text-base';

/** Bild vänster (smal), text höger; på mobil staplat och centrerat */
const gridWithImageClasses =
  'grid w-full grid-cols-1 items-start justify-items-center gap-y-6 gap-x-6 ' +
  'lg:grid-cols-[minmax(0,360px)_minmax(0,54ch)] lg:justify-items-stretch lg:gap-x-8 lg:gap-y-8';

const gridNoImageClasses = 'grid w-full grid-cols-1 justify-items-center';

const imageColClasses =
  'w-full max-w-[54ch] shrink-0 justify-self-center lg:w-[360px] lg:max-w-[360px] lg:justify-self-start';

export default function Full_news(props) {
  const location = useLocation();

  const backHref = location.state?.newsFrom === 'home' ? '/' : '/allanyheter';
  const backLabel = location.state?.newsFrom === 'home' ? 'Till startsidan' : 'Till alla nyheter';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const bildData = props.page?.Bild;
  const hasImage = Boolean(bildData && getOptimizedDisplayUrl(bildData));
  const headline = props.page?.title ?? props.page?.Rubrik ?? '';
  const contentWrapClassName = hasImage
    ? 'w-full max-w-[calc(360px+54ch+2rem)]'
    : 'w-full max-w-[54ch]';

  return (
    <div className="w-full pb-0 pt-4">
      <div className="box-border flex w-full flex-col items-center">
        <article className={articleShellClasses} lang="sv">
          <div className={`flex w-full flex-col items-stretch ${contentWrapClassName}`}>
            <Link to={backHref} className={backLinkClasses}>
              <ArrowLeft
                className="h-[1.15em] w-[1.15em] shrink-0 transition-transform group-hover:-translate-x-0.5"
                strokeWidth={2.25}
                aria-hidden
              />
              {backLabel}
            </Link>

            <div className={hasImage ? gridWithImageClasses : gridNoImageClasses}>
              {hasImage ? (
                <div className={imageColClasses}>
                  <InfopageImageDisplay media={bildData} hideCaptionWhenEmpty />
                </div>
              ) : null}

              <div
                className={
                  `${proseColumnClasses} w-full min-w-0 ` +
                  (!hasImage ? 'mx-auto w-full max-w-[54ch]' : '')
                }
              >
                <h1 className={newsTitleClasses}>{headline}</h1>
                <NewsMetaDates data={props.page} variant="article" />
                <div className={newsBodyClasses}>
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                  {props.page?.Beskrivning}
                </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
