import useFetch from '../hooks/useFetch'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import apiBaseUrl from '../config/apiBaseUrl'

import ErrorScreen from '../components/ErrorScreen'
import InfopageImageDisplay from '../components/InfopageImageDisplay'

import useWindowDimensions from '../hooks/getWindowDimensions'
import { mediaColumnPercentFromDimensions } from '../utils/infoPageImageLayout'
import { getStrapiItems } from '../utils/utils'

const proseColumnClasses =
  'flex min-w-0 w-full max-w-[68ch] flex-col items-stretch max-[960px]:max-w-[min(68ch,100%)]'

/* Typography via tailwind.config.js fontFamily.info-title / info-body (matches .big_text / .small_text) */
const titleBase =
  'w-full text-left font-info-title text-[25px] font-normal leading-[1.28] tracking-[0.04rem] text-[var(--grey-text)] antialiased ' +
  'max-[800px]:text-[29px] max-[800px]:font-light max-[800px]:text-left'

const titleWithMeta = `${titleBase} mb-1`
const titleSolo = `${titleBase} mb-[25px]`

const updatedLineClasses =
  'mb-6 mt-0 w-full text-left font-info-body text-[0.8125rem] font-light leading-[180%] tracking-[1px] text-[rgba(34, 34, 34, 0.51)] antialiased ' +
  'max-[800px]:text-sm'

const proseMarkdownClasses =
  'text-left font-info-body text-[16px] font-light leading-[180%] tracking-[0.5px] text-[var(--main-text)] antialiased ' +
  '[&_p]:mt-0 [&_p]:mb-[1em] [&_p:last-child]:mb-0 ' +
  '[&_ul]:mb-[1em] [&_ol]:mb-[1em] [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1 ' +
  '[&_h1]:mt-5 [&_h2]:mt-5 [&_h3]:mt-5 [&_h4]:mt-5 [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 [&_h4]:mb-2 ' +
  '[&_h1]:font-medium [&_h2]:font-medium [&_h3]:font-medium [&_h4]:font-medium ' +
  '[&_h1:first-child]:mt-0 [&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0 [&_h4:first-child]:mt-0 ' +
  'max-[800px]:m-0 max-[800px]:text-[17px]'

const styrelseSectionClasses =
  'mt-12 w-full max-w-[min(68ch,100%)] space-y-5 border-t border-black/[0.08] pt-8 antialiased ' +
  'mx-auto max-[800px]:mt-10 max-[800px]:space-y-4 max-[800px]:pt-6'

const styrelseIntroClasses =
  'm-0 text-left font-info-body text-lg font-normal leading-snug tracking-[1px] text-[var(--grey-text)] ' +
  'max-[800px]:text-base'

const styrelseCardClasses =
  'rounded-xl border border-black/[0.08] bg-[var(--bg-white-accent)] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ' +
  'transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]'

const styrelseNameClasses =
  'm-0 font-info-body text-[17px] font-medium leading-snug tracking-[1px] text-[var(--main-text)]'

const styrelseRoleClasses =
  'mt-2 mb-0 font-info-body text-[15px] font-light leading-relaxed tracking-[1px] text-[var(--grey-text)]'

const styrelseEmailClasses =
  'mt-2 inline-block max-w-full break-words font-info-body text-[15px] font-light tracking-[1px] ' +
  'text-[var(--accent-one)] underline decoration-[var(--accent-one)]/30 underline-offset-2 hover:decoration-[var(--accent-one)]'

/** Strapi `updatedAt` ISO string → Swedish date/time, or null */
function formatSwedishUpdatedAt(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d)
}

