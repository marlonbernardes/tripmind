# 🧭 Tripmind

A responsive web application for planning trips, organizing activities on a timeline, managing bookings, and working offline. Built with an offline-first approach featuring timeline workspace, file management, and map visualization.

## 🏗️ Project Structure

This is a **monorepo** with clean separation between frontend, API, and shared code:

```
tripmind/
├── frontend/          # Next.js PWA application
├── api/              # Supabase backend (migrations, functions, schemas)
├── shared/           # Shared TypeScript types, constants, and utilities
├── docs/             # Project documentation
├── scripts/          # Build and deployment scripts
└── package.json      # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation
```bash
# Install all workspace dependencies
pnpm install

# Start frontend development server
pnpm dev

# Or start frontend explicitly
pnpm dev:frontend
```

The frontend will be available at `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend development server |
| `pnpm dev:frontend` | Start frontend development server |
| `pnpm build` | Build frontend for production |
| `pnpm build:frontend` | Build frontend for production |
| `pnpm start` | Start frontend production server |
| `pnpm lint` | Run linting on frontend |
| `pnpm install:all` | Install all workspace dependencies |

## 🔧 Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand
- **Local Database**: IndexedDB (via Dexie)
- **PWA**: next-pwa for offline capabilities
- **Maps**: Mapbox GL JS

### API (`/api`)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Authentication**: Supabase Auth (OAuth + Magic Links)
- **File Storage**: Supabase Storage

### Shared (`/shared`)
- **Types**: Shared TypeScript interfaces
- **Constants**: Shared application constants  
- **Utils**: Shared utility functions

## 🎯 Core Features

- **📅 Timeline Planning**: Organize activities by day with drag-and-drop interface
- **📁 Trip Wallet**: Store documents, confirmations, and files per trip
- **🗺️ Map View**: Visualize activities and routes on interactive maps
- **⚡ Offline-First**: Read & edit without internet, auto-sync on reconnect
- **📱 PWA Ready**: Installable as Progressive Web App
- **🔄 Real-time Sync**: Optimistic updates with conflict resolution

## 📖 Documentation

- [`docs/PLAN.md`](./docs/PLAN.md) - Complete project specification and MVP requirements
- [`docs/DEVELOPMENT_BLUEPRINT.md`](./docs/DEVELOPMENT_BLUEPRINT.md) - Architecture decisions and development phases
- [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) - Current development status and next tasks
- [`frontend/README.md`](./frontend/README.md) - Frontend-specific documentation

## 🔄 Development Status

**Current Phase**: Phase 1 Complete - Foundation & Setup ✅  
**Next Phase**: Phase 2 - Core Data Layer

See [`docs/PROJECT_STATUS.md`](./docs/PROJECT_STATUS.md) for detailed progress tracking.

## 🤝 Contributing

This is currently a personal project. See individual workspace READMEs for specific development guidelines.

## 📝 License

Private project - All rights reserved.

---

**Built with ❤️ for seamless trip planning**
