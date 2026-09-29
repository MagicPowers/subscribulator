interface ImportMetaEnv {
  /** Ko-fi page shown in the support section, e.g. https://ko-fi.com/yourname */
  readonly VITE_KOFI_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
