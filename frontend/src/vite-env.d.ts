/// <reference types="vite/client" />

// (optional) declare the exact vars you use for nice autocomplete:
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
