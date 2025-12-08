# Tripmind Development Prompt

## Task: Continue Tripmind Development

You are working on **Tripmind**, a responsive web application for planning trips, organizing activities on a timeline, managing bookings, and working offline.

### Required Steps (Execute in Order):

#### 1. **Read Project Documentation**
First, read all documentation files to understand current state:
- Read `docs/PROJECT_STATUS.md` for current status and next recommended task (if exists)
- Read `docs/PLAN.md` for complete project specification and MVP requirements
- [IGNORE] Read `docs/CODING.md` for coding standards and practices to follow (if exists)
- Review current codebase structure

#### 2. **Confirm Task with User**
Use the `ask_followup_question` tool to confirm the development direction. Don't suggest a lot of options: only if they want to work on the next task or work on something else (which they will have to specify via chat).
- Ask if the user wants to implement the next recommended task from `PROJECT_STATUS.md`
- Provide a brief description of what that task involves
- Offer the option for the user to specify a different task or area of focus
- Wait for user confirmation before proceeding

#### 3. **Implement → Test → Commit Workflow (CRITICAL)**
For each individual task/fix:

**Step A: Implement**
- Make the code changes for ONE task at a time
- Ensure code quality and TypeScript compliance
- Keep changes small and focused

**Step B: Request Testing**
- After implementing, ask the user to test the change
- Provide clear testing instructions (what to check, where to look)
- **DO NOT run the dev server** unless explicitly asked
- Wait for user confirmation that it works

**Step C: Request Commit**
- After user confirms the change works, ask if they want to: commit, have already commited or if there's an issue.
- Wait for user to confirm the commit is done

**Step D: Repeat**
- Only after the prev confirmation, move to the next task
- If user reports issues, debug and fix before continuing

#### 4. **Update Project Status**
After completing a batch of tasks or at the end of a session:
- Update `docs/PROJECT_STATUS.md` with:
  - What was completed in this session
  - Current working state
  - Next recommended task/priority
  - Any important notes or decisions made

### Development Context:
- **Current Directory:** `/Users/marlon/dev/tripmind`
- **Package Manager:** pnpm
- **Development Command:** `pnpm dev`
- **Architecture:** Next.js (App Router) + React 18 + TypeScript + TailwindCSS + Supabase
- **Repository:** `git@github.com:marlonbernardes/tripmind.git`

### Key Principles:
- **One Task at a Time:** Complete implement → test → commit cycle before moving on
- **User Testing Required:** Always verify functionality with user before proceeding
- **Atomic Commits:** Each fix/feature should be its own commit
- **Documentation First:** Read docs to understand current state
- **Status Updates:** Keep PROJECT_STATUS.md current and accurate
- **Quality Focus:** Ensure TypeScript compliance and code quality
- **Offline-First:** Prioritize offline functionality with sync capabilities
- **PWA Ready:** Build with Progressive Web App capabilities

### Tripmind-Specific Context:
- **Primary Focus:** Timeline workspace with grouped daily activities
- **Core Features:** Trip management, activity timeline, wallet (file storage), map view
- **Tech Stack:** Next.js + Zustand + IndexedDB (Dexie) + Supabase + Mapbox
- **UI Framework:** shadcn/ui + TailwindCSS with dark/light mode support
- **Data Strategy:** Offline-first with optimistic updates and background sync
- **Authentication:** Supabase Auth with OAuth and magic links
- **File Storage:** Supabase Storage for trip documents and files

**Start by reading the documentation files to understand what needs to be done next.**
