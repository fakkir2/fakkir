import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-only. Verifies a Firebase ID token and returns the user's uid, or null.
 * Verification only needs the project id (it checks Google's public keys), so no
 * service-account file is required.
 */
export async function verifyIdToken(token: string): Promise<string | null> {
  try {
    const app = getApps().length
      ? getApp()
      : initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    const decoded = await getAuth(app).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
