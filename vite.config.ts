import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode || 'development', process.cwd(), '');

  // Load firebase-applet-config.json if it exists
  let firebaseConfig: any = {};
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {
    console.warn("Failed to load firebase-applet-config.json in vite.config.ts:", e);
  }

  // Helper to resolve env vars with fallbacks
  const getEnvVar = (key: string, fallback: string) => {
    return process.env[key] || env[key] || fallback;
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(getEnvVar('VITE_FIREBASE_API_KEY', firebaseConfig.apiKey || '')),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain || '')),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId || '')),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket || '')),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId || '')),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_APP_ID', firebaseConfig.appId || '')),
      'import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_FIRESTORE_DATABASE_ID', firebaseConfig.firestoreDatabaseId || '')),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
