// PM2 config for planthesia.in (VPS: 2.57.91.91)
module.exports = {
    apps: [
        {
            name: "planthesia",
            script: ".next/standalone/server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                HOSTNAME: "0.0.0.0",
                GEMINI_API_KEY: "AIzaSyBd4SrCAd-CqdzbRR18UUt7U056AxcO6K8",
                NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyC6wMAS_AmoYgFMkPDaQhD57-s-OpbNJHM",
                NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "planthesia.firebaseapp.com",
                NEXT_PUBLIC_FIREBASE_PROJECT_ID: "planthesia",
                NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "planthesia.firebasestorage.app",
                NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "551863200948",
                NEXT_PUBLIC_FIREBASE_APP_ID: "1:551863200948:web:5ef152c044d37933757be1",
            },
        },
    ],
}
