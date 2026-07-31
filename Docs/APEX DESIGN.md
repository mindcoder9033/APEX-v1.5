# APEX DESIGN.md

## 1. Design Philosophy
APEX adopts a **High-Performance Telemetry** aesthetic. The UI mimics F1 team dashboards and industrial racing equipment—prioritizing high contrast, sharp geometry, and data readability over soft, consumer-app friendliness. 

## 2. Color Palette (Dark Mode Default)
*   **Backgrounds:** Deep Carbon Black (`#121212`) and Dark Gunmetal (`#1E1E24`) for cards.
*   **Primary Accent:** F1 Signature Red (`#E10600`) for active states, progress, and critical alerts.
*   **Text:** Pure White (`#FFFFFF`) for headers, Muted Silver (`#A0A0B0`) for body text.
*   **Borders:** High-contrast Light Gray (`#3A3A45`) to define sharp UI boundaries.

## 3. Typography
*   **Headers & UI Labels:** Bold, uppercase Sans-Serif (e.g., *Rajdhani* or *Oswald*). Aggressive, sporty, and highly legible.
*   **Data, Numbers & Telemetry:** Monospaced font (e.g., *Roboto Mono* or *Share Tech Mono*). Ensures perfect alignment for lap times, RPMs, and progress stats.

## 4. UI Components & Styling
*   **Cards & Containers:** Strict `0px` border-radius (sharp, aggressive edges).
*   **Borders:** 1px to 2px solid high-contrast borders. Active/selected cards feature a thick Red (`#E10600`) left or top border.
*   **Buttons:** Rectangular, sharp corners. Primary buttons are solid Red with white text. Secondary buttons are transparent with white borders.
*   **Touch Targets:** Minimum 48x48px for all interactive elements to accommodate mobile thumbs while wearing racing gloves (or just general mobile usability).

## 5. Iconography
*   **Style:** Solid, blocky, and geometric. No thin outlines or delicate curves.
*   **Theme:** Industrial/Telemetry inspired (e.g., sharp chevrons, blocky steering wheels, solid timing blocks).
*   **Navigation:** Bottom bar uses solid geometric icons, filling with Red when active.

## 6. User Journey & Flows
### 6.1 Onboarding (First Launch)
*   Bypasses traditional login/welcome screens.
*   Drops user directly into the **Dashboard**.
*   Features a prominent, pulsing "Begin Module 0" card.
*   Uses subtle, dismissible inline tooltips to explain the bottom nav and hardware check.

### 6.2 In-Session Flow (The 45-Min Drill)
*   **Format:** Step-by-step wizard. One section per screen (Theory -> Drill -> Practical -> Challenge -> Assessment -> Psych -> Reflection -> Feedback).
*   **Navigation:** Fixed top progress bar (segmented, filling with Red as the user advances).
*   **Controls:** Large, thumb-friendly "Next" / "Previous" buttons at the bottom of the screen.

## 7. Data Visualization (Zero-Dependency)
*   **Module Progress:** Pure CSS bar charts and blocky progress indicators. Solid fills, sharp edges, high contrast.
*   **Lap Time Trends:** Simple, lightweight SVG line graphs drawn via Vanilla JS. Minimalist axes, red data lines, monospaced axis labels.
*   **Stats:** Displayed in "telemetry blocks" (e.g., `STINT: 04 | BEST: 1:42.3 | DELTA: -0.4`).