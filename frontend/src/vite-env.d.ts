/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // outras variáveis de ambiente expostas pelo Vite podem ser declaradas aqui.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
