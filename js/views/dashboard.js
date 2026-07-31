/* ==========================================
   APEX Simracing Coach - Dashboard View Renderer
   ========================================== */

import { storage } from '../storage.js';
import { router } from '../router.js';

export function renderDashboardView(curriculumData, settingsData) {
  const viewContainer = document.getElementById('view-dashboard');
  if (!viewContainer || !curriculumData) return;

  const state = storage.getState();
  const completedSessions = state.progress.completedSessions || [];
  
  // Find current/next active session
  let nextSession = null;
  let nextModule = null;

  for (const mod of curriculumData.modules) {
    for (const sess of mod.sessions) {
      if (!completedSessions.includes(sess.id)) {
        nextSession = sess;
        nextModule = mod;
        break;
      }
    }
    if (nextSession) break;
  }

  // If all completed, default to last session
  if (!nextSession) {
    nextModule = curriculumData.modules[curriculumData.modules.length - 1];
    nextSession = nextModule.sessions[nextModule.sessions.length - 1];
  }

  // Compute Stats
  const totalSessions = curriculumData.modules.reduce((acc, m) => acc + m.sessions.length, 0);
  const completedCount = completedSessions.length;
  const progressPercent = Math.round((completedCount / (totalSessions || 1)) * 100);
  const totalMinutes = completedCount * 45;

  // Calculate assessment pass rate
  let totalAssessments = 0;
  let passedAssessments = 0;
  Object.values(state.sessionData || {}).forEach(s => {
    if (s.assessmentScores) {
      totalAssessments++;
      if (s.assessmentPassed) passedAssessments++;
    }
  });
  const passRate = totalAssessments > 0 ? Math.round((passedAssessments / totalAssessments) * 100) : 100;

  viewContainer.innerHTML = `
    <!-- Hero / Next Session Card -->
    <div class="dashboard-hero">
      <div class="hero-tag">
        <span class="hero-tag-pulse"></span>
        <span>NEXT TARGET SESSION // MODULE ${nextModule.id}</span>
      </div>
      <h1 class="hero-title">${nextSession.title}</h1>
      <p class="hero-subtitle">${nextSession.subtitle}</p>
      
      <div class="telemetry-grid" style="margin: 1rem 0;">
        <div class="telemetry-block">
          <div class="telemetry-label">CAR</div>
          <div class="telemetry-value" style="font-size: 0.95rem;">${nextSession.setup.car}</div>
        </div>
        <div class="telemetry-block">
          <div class="telemetry-label">TRACK</div>
          <div class="telemetry-value" style="font-size: 0.95rem;">${nextSession.setup.track}</div>
        </div>
      </div>

      <button id="launch-session-btn" class="btn btn-primary btn-block">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        ${completedSessions.includes(nextSession.id) ? 'REVIEW SESSION DRILL' : 'LAUNCH SESSION DRILL'}
      </button>
    </div>

    <!-- Overall 30-Day Curriculum Progress Gauge -->
    <div class="overall-progress-card">
      <div class="progress-header">
        <div class="card-title">CURRICULUM PROGRESS</div>
        <div class="mono-text text-red" style="font-weight: 700;">${progressPercent}%</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
      <div class="flex-between" style="margin-top: 0.4rem;">
        <div class="card-subtitle">${completedCount} OF ${totalSessions} DRILLS COMPLETED</div>
        <div class="card-subtitle">${totalMinutes} MINS LOGGED</div>
      </div>
    </div>

    <!-- Telemetry Stats Grid -->
    <div class="telemetry-grid">
      <div class="telemetry-block">
        <div class="telemetry-label">DRILLS DONE</div>
        <div class="telemetry-value highlight">${completedCount} / ${totalSessions}</div>
      </div>
      <div class="telemetry-block">
        <div class="telemetry-label">PASS RATE</div>
        <div class="telemetry-value text-green">${passRate}%</div>
      </div>
      <div class="telemetry-block">
        <div class="telemetry-label">CURRENT MOD</div>
        <div class="telemetry-value">MOD ${nextModule.id}</div>
      </div>
    </div>

    <!-- Hardware Quick Setup Reminder -->
    <div class="hardware-badge-card">
      <div class="hardware-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="hardware-details">
        <div class="card-title" style="font-size: 0.95rem;">MOZA R3 + FORZA 2023 ACTIVE</div>
        <div class="card-subtitle">FFB: 100% // Rotation: 900° // Normal Steering</div>
      </div>
    </div>
  `;

  // Attach button click listener
  const launchBtn = document.getElementById('launch-session-btn');
  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      router.navigate(`/session/${nextModule.id}/${nextSession.id}`);
    });
  }
}
