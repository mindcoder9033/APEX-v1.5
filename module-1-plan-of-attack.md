# Module 1: A Plan of Attack — Implementation Plan

> **Task Slug:** `module-1-plan-of-attack`  
> **Source Spec:** `Docs/Modules/Module 1 - A Plan of Attack.md`  
> **Target Files:** `data/curriculum.json`, `js/views/session.js`, `js/views/curriculum.js`, `js/views/progress.js`

---

## 🎯 Goal

Implement Skip Barber's "Module 1 - A Plan of Attack" into the APEX Simracing App. This replaces the outdated Module 1 placeholder with a comprehensive 4-week, 12-session curriculum using the Mazda MX-5 Miata (1990) and Mazda Formula Mazda (2015) at Lime Rock Park (Full), complete with Moza R3 Direct Drive global hardware settings, FM23 force feedback baselines, theory, drills, practical stints, challenges, 3-question knowledge assessments, psych check-ins, open reflections, and stint feedback telemetry logging.

---

## 📋 Components & Structure

1. **`data/curriculum.json`**:
   - Update Module 1 title, description, Moza R3 settings, Forza Motorsport 2023 baseline settings, and advanced FFB parameters.
   - Embed all 12 sessions (Sessions 1 to 12) with full theory, practice drills, practical stint instructions, target challenges, 3 multiple-choice assessment questions per session with `correctIndex`, 3 psych check-in prompts, and 3 open-ended reflection prompts.

2. **`js/views/session.js`**:
   - Upgrade the 9-Step Session Wizard to display full hardware setup parameters (Moza R3 DD settings & FM23 baseline controls).
   - In Step 9 (Feedback & Debrief), add telemetry performance input fields (Laps Completed, Best Lap Time, Driver Notes) so drivers can log empirical stint metrics.

3. **`js/views/curriculum.js`**:
   - Render hardware setup summary for Module 1 cleanly.
   - Render all 12 sessions categorized across the 4 weekly roadmap priorities (Priority 1: Finding The Line, Priority 2: Exit Speed, Priority 3: Threshold Braking, Priority 4: Integration & Benchmark).

4. **`js/views/progress.js`**:
   - Include stint performance telemetry metrics (Best Lap Time, Laps Completed) in the drill history & reflection logs.

---

## 🏁 Verification Plan

- Validate `data/curriculum.json` syntax and schema completeness.
- Test session navigation for all 12 sessions.
- Verify assessment quiz scoring, psych check-ins, reflection notes, and stint logging.
- Ensure progress tracking updates accuracy trend graph and stint counters (X / 12).
