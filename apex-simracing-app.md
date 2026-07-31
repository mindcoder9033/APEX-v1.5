# APEX Simracing Coach - Project Implementation Plan

## 1. Overview
**APEX** is a mobile-first, client-side Single Page Application (SPA) designed as a simracing coach for beginners. It delivers a structured 30-day driving curriculum (4 weeks, 12 sessions, 45 minutes each) specifically tailored for the **Moza R3 wheel on Xbox** playing **Forza Motorsport 2023**.

The application features a high-contrast **F1 High-Performance Telemetry** design aesthetic, running entirely offline-capable in the browser with zero external framework dependencies and local storage persistence.

---

## 2. Project Type & Tech Stack

- **Project Type:** Web Application (Mobile-First SPA)
- **Primary Agent:** `frontend-specialist` / `agency-frontend-developer`
- **Tech Stack:**
  - **Markup:** HTML5 (Semantic, WCAG AA accessible touch targets min 48x48px)
  - **Styling:** CSS3 (CSS Custom Properties, Flexbox/Grid, 0px border-radius telemetry styling)
  - **Logic:** Vanilla JavaScript (ES6+ Native Modules, Hash-based router, State Store)
  - **Data:** Local JSON (`curriculum.json`, `settings.json`) + `localStorage` / `IndexedDB`
  - **Dependencies:** Zero external npm packages / build tools. Static deployment on GitHub Pages.

---

## 3. Key Requirements & Architecture Rules

1. **Aesthetics & Theme:**
   - Dark Carbon Black (`#121212`) background, Dark Gunmetal (`#1E1E24`) cards, F1 Signature Red (`#E10600`) active accents.
   - Sharp 0px border-radius across all containers, cards, and buttons.
   - Sporty headers (Rajdhani/Oswald) and Monospaced telemetry text (Share Tech Mono / Roboto Mono).
2. **App Shell Architecture:**
   - 3-zone mobile layout: Fixed Header (56px), Scrollable Content Area, Fixed Bottom Nav (64px).
   - Bottom Nav 3 main tabs: **Dashboard**, **Curriculum**, **Progress**.
   - Top Header: APEX telemetry logo + Settings gear button (slides out right drawer for Data Import/Export/Reset).
3. **Session Wizard Flow:**
   - 9-step step-by-step wizard for each 45-minute drill:
     1. Setup (Car & Track recommendation, Moza R3 / Forza 2023 settings)
     2. Theory (Max 200 words concise driving technique)
     3. Practice Drill (Focused driving exercise)
     4. Practical (Free practice application)
     5. Challenge (Target goal)
     6. Assessment (3 questions)
     7. Psych Check-in (3 questions)
     8. Reflection (3 open-ended prompts)
     9. Feedback (Session rating & completion)
4. **Data Management:**
   - Centralized `AppState` syncs with `localStorage` (debounced).
   - Fallback to native `IndexedDB` if storage usage approaches limits.
   - Backup/Restore via JSON Blob download and file upload parser.

---

## 4. Proposed Directory Structure

```text
d:\AI Workspace\APEX v1.5\
├── index.html              # Main HTML5 App Shell skeleton & entry point
├── css/
│   ├── main.css            # CSS Variables, typography, resets, layout shell
│   ├── components.css      # F1 telemetry cards, buttons, tabs, drawer, toast, form controls
│   └── views.css           # View-specific styles (dashboard, curriculum, session wizard, progress)
├── js/
│   ├── app.js              # Application bootstram, state manager, global event bus
│   ├── router.js           # Lightweight hash-based SPA router
│   ├── storage.js          # LocalStorage + IndexedDB wrapper with JSON Export/Import
│   ├── ui.js               # Toast notifications, drawer controls, dynamic UI helpers
│   └── views/              # View renderer modules
│       ├── dashboard.js    # Dashboard view (Next session, linear tracker, telemetry stats)
│       ├── curriculum.js   # Curriculum overview (Modules, session list, unlock status)
│       ├── session.js      # 9-step interactive session wizard flow
│       └── progress.js     # Detailed stats, history, and SVG lap time trend chart
├── data/
│   ├── curriculum.json     # 30-day (12 sessions across modules) structured curriculum data
│   └── settings.json       # Moza R3 wheel and Forza 2023 default configuration settings
├── assets/
│   ├── icons/              # Geometric SVG icons (Dashboard, Curriculum, Progress, Settings, etc.)
│   └── images/             # Track/car thumbnails and telemetry diagrams
└── apex-simracing-app.md   # Project plan file
```

