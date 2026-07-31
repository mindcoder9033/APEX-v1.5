/* ==========================================
   APEX Simracing Coach - Curriculum View Renderer
   ========================================== */

import { storage } from '../storage.js';
import { router } from '../router.js';

/**
 * Compute map of unlocked session IDs across all modules sequentially
 */
function getUnlockedSessionSet(curriculumData, completedSessions) {
  const unlockedSet = new Set();
  let prevCompleted = true;
  if (curriculumData && curriculumData.modules) {
    for (const mod of curriculumData.modules) {
      for (const sess of mod.sessions) {
        if (prevCompleted) {
          unlockedSet.add(sess.id);
        }
        prevCompleted = completedSessions.includes(sess.id);
      }
    }
  }
  return unlockedSet;
}

/**
 * Render Main Curriculum Matrix Screen (/curriculum)
 * Shows high-level minimal Module Cards only
 */
export function renderCurriculumView(curriculumData) {
  const viewContainer = document.getElementById('view-curriculum');
  if (!viewContainer || !curriculumData) return;

  const state = storage.getState();
  const completedSessions = state.progress.completedSessions || [];

  let html = `
    <div style="margin-bottom: 1.25rem;">
      <div class="hero-tag">
        <span>DRIVING CURRICULUM</span>
      </div>
      <h1>CURRICULUM MATRIX</h1>
      <p>Select a module to view its drills and hardware setup guidelines.</p>
    </div>
    <div class="module-cards-grid">
  `;

  curriculumData.modules.forEach(mod => {
    const completedInMod = mod.sessions.filter(s => completedSessions.includes(s.id)).length;
    const totalInMod = mod.sessions.length;
    const modPercent = Math.round((completedInMod / (totalInMod || 1)) * 100);
    const isAllCompleted = completedInMod === totalInMod && totalInMod > 0;

    html += `
      <div class="card module-card-summary" data-mod-id="${mod.id}" style="cursor: pointer; margin-bottom: 1rem; position: relative;">
        <div class="card-header" style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="card-subtitle" style="color: var(--accent-red); font-weight: 700;">MODULE ${mod.id}</div>
            <div class="card-title" style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
              ${mod.title}
            </div>
          </div>
          <span class="badge ${isAllCompleted ? 'badge-green' : completedInMod > 0 ? 'badge-red' : 'badge-muted'}">
            ${isAllCompleted ? 'COMPLETED' : completedInMod > 0 ? 'IN PROGRESS' : 'NOT STARTED'}
          </span>
        </div>

        <div class="progress-bar-container" style="margin: 0.75rem 0 0.5rem 0; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
          <div class="progress-bar-fill" style="width: ${modPercent}%; height: 100%; background: var(--accent-red); border-radius: 3px;"></div>
        </div>

        <div class="flex-between" style="align-items: center; margin-top: 0.75rem;">
          <div class="mono-text" style="font-size: 0.8rem; color: var(--text-secondary);">
            ${completedInMod} OF ${totalInMod} DRILLS COMPLETED (${modPercent}%)
          </div>
          <button class="btn btn-secondary btn-sm" style="pointer-events: none; padding: 0.35rem 0.75rem; font-size: 0.75rem;">
            VIEW MODULE DRILLS &rarr;
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  viewContainer.innerHTML = html;

  // Add click listeners to module cards
  const moduleCards = viewContainer.querySelectorAll('.module-card-summary');
  moduleCards.forEach(card => {
    card.addEventListener('click', () => {
      const modId = card.getAttribute('data-mod-id');
      if (modId) {
        router.navigate(`/module/${modId}`);
      }
    });
  });
}

/**
 * Render Detailed Module View Screen (/module/:modId)
 * Shows module header, hardware baseline specs, and 12-session drill cards
 */
export function renderModuleDetailView(curriculumData, modId) {
  const viewContainer = document.getElementById('view-module');
  if (!viewContainer || !curriculumData) return;

  const state = storage.getState();
  const completedSessions = state.progress.completedSessions || [];
  const unlockedSet = getUnlockedSessionSet(curriculumData, completedSessions);

  let mod = curriculumData.modules.find(m => m.id == modId);
  if (!mod) mod = curriculumData.modules[0];

  const completedInMod = mod.sessions.filter(s => completedSessions.includes(s.id)).length;
  const totalInMod = mod.sessions.length;
  const modPercent = Math.round((completedInMod / (totalInMod || 1)) * 100);

  let html = `
    <div style="margin-bottom: 1.25rem;">
      <button id="back-to-matrix-btn" class="btn btn-secondary btn-sm" style="margin-bottom: 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        BACK TO CURRICULUM MATRIX
      </button>

      <div class="hero-tag">
        <span>MODULE ${mod.id} // DRILL MATRIX</span>
      </div>
      <h1>${mod.title}</h1>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.4rem; line-height: 1.5;">${mod.description}</p>
    </div>

    <!-- Hardware & Assist Baseline Specs Card -->
    <div class="card" style="margin-bottom: 1.25rem; background: var(--bg-card); border-left: 3px solid var(--accent-red);">
      <div class="card-title" style="font-size: 0.85rem; margin-bottom: 0.5rem; letter-spacing: 0.05em; color: var(--accent-red); text-transform: uppercase;">
        MOZA R3 & FORZA MOTORSPORT 2023 BASELINE
      </div>
      <div class="telemetry-grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem;">
        <div class="telemetry-block" style="background: var(--bg-primary); padding: 0.5rem;">
          <div class="telemetry-label">FFB INTENSITY</div>
          <div class="telemetry-value" style="font-size: 0.85rem;">${mod.mozaR3Global ? mod.mozaR3Global.ffbStrength : '100%'}</div>
        </div>
        <div class="telemetry-block" style="background: var(--bg-primary); padding: 0.5rem;">
          <div class="telemetry-label">STEERING ROTATION</div>
          <div class="telemetry-value" style="font-size: 0.85rem;">${mod.mozaR3Global ? mod.mozaR3Global.wheelRotation : '900°'}</div>
        </div>
        <div class="telemetry-block" style="background: var(--bg-primary); padding: 0.5rem;">
          <div class="telemetry-label">STEERING MODE</div>
          <div class="telemetry-value" style="font-size: 0.85rem;">${mod.forzaGlobal ? mod.forzaGlobal.steeringMode : 'Simulation'}</div>
        </div>
        <div class="telemetry-block" style="background: var(--bg-primary); padding: 0.5rem;">
          <div class="telemetry-label">ASSISTS</div>
          <div class="telemetry-value" style="font-size: 0.85rem;">ABS: ${mod.forzaGlobal ? mod.forzaGlobal.abs : 'OFF'} | TCS: ${mod.forzaGlobal ? mod.forzaGlobal.tcs : 'OFF'}</div>
        </div>
      </div>
    </div>

    <!-- Session Drill Cards List -->
    <div class="session-list">
  `;

  let currentWeekTitle = '';
  mod.sessions.forEach(sess => {
    if (sess.weekTitle && sess.weekTitle !== currentWeekTitle) {
      currentWeekTitle = sess.weekTitle;
      html += `
        <div style="font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; color: var(--accent-red); margin-top: 1rem; margin-bottom: 0.35rem; letter-spacing: 0.05em; text-transform: uppercase;">
          ${currentWeekTitle}
        </div>
      `;
    }

    const isCompleted = completedSessions.includes(sess.id);
    const isUnlocked = unlockedSet.has(sess.id);

    let badgeHtml = '';
    if (isCompleted) {
      badgeHtml = `<span class="badge badge-green">COMPLETED</span>`;
    } else if (isUnlocked) {
      badgeHtml = `<span class="badge badge-red">UNLOCKED</span>`;
    } else {
      badgeHtml = `<span class="badge badge-muted">LOCKED</span>`;
    }

    html += `
      <div class="session-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}"
           data-mod-id="${mod.id}"
           data-sess-id="${sess.id}"
           data-unlocked="${isUnlocked}">
        <div>
          <div class="mono-text" style="font-size: 0.75rem; color: var(--text-muted);">
            DRILL ${sess.sessionNum} // ${sess.durationMinutes} MINS
          </div>
          <div style="font-weight: 700; font-size: 0.95rem; margin-top: 2px; color: var(--text-primary);">
            ${sess.title}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            ${sess.setup.car} @ ${sess.setup.track}
          </div>
        </div>
        <div>${badgeHtml}</div>
      </div>
    `;
  });

  html += `</div>`;
  viewContainer.innerHTML = html;

  // Add click listener for Back button
  const backBtn = viewContainer.querySelector('#back-to-matrix-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      router.navigate('/curriculum');
    });
  }

  // Add click listeners to session cards
  const sessionCards = viewContainer.querySelectorAll('.session-card');
  sessionCards.forEach(card => {
    card.addEventListener('click', () => {
      const unlocked = card.getAttribute('data-unlocked') === 'true';
      if (unlocked) {
        const mId = card.getAttribute('data-mod-id');
        const sId = card.getAttribute('data-sess-id');
        router.navigate(`/session/${mId}/${sId}`);
      }
    });
  });
}
