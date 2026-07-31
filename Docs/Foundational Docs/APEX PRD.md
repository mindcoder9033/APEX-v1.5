# APEX PRD (Product Requirements Document)

## 1. Overview
**APEX** is a mobile-first web application designed as a simracing coach for complete beginners. It provides a structured, 30-day learning curriculum for driving techniques, specifically tailored for the Moza R3 wheel on Xbox playing Forza Motorsport 2023. 

## 2. Target & Constraints
*   **Target Device:** Mobile screens.
*   **Hardware/Game:** Moza R3 (Xbox), Forza Motorsport 2023.
*   **Constraints:** No login, no auth, no AI, no backend. 
*   **Deployment:** GitHub Pages (Static hosting).

## 3. Core Features & Content Structure
### 3.1 Curriculum Structure
*   **Format:** Linear curriculum (e.g., Module 1: Steering, Module 2: Braking).
*   **Module Specs:** 
    *   Defined goal and specific driving skill.
    *   Module-specific global settings for Moza R3 and Forza 2023.
    *   Duration: 30 days (4 weeks, 12 sessions, 45 mins each).

### 3.2 Session Structure
Each 45-minute session includes:
1.  **Setup:** Suggested car and track.
2.  **Theory:** Text explanation (max 200 words).
3.  **Practice Drill:** Specific exercise based on theory.
4.  **Practical:** Application of theory/drill in free practice.
5.  **Challenge:** Theory-based task with a specific target.
6.  **Assessment:** 3 short questions.
7.  **Psych Check-in:** 3 short questions.
8.  **Reflection:** 3 open-ended questions.
9.  **Feedback:** User feedback on the session.

## 4. UI/UX & Navigation
*   **Theme:** Dark mode default. F1-inspired (dark backgrounds, red accents, bold/sporty typography).
*   **Navigation:** Bottom navigation bar with 4 tabs:
    *   **Dashboard:** Today's session, linear progress tracker, basic stats.
    *   **Curriculum:** Access to modules and sessions.
    *   **Progress:** Detailed stats and history.
    *   **Settings:** App preferences and data management.

## 5. Technical Architecture
*   **Tech Stack:** Vanilla HTML, CSS, and JavaScript (Zero dependencies).
*   **Content Management:** Hardcoded in local JSON/JS files.
*   **Data Storage:** 
    *   Auto-save all inputs (assessments, reflections, progress) locally via LocalStorage/IndexedDB.
    *   Include "Export/Import JSON" feature in Settings for local backups.