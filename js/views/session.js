/* ==========================================
   APEX Simracing Coach - 9-Step Session Wizard Renderer
   ========================================== */

import { storage } from '../storage.js';
import { router } from '../router.js';
import { ui } from '../ui.js';
import { exportSessionPDF } from '../pdf/pdf-exporter.js';

let currentStep = 1; // 1 to 9
let activeSession = null;
let activeModule = null;
let wizardFormData = {
  assessmentAnswers: {},
  psychRatings: {},
  reflectionAnswers: ["", "", ""],
  feedbackRating: 5
};

export function renderSessionView(curriculumData, modId, sessId) {
  const viewContainer = document.getElementById('view-session');
  if (!viewContainer || !curriculumData) return;

  // Find module & session
  let mod = curriculumData.modules.find(m => m.id == modId);
  if (!mod) mod = curriculumData.modules[0];
  let sess = mod.sessions.find(s => s.id == sessId);
  if (!sess) sess = mod.sessions[0];

  activeModule = mod;
  activeSession = sess;

  // Load prior saved data if exists
  const state = storage.getState();
  const existingSessionData = state.sessionData[sess.id] || {};
  wizardFormData = {
    assessmentAnswers: existingSessionData.assessmentScores || {},
    psychRatings: existingSessionData.psychRatings || {},
    reflectionAnswers: existingSessionData.reflections || ["", "", ""],
    feedbackRating: existingSessionData.feedbackRating || 5,
    lapsCompleted: existingSessionData.lapsCompleted || "",
    bestLapTime: existingSessionData.bestLapTime || "",
    driverNotes: existingSessionData.driverNotes || ""
  };

  currentStep = 1;
  renderWizardStep();
}

