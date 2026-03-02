import { initializeApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const env = import.meta.env as Record<string, string>;

// Kiểm tra env vars có đầy đủ và không phải placeholder
export const isFirebaseConfigured: boolean =
  !!env.VITE_FIREBASE_API_KEY &&
  !!env.VITE_FIREBASE_DATABASE_URL &&
  !!env.VITE_FIREBASE_PROJECT_ID &&
  !env.VITE_FIREBASE_API_KEY.includes('your_') &&
  !env.VITE_FIREBASE_API_KEY.includes('_here');

let _db: Database | null = null;

// Chỉ khởi tạo Firebase khi đã có đủ config
if (isFirebaseConfigured) {
  try {
    const app = initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: env.VITE_FIREBASE_DATABASE_URL,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    });
    _db = getDatabase(app);
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
}

export { _db as db };
