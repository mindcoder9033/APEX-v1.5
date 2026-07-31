# APEX TRD (Technical Requirements Document)

## 1. Technical Overview
APEX is a client-side only, Single Page Application (SPA) built with vanilla web technologies. It operates entirely in the browser without a backend, relying on local storage for user data and static JSON files for curriculum content.

## 2. Tech Stack
*   **Markup:** HTML5 (Semantic, accessible).
*   **Styling:** CSS3 (CSS Custom Properties for theming, Flexbox/Grid for mobile layouts).
*   **Logic:** Vanilla JavaScript (ES6+ Modules).
*   **Build/Dependencies:** Zero external dependencies. No build step required (pure static files).

## 3. Directory Structure
```text
apex/
├── index.html          # Main entry point
├── css/
│   ├── main.css        # Global styles, CSS variables (F1 theme)
│   ├── components.css  # Reusable UI components (cards, buttons, nav)
│   └── views.css       # Specific view styles (dashboard, session)
├── js/
│   ├── app.js          # App initialization, routing, and state management
│   ├── router.js       # Hash-based routing logic
│   ├── storage.js      # LocalStorage/IndexedDB wrapper & JSON import/export
│   ├── ui.js           # DOM manipulation and view rendering
│   └── views/          # Individual view renderers (dashboard.js, session.js, etc.)
├── data/
│   ├── curriculum.json # Modules, sessions, theory, drills
│   └── settings.json   # Default Moza R3 & Forza settings
├── assets/
│   ├── icons/          # SVG icons for bottom nav and UI
│   └── images/         # Track/car images (optimized WebP)
└── README.md
```

## 4. Data & State Management
### 4.1 Content Data (Read-Only)
*   Stored in `/data/curriculum.json`.
*   Loaded asynchronously via `fetch()` on app initialization.
*   Cached in memory (JS variables) during the session to prevent redundant network requests.

### 4.2 User Data (Read/Write)
*   **Storage Mechanism:** `localStorage` for progress, settings, and small text inputs. If data exceeds the ~5MB limit, fallback to `IndexedDB` via a lightweight native wrapper.
*   **State Management:** A centralized `AppState` object in `app.js` that syncs with `localStorage` on every change (debounced to prevent excessive writes).
*   **Data Structure:**
    ```json
    {
      "progress": { "currentModule": 1, "currentSession": 3, "completedSessions": [] },
      "sessionData": { "session_1_1": { "assessment": {...}, "reflection": "...", "timestamp": "..." } },
      "settings": { "theme": "dark", "haptics": true }
    }
    ```

### 4.3 Backup & Restore
*   **Export:** Creates a `Blob` from the `AppState` object, triggers a download of `apex_backup_[date].json` using `URL.createObjectURL`.
*   **Import:** Uses a hidden `<input type="file">` and `FileReader` to parse uploaded JSON, validate structure, and overwrite `AppState`.

## 5. Routing & Navigation
*   **Routing:** Hash-based routing (`#/dashboard`, `#/curriculum`, `#/session/1/3`) to allow deep-linking and browser back/forward button support without a server.
*   **Navigation:** Fixed bottom navigation bar. Active tab highlighted with F1-style red accent.

## 6. UI/UX Implementation (F1 Theme)
*   **CSS Variables:** Define the F1 aesthetic globally.
    ```css
    :root {
      --bg-primary: #15151E;    /* Deep dark blue/black */
      --bg-secondary: #1E1E28;  /* Card backgrounds */
      --accent-red: #E10600;    /* F1 Signature Red */
      --text-primary: #FFFFFF;
      --text-secondary: #A0A0B0;
      --font-main: 'Titillium Web', sans-serif; /* Sporty, bold F1-style font */
    }
    ```
*   **Mobile-First:** Base styles target `< 480px`. Use `vh`/`vw` and `rem` for scalable layouts. Ensure touch targets are at least 44x44px.
*   **Interactions:** CSS transitions for button hovers/active states. No heavy JS animations to maintain 60fps on mobile.

## 7. Performance & Optimization
*   **No Framework Overhead:** Vanilla JS ensures minimal JavaScript payload.
*   **Asset Optimization:** All images converted to WebP. SVGs inlined or sprite-sheeted for icons.
*   **Caching:** Standard browser caching for static assets. `localStorage` ensures offline capability after the first load.
*   **Rendering:** Use `document.createDocumentFragment()` or `innerHTML` batching to minimize DOM reflows when rendering session content.

## 8. Deployment & CI/CD
*   **Hosting:** GitHub Pages.
*   **Workflow:** 
    1. Push to `main` branch.
    2. GitHub Actions (optional but recommended) runs basic linting/validations.
    3. Deploys the root directory to GitHub Pages.
*   **Offline Support:** (Optional future enhancement) Add a basic Service Worker to cache the app shell for true offline access, though not strictly required for V1.

## 9. Extensibility Considerations
*   **Adding Content:** To add new modules, developers only need to update `curriculum.json` and push. No HTML/JS changes required.
*   **Theming:** The CSS variable architecture allows easy addition of Light Mode or alternative themes (e.g., "Forza Blue") by simply toggling a `data-theme` attribute on the `<body>`.