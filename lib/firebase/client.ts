import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Only initialize Firebase in the browser. This prevents server-side
// initialization during SSR where env vars may be missing and causes a 500.
let app: any = null
let auth: any = null
let db: any = null

if (typeof window !== "undefined") {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        auth = getAuth(app)
        db = getFirestore(app)
        // Optional: expose for debugging in dev only
        if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.debug("Firebase initialized (client)", { projectId: firebaseConfig.projectId })
        }
    } catch (e) {
        // Don't crash the server or client render — fall back gracefully
        // eslint-disable-next-line no-console
        console.warn("Firebase initialization failed:", e)
    }
}

export { auth, db }
export default app