function renderWizardStep() {
  const viewContainer = document.getElementById('view-session');
  if (!viewContainer || !activeSession) return;

  const totalSteps = 9;
  const stepNames = [
    "SETUP & HARDWARE",
    "DRIVING THEORY",
    "PRACTICE DRILL",
    "PRACTICAL APPLICATION",
    "TARGET CHALLENGE",
    "KNOWLEDGE ASSESSMENT",
    "PSYCH CHECK-IN",
    "SESSION REFLECTION",
    "FEEDBACK & COMPLETION"
  ];

  // Render Segmented Progress Bar
  let progressSegmentsHtml = '';
  for (let i = 1; i <= totalSteps; i++) {
    let classes = 'wizard-segment';
    if (i === currentStep) classes += ' active';
    else if (i < currentStep) classes += ' completed';
    progressSegmentsHtml += `<div class="${classes}"></div>`;
  }

  // Render Step Content
  let stepContentHtml = '';

  switch (currentStep) {
    case 1: // Setup
      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            HARDWARE & SESSION SETUP
          </div>
          <div class="setup-spec-grid">
            <div class="telemetry-block">
              <div class="telemetry-label">RECOMMENDED CAR</div>
              <div class="telemetry-value" style="font-size: 1rem;">${activeSession.setup.car}</div>
            </div>
            <div class="telemetry-block">
              <div class="telemetry-label">TARGET TRACK</div>
              <div class="telemetry-value" style="font-size: 1rem;">${activeSession.setup.track}</div>
            </div>
          </div>
          
          <div style="margin-top: 1rem;">
            <div class="form-label" style="color: var(--accent-red);">MOZA R3 DIRECT DRIVE NOTE:</div>
            <p>${activeSession.setup.mozaR3Note}</p>
          </div>

          <div style="margin-top: 0.75rem;">
            <div class="form-label" style="color: var(--accent-red);">FORZA MOTORSPORT 2023 NOTE:</div>
            <p>${activeSession.setup.forzaNote}</p>
          </div>
        </div>
      `;
      break;

    case 2: // Theory
      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            DRIVING TECHNIQUE THEORY (MAX 200 WORDS)
          </div>
          <div style="font-size: 1rem; line-height: 1.6; color: var(--text-primary); padding: 0.5rem 0;">
            ${activeSession.theory}
          </div>
        </div>
      `;
      break;

    case 3: // Practice Drill
      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>
            PRACTICE DRILL EXERCISE
          </div>
          <div style="font-size: 1.05rem; line-height: 1.6; color: var(--text-primary); padding: 0.5rem 0;">
            ${activeSession.drill}
          </div>
        </div>
      `;
      break;

    case 4: // Practical
      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            PRACTICAL STINT APPLICATION
          </div>
          <div style="font-size: 1.05rem; line-height: 1.6; color: var(--text-primary); padding: 0.5rem 0;">
            ${activeSession.practical}
          </div>
        </div>
      `;
      break;

    case 5: // Challenge
      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-2.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
            SESSION TARGET CHALLENGE
          </div>
          <div style="font-size: 1.05rem; line-height: 1.6; color: var(--accent-red); font-weight: 600; padding: 0.5rem 0;">
            ${activeSession.challenge}
          </div>
        </div>
      `;
      break;

    case 6: // Assessment
      let questionsHtml = '';
      activeSession.assessment.forEach((q, idx) => {
        const selectedOpt = wizardFormData.assessmentAnswers[q.id];
        let optionsHtml = '';
        q.options.forEach((opt, optIdx) => {
          const isSelected = selectedOpt === optIdx;
          optionsHtml += `
            <div class="quiz-option ${isSelected ? 'selected' : ''}" data-qid="${q.id}" data-optidx="${optIdx}">
              <input type="radio" name="q_${q.id}" ${isSelected ? 'checked' : ''}>
              <span style="font-size: 0.9rem;">${opt}</span>
            </div>
          `;
        });

        questionsHtml += `
          <div style="margin-bottom: 1.25rem;">
            <div class="form-label">QUESTION ${idx + 1}: ${q.question}</div>
            ${optionsHtml}
          </div>
        `;
      });

      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            KNOWLEDGE ASSESSMENT (3 QUESTIONS)
          </div>
          ${questionsHtml}
        </div>
      `;
      break;

    case 7: // Psych Check-in
      let psychHtml = '';
      activeSession.psychCheckin.forEach((p, idx) => {
        const currentVal = wizardFormData.psychRatings[p.id] || 4;
        psychHtml += `
          <div style="margin-bottom: 1.25rem;">
            <div class="form-label">${idx + 1}. ${p.prompt}</div>
            <div class="flex-between" style="margin-bottom: 0.4rem;">
              <span class="mono-text" style="font-size: 0.75rem; color: var(--text-muted);">${p.minLabel}</span>
              <span class="mono-text text-red" style="font-size: 1rem; font-weight: 700;">RATING: ${currentVal} / 5</span>
              <span class="mono-text" style="font-size: 0.75rem; color: var(--text-muted);">${p.maxLabel}</span>
            </div>
            <div class="flex-row gap-sm">
              ${[1, 2, 3, 4, 5].map(val => `
                <button class="btn ${currentVal == val ? 'btn-primary' : 'btn-secondary'} psych-btn"
                        style="flex: 1; padding: 0.5rem 0;"
                        data-pid="${p.id}"
                        data-pval="${val}">${val}</button>
              `).join('')}
            </div>
          </div>
        `;
      });

      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            PSYCHOLOGICAL CHECK-IN
          </div>
          ${psychHtml}
        </div>
      `;
      break;

    case 8: // Reflection
      let reflectionHtml = '';
      activeSession.reflection.forEach((r, idx) => {
        const textVal = wizardFormData.reflectionAnswers[idx] || '';
        reflectionHtml += `
          <div class="form-group">
            <label class="form-label">${idx + 1}. ${r}</label>
            <textarea class="form-textarea reflection-input" data-ridx="${idx}" placeholder="Type your reflection notes here...">${textVal}</textarea>
          </div>
        `;
      });

      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            OPEN-ENDED DRIVER REFLECTION
          </div>
          ${reflectionHtml}
        </div>
      `;
      break;

    case 9: // Feedback & Completion
      stepContentHtml = `
        <div class="step-card">
          <div class="step-section-title">
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            SESSION FEEDBACK & DEBRIEF
          </div>

          <div class="form-group">
            <label class="form-label">RATE THIS DRILL SESSION EXPERIENCE:</label>
            <div class="flex-row gap-sm">
              ${[1, 2, 3, 4, 5].map(val => `
                <button class="btn ${wizardFormData.feedbackRating == val ? 'btn-primary' : 'btn-secondary'} feedback-btn"
                        style="flex: 1; padding: 0.6rem 0;"
                        data-fval="${val}">★ ${val}</button>
              `).join('')}
            </div>
          </div>

          <!-- Empirical Telemetry Stint Log -->
          <div class="telemetry-block" style="margin-top: 1.25rem; background-color: var(--bg-primary);">
            <div class="telemetry-label" style="color: var(--accent-red); margin-bottom: 0.5rem;">TELEMETRY STINT LOG</div>
            <div class="flex-row gap-sm" style="margin-bottom: 0.75rem;">
              <div style="flex: 1;">
                <label class="form-label" style="font-size: 0.75rem;">LAPS COMPLETED</label>
                <input type="number" id="telemetry-laps-input" class="form-input" style="width: 100%; padding: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: var(--font-mono);" placeholder="e.g. 10" value="${wizardFormData.lapsCompleted || ''}">
              </div>
              <div style="flex: 1;">
                <label class="form-label" style="font-size: 0.75rem;">BEST LAP TIME</label>
                <input type="text" id="telemetry-laptime-input" class="form-input" style="width: 100%; padding: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: var(--font-mono);" placeholder="e.g. 0:58.420" value="${wizardFormData.bestLapTime || ''}">
              </div>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">DRIVER DEBRIEF NOTES</label>
              <textarea id="telemetry-notes-input" class="form-textarea" style="width: 100%; padding: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); min-height: 60px;" placeholder="Notes on balance, apex line, or force feedback sensations...">${wizardFormData.driverNotes || ''}</textarea>
            </div>
          </div>

          <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="export-pdf-step9-btn" class="btn btn-secondary btn-block" style="padding: 0.85rem; font-size: 1rem;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              EXPORT PDF REPORT
            </button>
            <button id="complete-session-action-btn" class="btn btn-primary btn-block" style="padding: 1rem; font-size: 1.1rem;">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              LOG & COMPLETE SESSION DRILL
            </button>
          </div>
        </div>
      `;
      break;
  }

  viewContainer.innerHTML = `
    <!-- Top Header Bar for Wizard -->
    <div class="wizard-header">
      <div class="wizard-title-row">
        <div class="wizard-step-badge">STEP ${currentStep} OF ${totalSteps} // ${stepNames[currentStep - 1]}</div>
        <button id="wizard-exit-btn" class="icon-btn" style="min-width: 32px; min-height: 32px;" title="Exit Session">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <h2 style="font-size: 1.2rem;">${activeSession.title}</h2>
      
      <!-- Segmented Bar -->
      <div class="wizard-progress" style="margin-top: 0.75rem;">
        ${progressSegmentsHtml}
      </div>
    </div>

    <!-- Step Content Body -->
    ${stepContentHtml}

    <!-- Bottom Navigation Footer Buttons -->
    <div class="wizard-nav-footer">
      ${currentStep > 1 ? `
        <button id="wizard-prev-btn" class="btn btn-secondary" style="flex: 1;">
          ← PREVIOUS
        </button>
      ` : ''}
      ${currentStep < totalSteps ? `
        <button id="wizard-next-btn" class="btn btn-primary" style="flex: 2;">
          NEXT STEP →
        </button>
      ` : ''}
    </div>
  `;

  attachWizardListeners();
}

