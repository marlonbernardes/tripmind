# Tripmind Development Prompt

## Task: Continue Tripmind Development

You are working on **Tripmind**, a responsive web application for planning trips, organizing activities on a timeline, managing bookings, and working offline.

### Required Steps (Execute in Order):

#### 1. **Read Project Documentation**
First, read all documentation files to understand current state:
- Read `docs/PROJECT_STATUS.md` for current status and next recommended task (if exists)
- Read `docs/PLAN.md` for complete project specification and MVP requirements
- [IGNORE} Read `docs/CODING.md` for coding standards and practices to follow (if exists)
- Review current codebase structure

#### 2. **Confirm Task with User**
Use the `ask_followup_question` tool to confirm the development direction. Don't suggest a lot of options: only if they want to work on the next task or work on something else (which they will have to specify via chat).
- Ask if the user wants to implement the next recommended task from `PROJECT_STATUS.md`
- Provide a brief description of what that task involves
- Offer the option for the user to specify a different task or area of focus
- Wait for user confirmation before proceeding

#### 3. **Implement Next Task**
Based on the current status in `docs/PROJECT_STATUS.md`:
- Implement the next recommended feature/task
- Follow the implementation plan outlined in the status document
- Make incremental, working changes
- Ensure code quality and TypeScript compliance

#### 4. **Testing Requirement (CRITICAL)**
**⚠️ NEVER assume changes work just because they compile!**
- After making ANY functional changes, ask the user to test
- DONT RUN THE DEV SERVER UNLESS EXPLICITLY ASKED
- Provide clear testing instructions
- Wait for user confirmation that changes work as expected
- Only proceed to next steps after receiving "it works" confirmation
- If user reports issues, debug and fix before continuing

#### 5. **Determine next task***
After successful implementation and testing:
- Propose what the next task should be.
- Use the `ask_followup_question` tool to check if user wants to work on what you proposed or if he has different ideas.


#### 6. **Update Project Status**
After successful implementation and testing:
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
- **Incremental Development:** Make small, testable changes
- **User Testing Required:** Always verify functionality with user before proceeding
- **Documentation First:** Read docs to understand current state
- **Status Updates:** Keep PROJECT_STATUS.md current and accurate (if exists)
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
