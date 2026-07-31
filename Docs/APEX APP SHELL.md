# APEX_APP_SHELL.md

## 1. Layout Architecture
The app uses a standard 3-zone mobile layout to mimic a native telemetry dashboard:
*   **Zone 1 (Top):** Fixed Header (Height: ~56px).
*   **Zone 2 (Middle):** Scrollable Content Area (Dynamic height, `overflow-y: auto`).
*   **Zone 3 (Bottom):** Fixed Bottom Navigation (Height: ~64px + safe area inset).

## 2. Top Header
*   **Left:** "APEX" logo (Bold, uppercase, monospaced or heavy sans-serif).
*   **Right:** Settings gear icon (Solid, blocky geometry).
*   **Style:** Dark background (`#121212`) with a sharp bottom border (`#3A3A45`).

## 3. Bottom Navigation Bar
*   **Tabs:** Exactly 3 tabs: **Dashboard**, **Curriculum**, **Progress**.
*   **Active State:** Solid F1 Red (`#E10600`) background fill with white text/icon.
*   **Inactive State:** Transparent background, muted silver (`#A0A0B0`) text/icon.
*   **Style:** Sharp top border, no rounded corners.

## 4. Settings Drawer
*   **Trigger:** Top-right gear icon.
*   **Animation:** Slides in from the right edge (CSS `transform: translateX`).
*   **Backdrop:** Semi-transparent dark overlay (`rgba(0,0,0,0.7)`) covering the main content.
*   **Contents:** 
    *   Export Data (JSON)
    *   Import Data (JSON)
    *   Reset Progress
    *   App Info/Version

## 5. View Transitions & Notifications
*   **Transitions:** Instant swap. No CSS transitions or JS animations when switching tabs. Pure DOM replacement or `display: none/block` toggling for maximum performance.
*   **Notifications (Toasts):** Top-aligned slide-down banners.
    *   **Position:** Fixed, just below the Top Header.
    *   **Style:** Sharp edges, dark background, red left-border for success/info, white text. Auto-dismiss after 3 seconds.

## 6. HTML/CSS Skeleton Structure
```html
<body>
  <!-- Fixed Top Header -->
  <header class="app-header">
    <div class="logo">APEX</div>
    <button class="icon-btn settings-btn" aria-label="Settings">[Gear SVG]</button>
  </header>

  <!-- Settings Drawer (Hidden by default) -->
  <aside class="settings-drawer">...</aside>
  <div class="drawer-backdrop"></div>

  <!-- Notification Banner -->
  <div class="toast-banner"></div>

  <!-- Scrollable Main Content -->
  <main class="app-content">
    <section id="view-dashboard" class="view active">...</section>
    <section id="view-curriculum" class="view">...</section>
    <section id="view-progress" class="view">...</section>
  </main>

  <!-- Fixed Bottom Nav -->
  <nav class="bottom-nav">
    <button class="nav-item active" data-view="dashboard">Dashboard</button>
    <button class="nav-item" data-view="curriculum">Curriculum</button>
    <button class="nav-item" data-view="progress">Progress</button>
  </nav>
</body>
```

## 7. CSS Implementation Notes
*   Use `position: fixed` or `position: sticky` for Header and Bottom Nav.
*   Apply `padding-top` and `padding-bottom` to `.app-content` equal to the header/nav heights to prevent content clipping.
*   Use `env(safe-area-inset-bottom)` on the bottom nav to support modern mobile devices with home indicators.