/* ==========================================
   APEX Simracing Coach - Curriculum View Renderer
   ========================================== */

import { storage } from '../storage.js';
import { router } from '../router.js';

export function renderCurriculumView(curriculumData) {
  const viewContainer = document.getElementById('view-curriculum');
  if (!viewContainer || !curriculumData) return;

  const state = storage.getState();
  const completedSessions = state.progress.completedSessions || [];

  let html = `
    <div style="margin-bottom: 1.25rem;">
      <div class="hero-tag">
        <span>30-DAY DRIVING CURRICULUM</span>
      </div>
      <h1>CURRICULUM MATRIX</h1>
      <p>Select a module drill to launch your telemetry session.</p>
    </div>
  `;

  // Track unlocking status sequentially
  let previousSessionCompleted = true;

  curriculumData.modules.forEach(mod => {
    html += `
      <div class="card module-accordion">
        <div class="card-header" style="margin-bottom: 0.5rem;">
          <div>
            <div class="card-subtitle">MODULE ${mod.id}</div>
            <div class="card-title">${mod.title}</div>
          </div>
        </div>
        <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">${mod.description}</p>
        
        <!-- Hardware Settings Summary for Module -->
        <div class="telemetry-block" style="margin-bottom: 0.75rem; background-color: var(--bg-primary);">
          <div class="telemetry-label">MOZA R3 & FORZA BASELINE</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
            FFB: ${mod.mozaR3Global.ffbStrength} | Rotation: ${mod.mozaR3Global.wheelRotation} | Steering: ${mod.forzaGlobal.steeringMode} | ABS: ${mod.forzaGlobal.abs} | TCS: ${mod.forzaGlobal.tcs}
          </div>
        </div>

        <div class="session-list">
    `;

    let currentWeekTitle = '';
    mod.sessions.forEach(sess => {
      if (sess.weekTitle && sess.weekTitle !== currentWeekTitle) {
        currentWeekTitle = sess.weekTitle;
        html += `
          <div style="font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; color: var(--accent-red); margin-top: 0.75rem; margin-bottom: 0.35rem; letter-spacing: 0.05em; text-transform: uppercase;">
            ${currentWeekTitle}
          </div>
        `;
      }

      const isCompleted = completedSessions.includes(sess.id);
      const isUnlocked = previousSessionCompleted;
      previousSessionCompleted = isCompleted;

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

    html += `
        </div>
      </div>
    `;
  });

  viewContainer.innerHTML = html;

  // Add click listeners to session cards
  const sessionCards = viewContainer.querySelectorAll('.session-card');
  sessionCards.forEach(card => {
    card.addEventListener('click', () => {
      const unlocked = card.getAttribute('data-unlocked') === 'true';
      if (unlocked) {
        const modId = card.getAttribute('data-mod-id');
        const sessId = card.getAttribute('data-sess-id');
        router.navigate(`/session/${modId}/${sessId}`);
      }
    });
  });
}
