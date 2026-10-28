/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  // optional: turns on App Check
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// read by Firebase App Check in development
// eslint-disable-next-line no-var
declare var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