---

## 5. Task Breakdown

### Phase 1: Foundation & Static Assets
- [ ] **TASK-101: Foundation & CSS Design System**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`, `@clean-code`
  - **Priority:** P0
  - **Dependencies:** None
  - **INPUT:** `Docs/APEX DESIGN.md`, `Docs/APEX TRD.md`
  - **OUTPUT:** `css/main.css` & `css/components.css` with CSS variables (`--bg-primary: #121212`, `--accent-red: #E10600`), 0px border-radius, telemetry typography, buttons, cards, and grid system.
  - **VERIFY:** Check CSS tokens, high-contrast borders, and responsiveness down to 320px viewport.

- [ ] **TASK-102: Data Schemas & Content Files**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@clean-code`
  - **Priority:** P0
  - **Dependencies:** None
  - **INPUT:** `Docs/APEX PRD.md`
  - **OUTPUT:** `data/curriculum.json` (12 detailed sessions over 4 modules with 9-step wizard data, setup recommendations, theory, drills, challenges, assessments) & `data/settings.json` (Moza R3 & Forza 2023 defaults).
  - **VERIFY:** Validate JSON syntax and verify all 12 sessions contain all required fields.

- [ ] **TASK-103: Core Storage & State Engine**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@clean-code`
  - **Priority:** P0
  - **Dependencies:** None
  - **INPUT:** `Docs/APEX TRD.md`
  - **OUTPUT:** `js/storage.js` module supporting `localStorage` with `IndexedDB` fallback, state serialization, debounced saves, and JSON file export/import handler.
  - **VERIFY:** Test state save/restore cycle and JSON blob export/import parsing.

---

### Phase 2: App Shell & Routing
- [ ] **TASK-201: App Shell Skeleton & Index HTML**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`
  - **Priority:** P1
  - **Dependencies:** TASK-101
  - **INPUT:** `Docs/APEX APP SHELL.md`
  - **OUTPUT:** `index.html` featuring 3-zone layout (Header 56px, scrollable Content area, Bottom Nav 64px), drawer markup, toast banner element, Google Fonts (`Rajdhani`, `Share Tech Mono`), and SVG icons.
  - **VERIFY:** Verify semantic HTML structure, accessibility tags, and mobile layout container scaling.

- [ ] **TASK-202: SPA Router & App Controller**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@clean-code`
  - **Priority:** P1
  - **Dependencies:** TASK-103, TASK-201
  - **INPUT:** `Docs/APEX TRD.md`
  - **OUTPUT:** `js/router.js` & `js/app.js` providing hash-based routing (`#/dashboard`, `#/curriculum`, `#/session/:modId/:sessId`, `#/progress`), tab active state sync, view lifecycle hooks, and global state initialization.
  - **VERIFY:** Navigate between hashes in browser address bar and confirm view mount/unmount triggers cleanly.

- [ ] **TASK-203: UI Infrastructure & Settings Drawer**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`, `@clean-code`
  - **Priority:** P1
  - **Dependencies:** TASK-201, TASK-202
  - **INPUT:** `Docs/APEX APP SHELL.md`
  - **OUTPUT:** `js/ui.js` handling slide-out Settings drawer (export/import/reset actions), toast banner alerts (auto-dismiss 3s), and backdrop interactions.
  - **VERIFY:** Open/close drawer, trigger toast notifications, and test JSON export/import UI triggers.

---

### Phase 3: Core Views & Features
- [ ] **TASK-301: Telemetry Dashboard View**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`
  - **Priority:** P2
  - **Dependencies:** TASK-202, TASK-102
  - **INPUT:** `Docs/APEX DESIGN.md`, `Docs/APEX PRD.md`
  - **OUTPUT:** `js/views/dashboard.js` & `css/views.css` rendering Today's Session card ("Begin/Continue Session"), linear 30-day progress gauge, quick Moza R3 settings reminder block, and recent telemetry stats.
  - **VERIFY:** Dashboard displays correct active session based on user progress and renders all telemetry blocks sharply.