function attachWizardListeners() {
  const exitBtn = document.getElementById('wizard-exit-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('Exit current session drill? Progress so far is saved.')) {
        router.navigate('/curriculum');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        renderWizardStep();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < 9) {
        currentStep++;
        renderWizardStep();
      }
    });
  }

  // Quiz Option Listeners
  const quizOpts = document.querySelectorAll('.quiz-option');
  quizOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      const qid = opt.getAttribute('data-qid');
      const optIdx = parseInt(opt.getAttribute('data-optidx'), 10);
      wizardFormData.assessmentAnswers[qid] = optIdx;
      renderWizardStep();
    });
  });

  // Psych Button Listeners
  const psychBtns = document.querySelectorAll('.psych-btn');
  psychBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-pid');
      const pval = parseInt(btn.getAttribute('data-pval'), 10);
      wizardFormData.psychRatings[pid] = pval;
      renderWizardStep();
    });
  });

  // Reflection Input Listeners
  const reflectionInputs = document.querySelectorAll('.reflection-input');
  reflectionInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const ridx = parseInt(input.getAttribute('data-ridx'), 10);
      wizardFormData.reflectionAnswers[ridx] = e.target.value;
    });
  });

  // Telemetry Input Listeners (Step 9)
  const lapsInput = document.getElementById('telemetry-laps-input');
  if (lapsInput) {
    lapsInput.addEventListener('input', (e) => {
      wizardFormData.lapsCompleted = e.target.value;
    });
  }
  const lapTimeInput = document.getElementById('telemetry-laptime-input');
  if (lapTimeInput) {
    lapTimeInput.addEventListener('input', (e) => {
      wizardFormData.bestLapTime = e.target.value;
    });
  }
  const notesInput = document.getElementById('telemetry-notes-input');
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      wizardFormData.driverNotes = e.target.value;
    });
  }

  // Feedback Rating Listeners
  const feedbackBtns = document.querySelectorAll('.feedback-btn');
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wizardFormData.feedbackRating = parseInt(btn.getAttribute('data-fval'), 10);
      renderWizardStep();
    });
  });

  // Step 9 Export PDF Button Listener
  const exportPdfBtn = document.getElementById('export-pdf-step9-btn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async () => {
      try {
        exportPdfBtn.disabled = true;
        const originalHtml = exportPdfBtn.innerHTML;
        exportPdfBtn.innerHTML = `GENERATING TELEMETRY PDF...`;

        let correctCount = 0;
        if (activeSession.assessment) {
          activeSession.assessment.forEach(q => {
            if (wizardFormData.assessmentAnswers[q.id] === q.correctIndex) {
              correctCount++;
            }
          });
        }

        const currentSessionData = {
          completedAt: new Date().toISOString(),
          assessmentScores: wizardFormData.assessmentAnswers,
          assessmentPassed: correctCount >= 2,
          correctCount: correctCount,
          totalQuestions: activeSession.assessment ? activeSession.assessment.length : 3,
          psychRatings: wizardFormData.psychRatings,
          reflections: wizardFormData.reflectionAnswers,
          feedbackRating: wizardFormData.feedbackRating,
          lapsCompleted: wizardFormData.lapsCompleted || "",
          bestLapTime: wizardFormData.bestLapTime || "",
          driverNotes: wizardFormData.driverNotes || ""
        };

        await exportSessionPDF(activeSession, currentSessionData, activeModule);
        ui.showToast('PDF Telemetry Report Generated!', 'success');
        exportPdfBtn.innerHTML = originalHtml;
      } catch (err) {
        console.error('PDF Export Error:', err);
        ui.showToast('Failed to generate PDF report', 'error');
      } finally {
        exportPdfBtn.disabled = false;
      }
    });
  }

  // Complete Session Button Listener
  const completeActionBtn = document.getElementById('complete-session-action-btn');
  if (completeActionBtn) {
    completeActionBtn.addEventListener('click', () => {
      saveAndCompleteSession();
    });
  }
}

