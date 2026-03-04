// PM2 config for planthesia.in (VPS: 2.57.91.91)
// Keys are loaded from .env.local — DO NOT add them here
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
            },
        },
    ],
}
