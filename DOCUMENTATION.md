# 📚 Midori Documentation Index

## Welcome to the Midori Developer Guide

This documentation provides everything needed to understand, develop, and extend the Midori productivity application.

---

## Quick Links

### 🚀 Getting Started
- **[Architecture Guide](./ARCHITECTURE.md)** - Complete system design and data flow
- **[README.md](./README.md)** - Project overview and features
- **[Setup Instructions](./DEPLOY.md)** - Local development and deployment

### 💾 Core Features

#### Input Validation & Data Safety
- **[Validation Examples](./lib/VALIDATION_EXAMPLES.md)** - Using Zod schemas in forms and APIs
- **[Schema Reference](./lib/schemas.ts)** - All data validation rules

#### Offline-First Architecture
- **[Offline Integration Guide](./lib/OFFLINE_INTEGRATION_GUIDE.md)** - Implementing offline support
- **[Offline Manager API](./lib/offline-manager.ts)** - Core offline system

#### Advanced Analytics
- **[Analytics Functions](./lib/analytics.ts)** - Stats calculation and pattern detection
- **[Using Analytics Hooks](./lib/hooks/useAnalytics.ts)** - React integration

#### Music Player System
- **[Music Player Refactor](./components/MUSIC_PLAYER_REFACTOR.md)** - Component modularization
- **[Music Hooks](./lib/hooks/useMusic.ts)** - Music playback logic