- [ ] **TASK-302: Curriculum Matrix View**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`
  - **Priority:** P2
  - **Dependencies:** TASK-202, TASK-102
  - **INPUT:** `Docs/APEX PRD.md`
  - **OUTPUT:** `js/views/curriculum.js` displaying 4 modules with session lists, completion badges, module-specific Moza R3 & Forza settings summaries, and click-to-launch session actions.
  - **VERIFY:** Module accordion/list displays locking/unlocking states and navigates directly to session drill wizard.

- [ ] **TASK-303: Interactive 9-Step Session Wizard**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`, `@clean-code`
  - **Priority:** P2
  - **Dependencies:** TASK-202, TASK-102, TASK-103
  - **INPUT:** `Docs/APEX PRD.md`, `Docs/APEX DESIGN.md`
  - **OUTPUT:** `js/views/session.js` implementing a segmented top progress bar, step switcher (Setup, Theory, Practice Drill, Practical, Challenge, Assessment, Psych, Reflection, Feedback), input forms with auto-save, and completion calculation.
  - **VERIFY:** Step through all 9 wizard sections, input answers, complete session, and verify data persists to `AppState` and `localStorage`.

- [ ] **TASK-304: Telemetry Progress & Analytics View**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`
  - **Priority:** P2
  - **Dependencies:** TASK-202, TASK-103
  - **INPUT:** `Docs/APEX DESIGN.md`
  - **OUTPUT:** `js/views/progress.js` featuring zero-dependency inline SVG trend graphs for lap times/drills, completed session history breakdown, assessment score summary, and reflection log review.
  - **VERIFY:** Progress stats calculate accurately from completed sessions and SVG graph renders cleanly on mobile screen widths.

---

### Phase 4: Polish, Accessibility & Verification
- [ ] **TASK-401: F1 Aesthetic Refinement & Micro-interactions**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@frontend-design`
  - **Priority:** P3
  - **Dependencies:** Phase 3
  - **INPUT:** `Docs/APEX DESIGN.md`
  - **OUTPUT:** Refined touch feedback states (min 48x48px targets), sharp border highlights, F1 telemetry styling tweaks, empty state handling, and responsive typography scaling.
  - **VERIFY:** Inspect UI against 0px border-radius, dark telemetry contrast standards, and touch target rules.

- [ ] **TASK-402: Comprehensive Phase X Verification**
  - **Agent:** `frontend-specialist`
  - **Skills:** `@lint-and-validate`
  - **Priority:** P3
  - **Dependencies:** All tasks
  - **INPUT:** `project-planner.md` Phase X criteria
  - **OUTPUT:** Complete test execution log and Phase X validation report.
  - **VERIFY:** Run HTML/CSS/JS validation, test offline capabilities, verify LocalStorage backup import/export, check responsive mobile UI across viewports.

---

## 6. Phase X: Final Verification Checklist

- [ ] **Accessibility & Touch Targets:** All interactive elements meet 48x48px minimum touch area.
- [ ] **F1 Theme Compliance:** High-contrast dark backgrounds (`#121212`), 0px rounded corners, F1 Red accents (`#E10600`).
- [ ] **Zero Dependency Check:** No external npm build processes, frameworks, or runtime dependencies.
- [ ] **Offline & Storage Verification:** App operates completely client-side. Data auto-saves and restores reliably via LocalStorage/IndexedDB.
- [ ] **Backup System:** Export JSON downloads clean backup file; Import JSON correctly parses and restores state.
- [ ] **Routing & Navigation:** Hash routes navigate smoothly without full page reloads or broken history.
- [ ] **Curriculum Coverage:** All 12 sessions across 4 modules present with full 9-step wizard contents.