export default function Infopage(props) {
  const { loading, error, data } = useFetch(
    props.documentId
      ? `${apiBaseUrl}/api/pages/${props.documentId}?populate=%2A&sort=rank:asc`
      : null
  )

  const pageData = data?.data

  const membersUrl =
    pageData?.title === 'Styrelsen'
      ? apiBaseUrl + '/api/styrelsemedlems?sort=rank:asc'
      : null

  const { loading: membersLoading, error: membersError, data: members } =
    useFetch(membersUrl)

  const [centerFormat, setCenterFormat] = useState(false)
  const [imageDims, setImageDims] = useState({})
  const { width } = useWindowDimensions()
  const isNarrowGrid = width <= 960

  useEffect(() => {
    if (!data) return
    getStrapiItems(pageData?.img).length > 0
      ? setCenterFormat(false)
      : setCenterFormat(true)
  }, [data, pageData])

  useLayoutEffect(() => {
    if (!data) return
    window.scrollTo(0, 0)
  }, [data])

  useEffect(() => {
    setImageDims({})
  }, [props.documentId])

  const onImageDimensions = useCallback((imageId, w, h) => {
    setImageDims((prev) => ({ ...prev, [imageId]: { w, h } }))
  }, [])

  const mediaColPercent = useMemo(
    () => mediaColumnPercentFromDimensions(imageDims),
    [imageDims]
  )

  if (error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda sidan"
        description="Innehållet kunde inte hämtas. Försök igen om en stund."
      />
    );
  }
  if (loading) {
    return <p></p>
  }
  if (!data) {
    return (
      <ErrorScreen
        title="Sidan finns inte"
        description="Det finns inget innehåll att visa här."
      />
    );
  }
  if (pageData?.title === 'Styrelsen' && membersLoading && !membersError) {
    return <p></p>
  }
  if (pageData?.title === 'Styrelsen' && membersError) {
    return (
      <ErrorScreen
        title="Kunde inte ladda styrelsen"
        description="Styrelsemedlemmar kunde inte hämtas just nu."
      />
    );
  }

  const images = getStrapiItems(pageData?.img)
  const hasImages = !centerFormat && images && images.length > 0
  const isStyrelse = pageData?.title === 'Styrelsen'

  const gridStyle =
    hasImages && !isNarrowGrid
      ? {
          '--info-media-col': `${mediaColPercent}%`,
          gridTemplateColumns: 'var(--info-media-col) minmax(0, 1fr)',
        }
      : hasImages && isNarrowGrid
        ? { gridTemplateColumns: '1fr' }
        : undefined

  const updatedLabel = formatSwedishUpdatedAt(pageData?.updatedAt)
  const titleClasses = updatedLabel ? titleWithMeta : titleSolo

  const proseBlock = (
    <div className={proseMarkdownClasses} lang="sv">
      <ReactMarkdown>{pageData?.Huvudtext}</ReactMarkdown>
    </div>
  )

  return (
    <div className="w-full pb-0 pt-4">
      <div className="box-border flex w-full flex-col items-center">
        <article
          className={
            'box-border mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 pt-5 pb-12 ' +
            'max-[800px]:pt-4 max-[800px]:pb-8'
          }
        >
          {hasImages ? (
            <div
              className={
                'grid w-full max-w-full items-start gap-x-[clamp(1.5rem,4vw,2.5rem)] gap-y-6 ' +
                'max-[960px]:grid-cols-1 max-[960px]:gap-6'
              }
              style={gridStyle}
            >
              <div className="flex min-w-0 w-full flex-col gap-6">
                {images.map((value) => (
                  <InfopageImageDisplay
                    key={value.id}
                    media={value}
                    onDimensions={onImageDimensions}
                  />
                ))}
              </div>
              <div className={`${proseColumnClasses} mx-auto`}>
                <h1 className={titleClasses}>{pageData?.title}</h1>
                {updatedLabel ? (
                  <p className={updatedLineClasses} lang="sv">
                    Senast uppdaterad: {updatedLabel}
                  </p>
                ) : null}
                {proseBlock}
              </div>
            </div>
          ) : (
            <div className={`${proseColumnClasses} mx-auto w-full`}>
              <h1 className={titleClasses}>{pageData?.title}</h1>
              {updatedLabel ? (
                <p className={updatedLineClasses} lang="sv">
                  Senast uppdaterad: {updatedLabel}
                </p>
              ) : null}
              {proseBlock}
            </div>
          )}

          {isStyrelse ? (
            <section className={styrelseSectionClasses} aria-labelledby="styrelse-members-heading">
              <h2 id="styrelse-members-heading" className={styrelseIntroClasses}>
                Styrelsen består av
              </h2>
              <ul className="m-0 list-none space-y-3 p-0">
                {members.data.map((value) => {
                  const name = value.Forefternamn ?? ''
                  const role = value.Roll ?? ''
                  const emailRaw = (value.Mejladress ?? '').trim()
                  const emailIsMail = emailRaw.includes('@')

                  return (
                    <li key={value.id} className={styrelseCardClasses}>
                      {name ? <p className={styrelseNameClasses}>{name}</p> : null}
                      {role ? <p className={styrelseRoleClasses}>{role}</p> : null}
                      {emailRaw ? (
                        emailIsMail ? (
                          <a href={`mailto:${emailRaw}`} className={styrelseEmailClasses}>
                            {emailRaw}
                          </a>
                        ) : (
                          <p className={`${styrelseRoleClasses} mt-2`}>{emailRaw}</p>
                        )
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </div>
  )
}
