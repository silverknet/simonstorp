/**
 * Nyhetsbeskrivning i kort (homepage / lista) renderas inte som markdown.
 * Rå syntax för länkar ser då ful ut — ersätt `[label](url)` med `[label]`.
 */
export function plainNewsTeaserText(raw) {
  if (raw == null) return '';
  return String(raw).replace(/\[([^\]]*)\]\([^)]*\)/g, '[$1]');
}
