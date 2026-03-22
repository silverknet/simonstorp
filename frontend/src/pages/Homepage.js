import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import ImageSlider from '../components/ImageSlider';
import { toValidUrl } from '../utils/utils';

/** Matches `.newsBox:hover` from indextemp.css */
const newsBoxHover =
  'hover:shadow-[7px_7px_15px_rgba(55,84,170,0.07),-6px_-6px_8px_rgb(255,255,255),-6px_-6px_16px_rgb(255,255,255),inset_0px_0px_4px_rgba(255,255,255,0.07),inset_7px_7px_15px_rgba(55,84,170,0),inset_-7px_-7px_20px_rgba(255,255,255,0),0px_0px_4px_rgba(255,255,255,0)] ' +
  'hover:scale-[1.007] hover:cursor-pointer';

export default function Homepage(props) {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setContentVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-[calc(100vh-437px)] pb-0">
      <ImageSlider home={props.homecontent} />

      {/* .home_content: nowrap desktop; wrap @1200px; mobile spacing per indextemp */}
      <div className="flex flex-row flex-nowrap justify-evenly max-[1200px]:flex-wrap max-[800px]:mt-0 max-[800px]:p-0">
        {/* .home_B.b1 */}
        <div
          className={`box-border m-[15px] w-1/2 min-w-[400px] max-w-[750px] max-[1200px]:w-auto max-[800px]:m-0 max-[800px]:min-w-0 max-[800px]:w-full max-[800px]:max-w-none p-[3vh] font-['Heebo',sans-serif] font-light leading-[180%] tracking-wide transition-all duration-700 ease-out max-[800px]:p-0 ${
            contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '140ms' }}
        >
          <h1 className="text-[28px] font-light max-[800px]:mx-[7vw] max-[800px]:mt-[51px] max-[800px]:text-center max-[800px]:leading-[160%]">
            {props.homecontent.data.data.attributes.upper}
          </h1>
          <ReactMarkdown
            className={
              'text-left font-["Heebo",sans-serif] text-base font-light leading-[180%] tracking-wide text-[var(--main-text)] ' +
              '[&_p]:m-0 [&_a]:text-[var(--accent-one)] [&_strong]:font-semibold ' +
              'max-[800px]:m-[35px] max-[800px]:text-[17px]'
            }
          >
            {props.homecontent.data.data.attributes.Huvudtext}
          </ReactMarkdown>
        </div>

        {/* .home_B.b2 — .b2 margin 10px on mobile */}
        <div
          className={`box-border m-[15px] w-1/2 min-w-[400px] max-w-[750px] max-[1200px]:w-auto max-[800px]:m-[10px] max-[800px]:min-w-0 max-[800px]:w-full max-[800px]:max-w-none p-[3vh] font-['Heebo',sans-serif] font-light leading-[180%] tracking-wide transition-all duration-700 ease-out max-[800px]:p-0 ${
            contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{ transitionDelay: '260ms' }}
        >
          {/* .newsContainer */}
          <div className="mt-[11px] flex flex-col">
            {/* .aktuellt-con + .aktuellt */}
            <div className="mb-4 mt-2.5 border-[#b0b0b0] p-0">
              <p className="m-[-3px] ml-[5px] text-[18px] font-light text-[#131313]">
                Aktuellt
              </p>
            </div>

            {props.news.data.data.map((value, index) => {
              if (index >= 2) return null;
              return (
                <Link
                  key={value.id}
                  className={
                    'mb-5 mt-5 flex h-[110px] w-full scale-100 flex-row overflow-hidden rounded-[8px] ' +
                    'bg-[#f9f9f9] text-[var(--main-text)] no-underline shadow-none ' +
                    'transition-all duration-[600ms] ease-out ' +
                    (contentVisible ? 'translate-y-0 opacity-100 ' : 'translate-y-4 opacity-0 ') +
                    newsBoxHover
                  }
                  style={{ transitionDelay: `${340 + index * 140}ms` }}
                  to={'/' + toValidUrl(value.attributes.title)}
                >
                  <div className="flex shrink-0 items-center justify-center p-1">
                    <img
                      className="h-[102px] w-[102px] overflow-hidden rounded-md object-cover"
                      src={value.attributes.Bild.data.attributes.formats.small.url}
                      alt=""
                    />
                  </div>
                  <div className="flex h-full min-w-0 w-full flex-col justify-start gap-1.5 bg-[#f9f9f9] px-4 py-2">
                    <div className="flex min-w-0 items-start justify-between gap-3 text-[var(--main-text)]">
                      <p className="m-0 min-w-0 truncate font-normal leading-[1.2]">
                        {value.attributes.title}
                      </p>
                      <span className="mt-px shrink-0 whitespace-nowrap text-sm leading-[1.2] text-[var(--grey-text)]">
                        {value.attributes.Datum}
                      </span>
                    </div>
                    <p className="m-0 overflow-hidden pr-1 pb-px text-sm leading-[150%] text-[#403939] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                      {value.attributes.Beskrivning}
                    </p>
                  </div>
                </Link>
              );
            })}

            {/* .seeAll-con + .seeAll */}
            <div
              className={`group w-fit px-1 py-0 text-[rgb(57,57,57)] no-underline transition-all duration-700 ease-out hover:cursor-pointer hover:bg-[#f9f9f9] hover:text-[rgb(47,47,47)] ${
                contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
              style={{ transitionDelay: '620ms' }}
            >
              <Link
                className="m-0 block w-fit text-[rgb(54,54,54)] no-underline transition-colors duration-300 group-hover:border-l-2 group-hover:border-[var(--accent-one)] group-hover:pl-[5px]"
                to="/allanyheter"
              >
                Se alla nyheter {'>'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
