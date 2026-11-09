import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./config";

type Services = { auth: Auth; db: Firestore };
let services: Services | null = null;

/** Browser-only singleton. Returns null on the server or when Firebase is not configured. */
export function getFirebase(): Services | null {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
  if (!services) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    services = { auth: getAuth(app), db: getFirestore(app) };
  }
  return services;
}
