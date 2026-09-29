const kofi = (import.meta.env.VITE_KOFI_URL ?? 'https://ko-fi.com/anpaorach').trim()

/** Ko-fi page for the support section. A VITE_KOFI_URL build variable overrides it; an empty one hides the section. */
export const KOFI_URL = /^https:\/\/(www\.)?ko-fi\.com\/\S+/.test(kofi) ? kofi : ''