function saveAndCompleteSession() {
  // Check if assessment questions passed
  let correctCount = 0;
  activeSession.assessment.forEach(q => {
    if (wizardFormData.assessmentAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const passed = correctCount >= 2; // Pass criteria: at least 2/3 correct

  storage.updateState(state => {
    if (!state.progress.completedSessions.includes(activeSession.id)) {
      state.progress.completedSessions.push(activeSession.id);
    }
    state.progress.currentModuleId = activeModule.id;
    state.progress.currentSessionId = activeSession.id;

    state.sessionData[activeSession.id] = {
      completedAt: new Date().toISOString(),
      assessmentScores: wizardFormData.assessmentAnswers,
      assessmentPassed: passed,
      correctCount: correctCount,
      totalQuestions: activeSession.assessment.length,
      psychRatings: wizardFormData.psychRatings,
      reflections: wizardFormData.reflectionAnswers,
      feedbackRating: wizardFormData.feedbackRating,
      lapsCompleted: wizardFormData.lapsCompleted || "",
      bestLapTime: wizardFormData.bestLapTime || "",
      driverNotes: wizardFormData.driverNotes || ""
    };
  });

  ui.showToast(`Session Completed! Assessment Score: ${correctCount}/3`, passed ? 'success' : 'info');
  router.navigate('/progress');
}
