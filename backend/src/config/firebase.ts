import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    initializeApp();
  }
  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const db = getFirestore();