#### Task Scheduling
- **[Task Utils Guide](./lib/task-utils.ts)** - Recurring task generation
- **[Recurrence Examples](./README.md#recurring-tasks)** - Real-world usage

### 🧪 Testing & Quality

- **[Testing Setup](../__tests__/TESTING_SETUP.md)** - Jest & Testing Library configuration
- **[Comprehensive Testing Guide](../__tests__/COMPREHENSIVE_TESTING_GUIDE.md)** - Strategies, patterns, best practices
- **[Example Tests](../__tests__/lib/)** - Ready-to-use test suites
  - `task-utils.example.test.ts` - Testing utility functions
  - `schemas.example.test.ts` - Testing validation
  - `analytics.example.test.ts` - Testing calculations

### 🏗️ Architecture Deep Dives

| Component | Documentation | Key Files |
|-----------|---|---|
| **Authentication** | [Architecture](./ARCHITECTURE.md#authentication-flow) | `auth-provider.tsx` |
| **Data Sync** | [Real-time Sync](./ARCHITECTURE.md#real-time-data-sync) | `local-data-provider.tsx` |
| **Offline Support** | [Offline-First](./lib/OFFLINE_INTEGRATION_GUIDE.md) | `offline-manager.ts` |
| **AI Scheduling** | [Architecture](./ARCHITECTURE.md#ai-powered-scheduling) | `app/api/growth-ai/` |
| **Analytics** | [Analytics Guide](./lib/analytics.ts) | `lib/analytics.ts` |
| **Music Player** | [Refactor Guide](./components/MUSIC_PLAYER_REFACTOR.md) | `lib/hooks/useMusic.ts` |
| **Error Handling** | [Patterns](./ARCHITECTURE.md#error-handling-pattern) | `components/error-boundary.tsx` |

---

## Documentation Organization

```
📁 Root Docs
├── 📄 ARCHITECTURE.md ................. Complete system design
├── 📄 lib/
│   ├── VALIDATION_EXAMPLES.md ...... Form validation guide
│   ├── OFFLINE_INTEGRATION_GUIDE.md . Offline implementation
│   └── schemas.ts ................... Zod validation reference
├── 📄 components/
│   ├── MUSIC_PLAYER_REFACTOR.md .... Component modularization
│   └── music-player-components.tsx .. Music UI components
└── 📁 __tests__/
    ├── TESTING_SETUP.md ............ Jest configuration
    ├── COMPREHENSIVE_TESTING_GUIDE.md . Testing strategies
    └── lib/
        ├── task-utils.example.test.ts
        ├── schemas.example.test.ts
        └── analytics.example.test.ts
```

---

## Common Tasks

### For New Developers

1. **Understand the app:**
   - Read [ARCHITECTURE.md](./ARCHITECTURE.md) (15 min)
   - Review [Directory Structure](./ARCHITECTURE.md#directory-structure)
   - Check out [Data Flow diagrams](./ARCHITECTURE.md#data-flow)

2. **Set up locally:**
   - Follow [Setup Instructions](./DEPLOY.md)
   - Run `npm run dev`
   - Open http://localhost:3000

3. **Learn key patterns:**
   - [Component Patterns](./ARCHITECTURE.md#component-patterns)
   - [Error Handling](./ARCHITECTURE.md#error-handling-pattern)
   - [Validation Pattern](./ARCHITECTURE.md#validation-pattern)

### For Frontend Developers

- Explore [Component Architecture](./ARCHITECTURE.md#presentation-layer)
- Review [Error Boundary Guide](./components/error-boundary.tsx)
- Study [Music Player Refactoring](./components/MUSIC_PLAYER_REFACTOR.md)
- Understand [Offline Indicator UI](./components/offline-indicator.tsx)

### For Backend Developers

- Study [API Routes Structure](./ARCHITECTURE.md#infrastructure-layer)
- Review [API Validation](./lib/api-validation.ts)
- Understand [Rate Limiting](./app/api/growth-ai/route.ts)
- Learn [Firestore Integration](./components/local-data-provider.tsx)

### For Full-Stack Developers

- Follow complete [Architecture Guide](./ARCHITECTURE.md)
- Deep-dive: [Data Flow Diagrams](./ARCHITECTURE.md#data-flow)
- Understand [Tech Stack](./ARCHITECTURE.md#key-technologies)
- Review [Development Patterns](./ARCHITECTURE.md#development-patterns)

### When Adding a Feature

1. Check if similar feature exists → [Architecture](./ARCHITECTURE.md)
2. Plan your approach → [Design Patterns](./ARCHITECTURE.md#development-patterns)
3. Implement with validation → [Validation Guide](./lib/VALIDATION_EXAMPLES.md)
4. Add tests → [Testing Guide](../__tests__/COMPREHENSIVE_TESTING_GUIDE.md)
5. Refer to existing examples → [Example Tests](../__tests__/lib/)

### When Debugging

1. **Data not updating?** → [Real-time Sync](./ARCHITECTURE.md#real-time-data-sync)
2. **Offline issues?** → [Offline Guide](./lib/OFFLINE_INTEGRATION_GUIDE.md)
3. **Component errors?** → [Error Handling](./ARCHITECTURE.md#error-handling-pattern)
4. **API errors?** → [API Validation](./lib/api-validation.ts)
5. **State issues?** → [Data Flow](./ARCHITECTURE.md#data-flow)

---

## Key Concepts

### 🌐 Real-Time Data Sync
```typescript
// Firestore listeners provide live updates
// Changes sync automatically between devices
// Offline changes queue and sync when back online
```
See: [Real-time Sync Pattern](./ARCHITECTURE.md#real-time-data-sync)

### 🌱 Visual Garden Metaphor
```
Task → Completion → Plant Growth → Visual Feedback
```
See: [Garden Visualization](./ARCHITECTURE.md#visual-garden-metaphor)

### 🤖 AI-Powered Scheduling
```
User Tasks → Gemini AI → Optimized Schedule → Display
```
See: [AI Scheduling](./ARCHITECTURE.md#ai-powered-scheduling)

### 📱 Offline-First
```
Online: Instant sync to Firestore
Offline: Queue changes in localStorage
Sync: Push queued changes when reconnected
```
See: [Offline-First Architecture](./lib/OFFLINE_INTEGRATION_GUIDE.md)

### 🎵 Modular Components
```
Large Component → Extract Logic to Hooks → Split UI
```
See: [Music Player Refactoring](./components/MUSIC_PLAYER_REFACTOR.md)

---

## Testing & Code Quality

### Test Coverage Strategy
- **Utilities**: 90%+ (pure, deterministic)
- **Hooks**: 80%+ (logic-heavy, memoization)
- **Components**: 70%+ (UI rendering)
- **Overall**: 60%+ (balanced)

### How to Write Tests
1. Use examples in `__tests__/lib/` as templates
2. Copy `.example.test.ts` and rename
3. Follow [Testing Patterns](../__tests__/COMPREHENSIVE_TESTING_GUIDE.md)

### Quick Test Commands
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## Performance Metrics

Target metrics for the app:

| Metric | Target | Current |
|--------|--------|---------|
| **Lighthouse Score** | 90+ | - |
| **Bundle Size** | <300KB | - |
| **Time to Interactive** | <2s | - |
| **API Response** | <200ms | - |
| **Error Rate** | <0.1% | - |
| **Test Coverage** | 80%+ | - |

---

## Development Workflow

### Branch Strategy
```
main (production)
  ↑
dev (staging)
  ↑
feature/branch-name (your work)
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: improve code quality
test: add tests
```

### Pull Request Process
1. Create feature branch from `dev`
2. Implement with tests
3. Open PR with clear description
4. Get code review
5. Merge to `dev`
6. Deploy to staging
7. Promote to `main` (production)

---

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
- Run `npm run build` locally first
- Check `tsconfig.json`
- See [Architecture - Type Safety](./ARCHITECTURE.md)

**Tests fail**
- Ensure Jest is configured correctly
  - Follow [Testing Setup](../__tests__/TESTING_SETUP.md)
- Check mock setup
  - See [Mocking Strategies](../__tests__/COMPREHENSIVE_TESTING_GUIDE.md#mocking-strategies)

**Offline sync not working**
- Check browser DevTools → Network → Offline mode
- Verify localStorage has space
- See [Offline Debugging](./lib/OFFLINE_INTEGRATION_GUIDE.md)

**API rate limit exceeded**
- Check server logs for rate limit errors
- Default: 10 requests/minute
- See [API Rate Limiting](./app/api/growth-ai/route.ts)

---

## Resources

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)

### Useful Tools
- [VS Code](https://code.visualstudio.com/) - Editor
- [React Developer Tools](https://react-devtools-tutorial.vercel.app/) - Chrome extension
- [Firebase emulator](https://firebase.google.com/docs/emulator-suite) - Local testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

---

## Contributing Guidelines

### Before Contributing
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review [Development Patterns](./ARCHITECTURE.md#development-patterns)
3. Check [Testing Guide](../__tests__/COMPREHENSIVE_TESTING_GUIDE.md)

### When Contributing
1. Follow existing code style
2. Add tests for new code
3. Update relevant documentation
4. Keep commits atomic and descriptive
5. Request review from maintainers

### Report Issues
- Use GitHub Issues
- Include: steps to reproduce, expected behavior, actual behavior
- Reference [relevant documentation](./ARCHITECTURE.md)

---

## Support & Questions

- 💬 **Questions?** Open a GitHub Discussion
- 🐛 **Found a bug?** Open a GitHub Issue
- 💡 **Feature idea?** Open a GitHub Discussion
- 📖 **Need help?** Check [ARCHITECTURE.md](./ARCHITECTURE.md) and guides above

---

**Last Updated**: March 2024
**Next Review**: June 2024
**Maintained By**: Midori Team
