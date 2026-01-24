import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;
let db: Firestore;

export function getFirebaseAdmin() {
  if (!app) {
    // Check if already initialized
    if (getApps().length === 0) {
      // Initialize with service account credentials from environment
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccount) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
          "Please add your Firebase service account JSON to .env.local"
        );
      }

      app = initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
    } else {
      app = getApps()[0];
    }
  }

  if (!db) {
    db = getFirestore(app);
  }

  return { app, db };
}
