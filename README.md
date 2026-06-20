<div align="center">

# 🌱 Midori: Your Productive Garden

*A nature-inspired productivity sanctuary for deep focus, task management, and collaborative, AI-powered growth.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e.svg?style=for-the-badge)](LICENSE)

<br/>

![Midori Demo Animation](./public/assets/download.gif)

<br/>

> **Midori** is an offline-first, real-time gamified productivity app that turns your daily workflow into a garden. Cultivate plants, earn resources, and focus deeply with custom environmental soundscapes.

</div>

---

## ✨ Features

### 🌸 Core Productivity
*   📅 **Time-Blocking Calendar**: Map out your day hour-by-hour using an interactive schedule calendar.
*   🍅 **Zen Focus Timer**: Pomodoro timer integrated with **Rain, Forest, Ocean & Fireplace** soundscapes and customizable audio settings.
*   📊 **Analytics Dashboard**: Dive into productivity patterns, completion statistics, and streak tracking.
*   🤖 **Gemini AI Coach**: Get tailored advice, schedule suggestions, and positive reinforcement from the AI growth assistant.
*   ⚙️ **Data Sovereignty**: 1-click JSON export/import of all user preferences, tasks, and history.

### 🍃 Newly Added Advanced Features
*   🧘 **Guided Box Breathing Sanctuary**: A circular breath pacer (4s inhale, 4s hold, 4s exhale, 4s hold) built into the side panel. Completing breathing exercises rewards you with **+15 Sunlight** and **+15 Water** to grow your garden.
*   📋 **Collapsible Sub-Task Checklists**: Break down complex goals into granular sub-tasks. Features live progress bars, quick-add input fields, and inline deletion.
*   🏆 **Co-op Master Board**: Collaborate on shared team gardens. Track contributions via the **Contribution Leaderboard** and leave customized notes on the interactive **Wooden Signs** board.
*   🔄 **Cross-Tab Real-Time Sync**: Fully reactive state synchronization using browser storage event broadcasting. Updates in one tab instantly mirror to all other open tabs in real time.
*   ❄️🍂 **Seasonal Weather Particles**: Interactive pollen, rain, snow, and leaf drift matching the seasonal mood, enhancing focus immersion.

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Radix UI + Lucide Icons |
| **State & Sync** | React Context + Window Storage Event Sync |
| **Database & Auth** | Firebase Cloud Firestore + Firebase Authentication |
| **Artificial Intelligence** | Google Gemini (Pro/Flash API) |
| **Data Validation** | Zod Schema Validation |
| **Charts** | Recharts |

</div>

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Chaitanyahoon/Midori.git
    cd Midori
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment variables**
    Create a `.env.local` file in the root directory:
    ```bash
    cp .env.example .env.local
    ```
    Add your Firebase credentials and Gemini API Key:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    GEMINI_API_KEY=your_gemini_key
    ```

4.  **Start the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view Midori in action! 🌿

---

## 📂 Project Architecture

```
📁 Midori/
├── 📁 app/                    # Next.js App Router Pages & API routes
│   ├── 📁 api/growth-ai/      # Gemini API integrations and rate limiting
│   ├── 📁 dashboard/          # Tasks, Calendar, Insights, Pomodoro, Co-op
│   └── 📄 layout.tsx          # App layouts & Service Worker cleanup script
├── 📁 components/             # React component tree
│   ├── 📁 dashboard/          # Feature components (Zen Player, Box Breathing, Co-op)
│   ├── 📁 ui/                 # Shadcn reusable UI components
│   └── 📄 local-data-provider.tsx # Real-time state syncing & LocalStorage fallbacks
├── 📁 lib/                    # Business logic utilities, hooks, and schemas
│   ├── 📁 hooks/              # Custom React hooks (useMusic, usePomodoro, useAnalytics)
│   ├── 📄 schemas.ts          # Zod validation schemas
│   └── 📄 offline-manager.ts  # Queue manager for offline actions
└── 📁 __tests__/              # Jest & Testing Library unit and integration tests
```

For a deeper dive into code details, see the [Architecture Guide](./ARCHITECTURE.md) and [Documentation Index](./DOCUMENTATION.md).

---

## 🤝 Contributing

We welcome contributions to grow this garden! 

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ and a little ☀️ by **Chaitanya**

*If you find this project useful, consider giving it a ⭐ — it helps the garden grow!*

</div>
