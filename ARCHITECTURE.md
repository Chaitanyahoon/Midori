# 🌱 Midori Project Architecture Guide

**Version:** 1.0
**Last Updated:** March 2024
**Framework:** Next.js 16 • React 19 • TypeScript • Tailwind CSS • Firebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Layers](#architecture-layers)
3. [Directory Structure](#directory-structure)
4. [Core Concepts](#core-concepts)
5. [Data Flow](#data-flow)
6. [Key Technologies](#key-technologies)
7. [Development Patterns](#development-patterns)
8. [Performance Optimization](#performance-optimization)
9. [Security & Infrastructure](#security--infrastructure)
10. [Getting Started for Developers](#getting-started-for-developers)

---

## Project Overview

### What is Midori?

Midori is a **nature-inspired productivity application** that gamifies task management through:
- 🌱 **Visual Garden**: Digital garden that grows with task completion
- 🎯 **Smart Scheduling**: AI-powered daily schedule optimization
- ⏱️ **Focus Sessions**: Pomodoro timer with ambient soundscapes
- 📊 **Analytics**: Deep productivity insights and pattern detection
- 🎵 **Focus Music**: Curated tracks and custom playlist support
- 📱 **Offline-First**: Full functionality without internet connection

### Target Users

- Knowledge workers and students needing focus tools
- Productivity enthusiasts who like tracking
- Users preferring local-first, privacy-respecting apps

---

## Architecture Layers

### 1. **Presentation Layer** (`/app`, `/components`)
Handles UI rendering and user interactions

```
/app
├── page.tsx ..................... Landing/home page
├── layout.tsx ................... Root layout (providers)
├── dashboard/
│   ├── page.tsx ................. Main dashboard
│   ├── layout.tsx ............... Dashboard wrapper with error boundary
│   ├── tasks/ ................... Task management page
│   ├── pomodoro/ ................ Focus timer page
│   ├── calendar/ ................ Task scheduling
│   └── insights/ ................ Analytics dashboard
└── api/ ......................... API routes

/components
├── dashboard/ ................... Dashboard subcomponents (20+)
├── ui/ .......................... Shadcn UI components (80+)
├── garden/ ...................... Canvas visual garden
├── error-boundary.tsx ........... Error handling wrapper
├── offline-indicator.tsx ........ Offline/sync status
└── analytics-dashboard.tsx ...... Analytics UI
```

**Key Pattern:** Client-side rendered components with Next.js App Router

### 2. **Business Logic Layer** (`/lib`)
Contains hooks, utilities, and business rules

```
/lib
├── hooks/ ....................... Custom React hooks (8+)
│   ├── usePomodoro.ts
│   ├── useMusic.ts
│   ├── useAnalytics.ts
│   ├── useOffline.ts
│   └── useValidation.ts
├── schemas.ts ................... Zod validation schemas
├── analytics.ts ................. Stats & pattern detection
├── task-utils.ts ................ Recurrence & scheduling
├── offline-manager.ts ........... Cache & sync queue
├── api-validation.ts ............ API middleware
├── export-utils.ts .............. Data export (JSON/CSV)
├── canvas-optimization.ts ....... Performance utilities
└── toast-utils.ts ............... Notifications
```

**Key Pattern:** Hooks extract logic from components; utilities are pure functions

### 3. **Data Access Layer** (`/components`, Firebase)
Manages data synchronization and persistence

```
/components
└── local-data-provider.tsx ....... Firebase + React Context
    - Real-time Firestore listeners
    - Data sync orchestration
    - State management for app

/lib/firebase
└── client.ts .................... Firebase initialization
```

**Key Pattern:** Context API + Firestore listeners for real-time sync

### 4. **Infrastructure Layer** (Firebase + Vercel)
Cloud services and deployment

```
Firebase Services:
- Auth (Email/Password + Google OAuth)
- Firestore (Real-time database)
- Storage (Custom music tracks)

Vercel:
- Hosting (Next.js deployment)
- Analytics (User behavior)
- Edge Functions (API routes)
```

**Key Pattern:** Serverless architecture with Firebase backend

---

## Directory Structure

```
midori/
├── app/                           # Next.js App Router
│   ├── api/                      # API endpoints
│   │   └── growth-ai/route.ts   # Gemini AI endpoint (with rate limiting)
│   ├── dashboard/                # Protected routes
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root providers
│   ├── error.tsx                # Error boundary
│   └── globals.css              # Global styles
│
├── components/                    # React components
│   ├── dashboard/               # Dashboard features (20+ components)
│   ├── ui/                      # Shadcn UI library (80+ components)
│   ├── garden/                  # Canvas garden visualization
│   ├── auth-provider.tsx        # Firebase auth context
│   ├── local-data-provider.tsx  # Data & state management
│   ├── error-boundary.tsx       # Error handling
│   ├── offline-indicator.tsx    # Offline status UI
│   ├── custom-tracks-manager.tsx # Music track management
│   ├── music-player-components.tsx # Music UI subcomponents
│   └── analytics-dashboard.tsx  # Analytics UI
│
├── lib/                           # Utilities & business logic
│   ├── hooks/                   # Custom React hooks (8+)
│   ├── firebase/
│   │   └── client.ts           # Firebase config
│   ├── analytics.ts            # Analytics calculations
│   ├── task-utils.ts           # Recurrence & patterns
│   ├── offline-manager.ts      # Offline functionality
│   ├── schemas.ts              # Zod validation
│   ├── api-validation.ts       # API middleware
│   ├── export-utils.ts         # Data export
│   ├── store.ts                # Zustand UI store
│   ├── appreciation.ts         # Encouragement messages
│   └── toast-utils.ts          # Notifications
│
├── __tests__/                     # Test files
│   ├── lib/                     # Library tests (3 examples)
│   ├── hooks/                   # Hook tests
│   ├── components/              # Component tests
│   ├── mocks/                   # Mock data & services
│   ├── TESTING_SETUP.md
│   └── COMPREHENSIVE_TESTING_GUIDE.md
│
├── public/                        # Static assets
│   ├── assets/garden/           # Plant images
│   └── midori_logo.png
│
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── next.config.mjs              # Next.js config
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── jest.config.js               # Jest test config (after setup)
└── package.json                 # Dependencies & scripts
```

---

## Core Concepts

### 1. **Real-Time Data Sync**
```typescript
// local-data-provider.tsx uses Firestore listeners
onSnapshot(
  collection(db, `users/${uid}/tasks`),
  (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setTasks(tasks)
  }
)
```

**Flow:**
- User makes change locally
- React state updates immediately (optimistic)
- Change queued for Firestore sync
- Firestore listener pushes realtime update
- Other devices receive update via listeners

### 2. **Offline-First Architecture**
```
Online User Action:
Component → Update State → Save to Firestore → Broadcast

Offline User Action:
Component → Update State → Queue Change → Save to localStorage

Back Online:
App Detects → Sync Queue → Send to Firestore → Broadcast
```

### 3. **AI-Powered Scheduling**
```typescript
// usePomodoro hook + Growth Botanist AI
User's pending tasks → Gemini 2.5 Flash → Optimized schedule → UI display
```

### 4. **Visual Garden Metaphor**
```
Task Completion → Plant Growth
- Daily tasks completed = flowers bloom
- Streak maintained = garden thrives
- Neglected = garden wilts
- Seasonal changes = visual feedback
```

---

## Data Flow

### Task Management Flow

```
┌─────────────────────────────────────────────────────┐
│                  User Interface                     │
│  (TaskList, CalendarView, QuickAdd buttons)        │
└────────────────┬────────────────────────────────────┘
                 │ User Action (add/edit/delete task)
                 ▼
┌─────────────────────────────────────────────────────┐
│            React Component State                    │
│  (Optimistic update, UI feedback)                  │
└────────────────┬────────────────────────────────────┘
                 │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   ONLINE             OFFLINE
   │                     │
   ▼                     ▼
Firestore         localStorage
Real-time        (OfflineManager)
listeners        + SyncQueue
    │                │
    └─────────┬──────┘
              │ ▼ Sync when back online
              │
         ┌────────────┐
         │ Analytics  │ ← Auto-calculate on any change
         │ & Streaks  │
         └────────────┘
```

### Authentication Flow

```
Login Page
  │
  ├─→ Email/Password → Firebase Auth
  │
  └─→ Google Sign-In → Firebase Auth
       │
       ▼
   Auth State Callback (onAuthStateChanged)
       │
       ├─→ Create user document in Firestore
       │
       ├─→ Set auth context (AuthProvider)
       │
       └─→ Enable DataProvider listeners
           (Now has user UID to fetch data)
```

### Analytics Calculation Flow

```
App Startup / Daily:
  │
  ├─→ Get tasks from Firestore
  ├─→ Get pomodoros from Firestore
  │
  ├─→ useAnalytics hook:
  │   ├─→ calculateDailyStats()
  │   ├─→ calculateWeeklyStats()
  │   ├─→ calculateMonthlyStats()
  │   ├─→ detectProductivityPattern()
  │   ├─→ calculateStreak()
  │   └─→ generateInsights()
  │
  └─→ Update analytics state
      └─→ Render analytics dashboard
```

---

## Key Techn technologies

### Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 | React meta-framework, SSR, routing |
| **Language** | TypeScript | Type safety, developer experience |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Components** | Shadcn/UI | Headless, accessible UI components |
| **State** | React Context | App-wide state management |
| **Local State** | Zustand | UI micro-state (sidebar, modals) |
| **Forms** | React Hook Form | Form state & validation |
| **Validation** | Zod | Schema validation, type inference |
| **Charts** | Recharts | Data visualization |
| **Theme** | next-themes | Dark mode management |

### Backend/Services

| Service | Purpose | Auth |
|---------|---------|------|
| **Firebase Auth** | User authentication | Email/Password, Google OAuth |
| **Firestore** | Real-time database | User-based security rules |
| **Firebase Storage** | Custom track uploads | User UID-based access |
| **Google Gemini** | AI scheduling & chat | API key (backend only) |
| **Vercel** | Hosting & deployment | GitHub integration |

### Development Tools

```json
{
  "react": "^19.0.0",
  "next": "^16.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "@hookform/resolvers": "^3.9.0",
  "zod": "^3.24.0",
  "firebase": "^10.7.0",
  "zustand": "^4.4.0",
  "next-themes": "^0.2.0",
  "recharts": "^2.12.0"
}
```

---

## Development Patterns

### Component Patterns

#### 1. **Container Component** (Connects to data)
```typescript
// Responsible for: data fetching, state management, orchestration
export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useData()
  // Passes data to presentational components
  return <TaskList tasks={tasks} on ChangeTasks={...} />
}
```

#### 2. **Presentational Component** (Pure UI)
```typescript
// Responsible for: rendering, user interactions, styling
interface TaskListProps {
  tasks: Task[]
  onTaskClick: (id: string) => void
}
export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  // No data fetching, pure presentation
  return <div>{tasks.map(task => ...)}</div>
}
```

#### 3. **Hook Pattern** (Logic extraction)
```typescript
// Responsible for: stateful logic, side effects, memoization
export function useTaskFiltering(tasks: Task[]) {
  const [filter, setFilter] = useState('all')
  const filtered = useMemo(() => {
    // Filter logic
  }, [tasks, filter])
  return { filtered, filter, setFilter }
}
```

### Error Handling Pattern

```typescript
// 1. Error Boundary wraps feature areas
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>

// 2. API routes handle errors gracefully
try {
  // Process request
  return Response.json(data)
} catch (error) {
  return Response.json({ error: message }, { status: 500 })
}

// 3. Hooks show user-friendly toasts
const { toast } = useToast()
try {
  await addTask(data)
} catch (error) {
  toast({ title: "Failed", variant: "destructive" })
}
```

### Validation Pattern

```typescript
// 1. Define schema
const TaskSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
})

// 2. Use in React Hook Form
const { register, formState: { errors } } = useForm({
  resolver: zodResolver(TaskSchema),
})

// 3. Validate in API
const { data, error } = await validateRequestBody(request, TaskSchema)
if (error) return apiErrorResponse(error.message, error.status)
```

---

## Performance Optimization

### 1. **Code Splitting**
- `React.lazy()` for route components
- Dynamic imports for heavy features
- Result: Smaller initial bundle

### 2. **Memoization**
```typescript
// Prevent unnecessary re-renders
const MemoizedChart = React.memo(ProductivityChart)
const memoizedData = useMemo(() => calculateStats(), [deps])
```

### 3. **Canvas Optimization**
- `requestAnimationFrame` for smooth animations
- `CanvasDrawCache` for memoized drawing
- Throttled redraws

### 4. **Image Optimization**
- WebP format for garden plants
- Responsive sizing
- Lazy loading for non-critical images

### 5. **Database Queries**
- Firestore indexing on frequently queried fields
- Real-time listeners only for active collections
- Pagination for large lists

---

## Security & Infrastructure

### 1. **Authentication**
- Firebase Auth handles credential storage
- Email/password with secure hashing
- Google OAuth for easy signup

### 2. **Data Security**
- Firestore security rules by user UID
- Environment variables for API keys
- No sensitive data in localStorage

### 3. **API Rate Limiting**
- 10 requests/minute per IP on `/api/growth-ai`
- Prevents abuse of Gemini API
- Returns 429 with Retry-After header

### 4. **Environment Configuration**
```
.env.local (never committed):
- Firebase credentials
- Gemini API key

.env.example (in repo):
- Placeholder values
- Configuration template
```

### 5. **Deployment (Vercel)**
- Automatic HTTPS
- DDoS protection
- CDN distribution
- Automatic deployments from GitHub

---

## Getting Started for Developers

### Prerequisites
```bash
Node.js 18+
npm or yarn or pnpm
Git
Firebase account
Google Cloud project (for Gemini API)
```

### Local Development

```bash
# 1. Clone and install
git clone <repo>
cd midori
npm install

# 2. Setup environment
cp .env.example .env.local
# Fill in Firebase and Gemini API keys

# 3. Start dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel
```

### Testing

```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react @types/jest

# Run tests
npm run test

# Generate coverage report
npm run test:coverage
```

---

## Key Metrics & KPIs

Track these to understand app health:

- **Lighthouse Score**: 90+ (performance, accessibility)
- **Bundle Size**: <300KB (main bundle)
- **Time to Interactive**: <2 seconds
- **API Response Time**: <200ms
- **Error Rate**: <0.1%
- **Offline Sync Success**: >99%
- **Test Coverage**: 80%+

---

## Future Architecture Improvements

### Phase 2 (Post-MVP)
- [ ] Service Worker for offline-first web
- [ ] Cloud Functions for complex operations
- [ ] Real-time collaboration (multi-user tasks)
- [ ] Mobile app (React Native)
- [ ] Advanced AI features (predictive scheduling)

### Phase 3 (Scaling)
- [ ] Horizontal scaling with database sharding
- [ ] WebSocket for real-time notifications
- [ ] Advanced caching strategies
- [ ] Analytics dashboarding
- [ ] API marketplace for integrations

---

## Conclusion

Midori's architecture prioritizes:
- **User Experience**: Fast, responsive, beautiful
- **Developer Experience**: TypeScript, clear patterns, testable code
- **Reliability**: Error boundaries, offline support, validation
- **Scalability**: Modular components, serverless backend, CDN

This foundation supports rapid feature development while maintaining quality and performance.

---

**For more details, see:**
- `VALIDATION_EXAMPLES.md` - Form validation examples
- `OFFLINE_INTEGRATION_GUIDE.md` - Offline implementation
- `MUSIC_PLAYER_REFACTOR.md` - Component modularization
- `TESTING_SETUP.md` - Testing infrastructure
- `COMPREHENSIVE_TESTING_GUIDE.md` - Writing tests
