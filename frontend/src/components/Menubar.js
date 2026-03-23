import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import useFetch from '../hooks/useFetch';
import useWindowDimensions from '../hooks/getWindowDimensions';
import { getCategoryFromPage, getStrapiItems, toValidUrl } from '../utils/utils';
import { absoluteMediaUrl, getStrapiMedia } from '../utils/strapiMedia';
import apiBaseUrl from '../config/apiBaseUrl';

import { ChevronDown, Menu, X } from 'lucide-react';

import ErrorScreen from './ErrorScreen';
import fblogo from '../assets/img/fblogo.png';

const sortByRank = (pages = []) =>
  [...pages].sort((a, b) => a.rank - b.rank);

/**
 * Minimum height for the info-page layout spacer (matches fixed header reserve).
 * Prevents content from jumping up under the bar when the measured height is still
 * updating (menu toggle, compact scroll, resize) or briefly reads low.
 * Phone uses a smaller floor (~collapsed top row); desktop keeps more headroom.
 */
const MIN_INFO_HEADER_RESERVE_DESKTOP_PX = 168;
const MIN_INFO_HEADER_RESERVE_MOBILE_PX = 64;

export default function Menubar({
  categories,
  pages,
  setCurrentPage,
  currentPage,
  set_loc: setLoc,
  loc,
}) {
  const [activeID, setActiveID] = useState(-1);
  const [menuDown, setMenuDown] = useState(false);
  const [small, setSmall] = useState(false);
  const [reservedHeaderHeight, setReservedHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const topnavRef = useRef(null);
  const desktopNavMeasureRef = useRef(null);
  const [desktopOverflowIds, setDesktopOverflowIds] = useState(() => new Set());

  const { loading, error, data } = useFetch(`${apiBaseUrl}/api/static-bar?populate=%2A`);
  const { width } = useWindowDimensions();
  const location = useLocation();

  const isDesktop = width > 800;
  const minInfoHeaderReservePx = isDesktop
    ? MIN_INFO_HEADER_RESERVE_DESKTOP_PX
    : MIN_INFO_HEADER_RESERVE_MOBILE_PX;
  const isHome = loc === 1;
  const isInfo = !isHome;
  const isCompactDesktop = isDesktop && isInfo && small;
  const isFixed = !isDesktop || isInfo;
  const pageItems = useMemo(
    () => (Array.isArray(pages?.data?.data) ? pages.data.data : []),
    [pages?.data?.data]
  );
  const categoryItems = useMemo(
    () => (Array.isArray(categories?.data?.data) ? categories.data.data : []),
    [categories?.data?.data]
  );
  const staticBarData = useMemo(() => data?.data ?? {}, [data?.data]);

  const activeCategory = useMemo(
    () => getCategoryFromPage(pageItems, currentPage),
    [currentPage, pageItems]
  );
  const overflowCategoryItems = useMemo(
    () => categoryItems.filter((category) => desktopOverflowIds.has(String(category.id))),
    [categoryItems, desktopOverflowIds]
  );
  const visibleDesktopCategoryItems = useMemo(
    () => categoryItems.filter((category) => !desktopOverflowIds.has(String(category.id))),
    [categoryItems, desktopOverflowIds]
  );

  useEffect(() => {
    const handleScroll = () => {
      setSmall(window.pageYOffset > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const pageID =
      pageItems.find(
        (page) => toValidUrl(page.title) === location.pathname.slice(1)
      )?.id ?? -1;

    setCurrentPage(pageID);
  }, [location.pathname, pageItems, setCurrentPage]);

  useEffect(() => {
    setLoc(location.pathname === '/' ? 1 : 0);
    setMenuDown(false);
    setActiveID(-1);
  }, [location.pathname, setLoc]);

  useEffect(() => {
    if (!isInfo) {
      setReservedHeaderHeight(0);
    }
  }, [isInfo]);

  const categoryCount = categoryItems.length;

  useLayoutEffect(() => {
    if (!isDesktop || categories.loading || loading || error || categories.error || categoryCount === 0) {
      setDesktopOverflowIds(new Set());
      return undefined;
    }

    const measureNavOverflow = () => {
      const container = topnavRef.current;
      const measure = desktopNavMeasureRef.current;
      if (!container || !measure) return;

      const items = Array.from(measure.querySelectorAll('[data-desktop-measure-item]'));
      const moreItem = measure.querySelector('[data-desktop-more-item]');
      if (items.length === 0) {
        setDesktopOverflowIds(new Set());
        return;
      }

      const containerWidth = container.getBoundingClientRect().width;
      const moreWidth = Math.ceil(moreItem?.getBoundingClientRect().width ?? 0);
      const tolerancePx = 4;
      let usedWidth = 0;
      const next = new Set();

      for (let index = 0; index < items.length; index += 1) {
        const el = items[index];
        const id = el.getAttribute('data-category-id');
        if (id == null) continue;

        const itemWidth = Math.ceil(el.getBoundingClientRect().width);
        const remainingAfter = items.length - index - 1;
        const reserveWidth = remainingAfter > 0 ? moreWidth : 0;

        if (usedWidth + itemWidth + reserveWidth <= containerWidth - tolerancePx) {
          usedWidth += itemWidth;
          continue;
        }

        for (let overflowIndex = index; overflowIndex < items.length; overflowIndex += 1) {
          const overflowId = items[overflowIndex].getAttribute('data-category-id');
          if (overflowId != null) next.add(overflowId);
        }
        break;
      }

      setDesktopOverflowIds((prev) => {
        if (prev.size !== next.size) return next;
        for (const id of next) {
          if (!prev.has(id)) return next;
        }
        return prev;
      });
    };

    measureNavOverflow();
    const raf = requestAnimationFrame(measureNavOverflow);
    const ro = new ResizeObserver(() => measureNavOverflow());
    if (topnavRef.current) {
      ro.observe(topnavRef.current);
    }
    if (desktopNavMeasureRef.current) {
      ro.observe(desktopNavMeasureRef.current);
    }
    window.addEventListener('resize', measureNavOverflow);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measureNavOverflow);
    };
  }, [
    isDesktop,
    width,
    categoryCount,
    categories.loading,
    loading,
    error,
    categories.error,
    location.pathname,
    isHome,
    isCompactDesktop,
    small,
    menuDown,
    categoryItems,
  ]);

  /**
   * Spacer tracks the fixed header height, with a minimum floor so `.App` content
   * does not jump when the navbar height changes (still no monotonic-only-increase:
   * we always use max(measured, MIN), not max(previous, measured)).
   */
  useLayoutEffect(() => {
    if (!isInfo) {
      return undefined;
    }

    const el = headerRef.current;
    if (!el) {
      return undefined;
    }

    const updateHeight = () => {
      const raw = headerRef.current?.getBoundingClientRect().height ?? 0;
      const nextHeight =
        raw > 0 ? Math.max(raw, minInfoHeaderReservePx) : minInfoHeaderReservePx;
      setReservedHeaderHeight(nextHeight);
    };

    updateHeight();
    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(el);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [
    isCompactDesktop,
    isDesktop,
    isInfo,
    menuDown,
    minInfoHeaderReservePx,
    categories.loading,
    loading,
  ]);

  if (categories.loading) {
    return <p></p>;
  }
  if (categories.error) {
    return (
      <ErrorScreen
        compact
        title="Menyn kunde inte laddas"
        description="Kategorier kunde inte hämtas. Ladda om sidan."
      />
    );
  }
  if (loading) {
    return <p></p>;
  }
  if (error) {
    return (
      <ErrorScreen
        compact
        title="Menyraden kunde inte laddas"
        description="Logotyp eller statisk data saknas. Ladda om sidan."
      />
    );
  }

  const logoUrl =
    absoluteMediaUrl(
      getStrapiMedia(staticBarData.logo)?.formats?.large?.url ??
      getStrapiMedia(staticBarData.logo)?.url ??
      ''
    );

  const shellClassName = [
    'w-full',
    isFixed ? 'fixed left-0 top-0 z-20' : '',
    !isDesktop ? 'bg-[var(--bg-white)]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClassName = [
    'w-full',
    // Homepage only: match .App column — var(--width), e.g. 70% desktop; 100% @max-width 800px in CSS
    isHome ? (isDesktop ? 'mx-auto box-border w-[var(--width)]' : 'mx-auto box-border w-full') : '',
    'transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-out',
    (!isDesktop || isInfo) ? 'bg-[var(--bg-white)]' : '',
    !isDesktop ? 'border-b border-black/10 shadow-[0_4px_18px_rgba(0,0,0,0.06)]' : '',
    isCompactDesktop
      ? 'shadow-sm backdrop-blur-lg bg-white/75 supports-[backdrop-filter]:bg-white/65'
      : '',
    isDesktop && isInfo && !isCompactDesktop ? 'border-b border-neutral-200' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderHeader = () => {
    const headerClassName = [
      'flex',
      'justify-between',
      'w-full',
      'min-w-0',
      'transition-[padding,margin] duration-300 ease-out',
      isCompactDesktop || !isDesktop ? 'flex-row items-center' : 'flex-col',
    ]
      .filter(Boolean)
      .join(' ');

    const topRowClassName = [
      'inline-flex',
      'items-center',
      'justify-between',
      'transition-[height,padding] duration-300 ease-out',
      !isDesktop
        ? 'h-16 w-full gap-3 px-3.5 py-0'
        : isCompactDesktop
          ? 'w-auto shrink-0 justify-start pl-5 pr-0 py-0'
          : 'w-full px-5 pt-6 pb-1',
    ]
      .filter(Boolean)
      .join(' ');

    const logoClassName = [
      'transition-[width,margin,transform] duration-200',
      !isDesktop ? 'm-0 w-[8.75rem]' : '',
      isDesktop && !isCompactDesktop ? 'mt-2 mb-7 w-52' : '',
      isDesktop && isCompactDesktop ? 'm-0 mr-10 w-28' : '',
      'hover:cursor-pointer',
    ]
      .filter(Boolean)
      .join(' ');

    const topnavClassName = [
      'flex',
      'h-fit',
      'min-w-0',
      'text-[var(--main-text)]',
      'transition-[margin,max-height,opacity] duration-300 ease-out',
      isDesktop
        ? `${isCompactDesktop ? 'flex-1 pr-5' : 'w-full'} min-w-0 flex-row flex-wrap justify-center gap-0`
        : 'absolute left-0 top-full z-[2] w-full flex-col flex-nowrap rounded-b-2xl border-t border-black/10 bg-white/95 shadow-[0_16px_32px_rgba(0,0,0,0.08)] backdrop-blur-md',
      !isDesktop && !menuDown ? 'invisible max-h-0 overflow-hidden opacity-0' : '',
      !isDesktop && menuDown ? 'visible max-h-[calc(100vh-4.75rem)] overflow-y-auto opacity-100' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const desktopCategoryShellClass =
      'group relative flex h-16 w-40 shrink-0 cursor-pointer items-stretch justify-center font-medium';
    const desktopCategoryLabelClass =
      'flex h-full w-full items-center justify-center px-3 text-center font-["IBM_Plex_Sans",sans-serif] text-sm font-normal uppercase leading-tight transition-colors group-hover:text-[var(--accent-one)]';
    const desktopPageRowClass =
      'group/submenu flex min-h-[44px] w-full items-center px-5 py-0 transition-colors';
    const desktopPageTextClass =
      'm-0 w-full text-left text-sm leading-snug transition-all group-hover/submenu:text-[var(--accent-one)]';

    return (
      <div className={headerClassName}>
        <div className={topRowClassName}>
          {!isDesktop ? (
            <button
              type="button"
              aria-expanded={menuDown}
              aria-label={menuDown ? 'Stäng meny' : 'Öppna meny'}
              onClick={() => setMenuDown((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-full p-0 text-[var(--main-text)] transition hover:bg-black/5"
            >
              {menuDown ? (
                <X className="h-7 w-7 shrink-0" strokeWidth={2} aria-hidden />
              ) : (
                <Menu className="h-7 w-7 shrink-0" strokeWidth={2} aria-hidden />
              )}
            </button>
          ) : !isCompactDesktop ? (
            <span className="invisible block h-7 w-7" aria-hidden />
          ) : null}

          <Link to="/">
            <img className={logoClassName} src={logoUrl} alt="Simonstorp logo" />
          </Link>

          <a
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-300 hover:bg-black/5 hover:cursor-pointer',
              isDesktop ? 'hover:scale-110' : '',
              isCompactDesktop ? 'hidden' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            href="http://www.facebook.com/simonstorparna"
          >
            <img className={!isDesktop ? 'w-5' : 'w-8'} src={fblogo} alt="Facebook" />
          </a>
        </div>

        {isDesktop ? (
          <div
            ref={desktopNavMeasureRef}
            className="pointer-events-none absolute left-0 top-0 -z-10 flex opacity-0"
            aria-hidden="true"
          >
            {categoryItems.map((category) => (
              <div
                key={`measure-${category.id}`}
                className={desktopCategoryShellClass}
                data-desktop-measure-item="true"
                data-category-id={String(category.id)}
              >
                <p className={desktopCategoryLabelClass}>
                  <span className="block max-w-full [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {category.title}
                  </span>
                </p>
              </div>
            ))}
            <div className={desktopCategoryShellClass} data-desktop-more-item="true">
              <p className={desktopCategoryLabelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <span>Fler</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} aria-hidden />
                </span>
              </p>
            </div>
          </div>
        ) : null}

        <div ref={topnavRef} className={topnavClassName}>
          {(isDesktop ? visibleDesktopCategoryItems : categoryItems).map((category, index) => {
            const isCategoryActive = activeCategory === category.id;
            const isMobileExpanded = activeID === index;
            const categoryIdStr = String(category.id);
            const itemClassName = [
              'group',
              'relative',
              'transition-colors',
              isDesktop
                ? desktopCategoryShellClass
                : 'w-full border-b border-black/5 text-left',
              !isDesktop && isMobileExpanded
                ? 'bg-[var(--main-text)] text-[var(--bg-white)]'
                : '',
              isDesktop
                ? isCategoryActive
                  ? 'border-b border-[var(--accent-one)] text-[var(--accent-one)]'
                  : ''
                : '',
            ]
              .filter(Boolean)
              .join(' ');

            const dropdownClassName = [
              'overflow-hidden',
              isDesktop
                ? 'absolute left-0 top-full z-[2] w-64 min-w-40 rounded-b-md bg-[#F9F9F9] shadow-md invisible max-h-0 group-hover:visible group-hover:max-h-[min(100vh,32rem)]'
                : 'relative left-auto top-auto z-[3] w-full min-w-0 rounded-b-md bg-[var(--fancy-green)] shadow-inner',
              !isDesktop && !isMobileExpanded ? 'invisible max-h-0' : '',
              !isDesktop && isMobileExpanded ? 'visible max-h-[min(100vh,32rem)]' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={category.id}
                className={itemClassName}
                data-category-id={categoryIdStr}
                {...(isDesktop ? { 'data-desktop-nav-item': 'true' } : {})}
                onClick={() => {
                  if (!isDesktop) {
                    setActiveID((current) => (current === index ? -1 : index));
                  }
                }}
              >
                <p
                  className={[
                    isDesktop
                      ? desktopCategoryLabelClass
                      : 'm-0 px-4 py-4 text-left',
                    !isDesktop ? 'font-["IBM_Plex_Sans",sans-serif] text-sm font-normal uppercase transition-colors' : '',
                    !isDesktop && isMobileExpanded ? 'text-[var(--bg-white)]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span
                    className={
                      isDesktop
                        ? 'block max-w-full [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]'
                        : ''
                    }
                  >
                    {category.title}
                  </span>
                </p>

                <div className={dropdownClassName}>
                  {sortByRank(getStrapiItems(category.pages)).map((page) => {
                    const isPageActive =
                      location.pathname === `/${toValidUrl(page.title)}`;

                    return (
                      <Link
                        key={page.id}
                        to={`/${toValidUrl(page.title)}`}
                        className="block w-full"
                      >
                        <div
                          className={[
                            isDesktop ? desktopPageRowClass : 'group/submenu flex min-h-[44px] w-full items-center px-5 py-0 transition-colors',
                            isDesktop
                              ? isPageActive
                                ? 'bg-[var(--accent-one)]/10 text-black'
                                : 'text-black hover:bg-[var(--accent-one)]/10'
                              : 'px-0 py-3 text-[var(--bg-white)]',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            setMenuDown(false);
                            setActiveID(-1);
                          }}
                        >
                          <p
                            className={[
                              isDesktop ? desktopPageTextClass : 'm-0 w-full text-sm leading-snug transition-all',
                              isDesktop
                                ? 'text-left'
                                : 'px-6 font-["Lato",sans-serif] uppercase hover:pl-7 hover:text-[var(--accent-one)]',
                              isPageActive ? 'text-[var(--accent-one)]' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {page.title}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {isDesktop && overflowCategoryItems.length > 0 ? (
            <div
              className={[
                desktopCategoryShellClass,
                overflowCategoryItems.some((category) => category.id === activeCategory)
                  ? 'border-b border-[var(--accent-one)] text-[var(--accent-one)]'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <p className={desktopCategoryLabelClass}>
                <span className="inline-flex items-center gap-1.5">
                  <span>Fler</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} aria-hidden />
                </span>
              </p>

              <div className="invisible absolute right-0 top-full z-[2] max-h-0 w-[22rem] overflow-hidden rounded-b-md bg-[#F9F9F9] shadow-md group-hover:visible group-hover:max-h-[min(100vh,36rem)]">
                {overflowCategoryItems.map((category) => (
                  <div key={`overflow-${category.id}`} className="border-t border-black/5 first:border-t-0">
                    <p className="m-0 bg-black/[0.02] px-5 py-3 font-['IBM_Plex_Sans',sans-serif] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--grey-text)]">
                      {category.title}
                    </p>
                    {sortByRank(getStrapiItems(category.pages)).map((page) => {
                      const isPageActive =
                        location.pathname === `/${toValidUrl(page.title)}`;

                      return (
                        <Link
                          key={`overflow-page-${page.id}`}
                          to={`/${toValidUrl(page.title)}`}
                          className="block w-full"
                        >
                          <div
                            className={[
                              desktopPageRowClass,
                              isPageActive
                                ? 'bg-[var(--accent-one)]/10 text-black'
                                : 'text-black hover:bg-[var(--accent-one)]/10',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            <p
                              className={[
                                desktopPageTextClass,
                                'px-2',
                                isPageActive ? 'text-[var(--accent-one)]' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {page.title}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const infoPageSpacerHeight = isInfo
    ? Math.max(reservedHeaderHeight, minInfoHeaderReservePx)
    : 0;

  return (
    <div>
      {isInfo ? <div style={{ height: infoPageSpacerHeight }} aria-hidden="true" /> : null}
      <div className={shellClassName}>
        <div ref={headerRef} className={wrapperClassName}>
          {renderHeader()}
        </div>
      </div>
    </div>
  );
}
