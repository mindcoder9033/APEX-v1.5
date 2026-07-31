/* ==========================================
   APEX Simracing Coach - Telemetry Progress & Analytics Renderer
   ========================================== */

import { storage } from '../storage.js';
import { ui } from '../ui.js';
import { exportSessionPDF } from '../pdf/pdf-exporter.js';

export function renderProgressView(curriculumData) {
  const viewContainer = document.getElementById('view-progress');
  if (!viewContainer || !curriculumData) return;

  const state = storage.getState();
  const completedSessionIds = state.progress.completedSessions || [];
  const sessionDataMap = state.sessionData || {};

  // Compute Analytics Data
  const totalSessions = curriculumData.modules.reduce((acc, m) => acc + m.sessions.length, 0);
  const completedCount = completedSessionIds.length;
  const totalMinutes = completedCount * 45;

  let totalCorrect = 0;
  let totalQuestions = 0;
  let psychScoreSum = 0;
  let psychScoreCount = 0;

  const historyItems = [];

  // Map session IDs to data
  curriculumData.modules.forEach(mod => {
    mod.sessions.forEach(sess => {
      if (completedSessionIds.includes(sess.id)) {
        const sData = sessionDataMap[sess.id] || {};
        if (sData.correctCount !== undefined) {
          totalCorrect += sData.correctCount;
          totalQuestions += (sData.totalQuestions || 3);
        }

        if (sData.psychRatings) {
          Object.values(sData.psychRatings).forEach(val => {
            psychScoreSum += Number(val);
            psychScoreCount++;
          });
        }

        historyItems.push({
          session: sess,
          module: mod,
          data: sData
        });
      }
    });
  });

  const assessmentPassPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgPsychRating = psychScoreCount > 0 ? (psychScoreSum / psychScoreCount).toFixed(1) : 'N/A';

  // SVG Trend Chart Generation
  const svgGraphHtml = generateSVGGraph(historyItems);

  let historyListHtml = '';
  if (historyItems.length === 0) {
    historyListHtml = `
      <div class="card" style="text-align: center; padding: 2rem;">
        <div class="card-subtitle" style="margin-bottom: 0.5rem;">NO COMPLETED DRILLS YET</div>
        <p>Complete your first target session drill to unlock telemetry historical analytics.</p>
      </div>
    `;
  } else {
    historyItems.forEach(item => {
      const dateStr = item.data.completedAt ? new Date(item.data.completedAt).toLocaleDateString() : 'Completed';
      const reflections = item.data.reflections || [];

      historyListHtml += `
        <div class="history-log-item">
          <div class="history-log-header">
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
              MOD ${item.module.id} // ${item.session.title}
            </div>
            <span class="badge ${item.data.assessmentPassed ? 'badge-green' : 'badge-amber'}">
              SCORE: ${item.data.correctCount || 0}/3
            </span>
          </div>
          <div class="card-subtitle" style="margin-bottom: 0.25rem;">
            ${dateStr} | ${item.session.setup.car} @ ${item.session.setup.track}
          </div>
          ${item.data.bestLapTime || item.data.lapsCompleted ? `
            <div class="mono-text" style="font-size: 0.8rem; color: var(--accent-green); margin-bottom: 0.35rem;">
              ${item.data.bestLapTime ? `BEST LAP: ${item.data.bestLapTime}` : ''} ${item.data.lapsCompleted ? `// LAPS: ${item.data.lapsCompleted}` : ''}
            </div>
          ` : ''}
          ${reflections[0] ? `
            <div style="font-size: 0.85rem; color: var(--text-secondary); background: var(--bg-primary); padding: 0.5rem; border-left: 2px solid var(--border-highlight); margin-top: 0.4rem;">
              " ${reflections[0]} "
            </div>
          ` : ''}
          <div style="margin-top: 0.6rem; display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary export-history-pdf-btn" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; min-height: 32px;" data-sessid="${item.session.id}" data-modid="${item.module.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              DOWNLOAD PDF
            </button>
          </div>
        </div>
      `;
    });
  }

  viewContainer.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <div class="hero-tag">
        <span>PERFORMANCE TELEMETRY & HISTORY</span>
      </div>
      <h1>DRIVER ANALYTICS</h1>
      <p>Track your technical score trends and reflection history.</p>
    </div>

    <!-- Telemetry Stats Cards -->
    <div class="telemetry-grid">
      <div class="telemetry-block">
        <div class="telemetry-label">STINTS DONE</div>
        <div class="telemetry-value highlight">${completedCount} / ${totalSessions}</div>
      </div>
      <div class="telemetry-block">
        <div class="telemetry-label">QUIZ ACCURACY</div>
        <div class="telemetry-value text-green">${assessmentPassPercent}%</div>
      </div>
      <div class="telemetry-block">
        <div class="telemetry-label">AVG PSYCH POISE</div>
        <div class="telemetry-value">${avgPsychRating} / 5</div>
      </div>
      <div class="telemetry-block">
        <div class="telemetry-label">TRACK TIME</div>
        <div class="telemetry-value">${totalMinutes} MINS</div>
      </div>
    </div>

    <!-- SVG Trend Line Graph Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">ASSESSMENT ACCURACY TREND</div>
        <div class="card-subtitle">SCORE PROFILES</div>
      </div>
      <div class="analytics-chart-container">
        ${svgGraphHtml}
      </div>
    </div>

    <!-- Historical Drill Logs -->
    <div style="margin-top: 1.5rem;">
      <div class="card-header" style="padding-left: 0; padding-right: 0;">
        <div class="card-title">DRILL HISTORY & REFLECTION LOGS</div>
        <div class="card-subtitle">${historyItems.length} ENTRIES</div>
      </div>
      ${historyListHtml}
    </div>
  `;

  // Attach PDF Export Event Listeners for History Items
  const exportPdfBtns = viewContainer.querySelectorAll('.export-history-pdf-btn');
  exportPdfBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const sessId = btn.getAttribute('data-sessid');
      const modId = btn.getAttribute('data-modid');

      const mod = curriculumData.modules.find(m => m.id == modId);
      const sess = mod ? mod.sessions.find(s => s.id == sessId) : null;
      const sData = sessionDataMap[sessId] || {};

      if (!sess || !mod) return;

      try {
        btn.disabled = true;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = 'GENERATING...';

        await exportSessionPDF(sess, sData, mod);
        ui.showToast('PDF Telemetry Report Generated!', 'success');
        btn.innerHTML = originalHtml;
      } catch (err) {
        console.error('PDF Export Error:', err);
        ui.showToast('Failed to generate PDF report', 'error');
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function generateSVGGraph(historyItems) {
  if (historyItems.length < 2) {
    return `
      <div style="height: 120px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">
        COMPLETE 2+ SESSIONS TO GENERATE TELEMETRY LINE GRAPH
      </div>
    `;
  }

  const width = 460;
  const height = 140;
  const padding = 25;

  const points = historyItems.map((item, index) => {
    const x = padding + (index / (historyItems.length - 1)) * (width - 2 * padding);
    const score = item.data.correctCount || 0; // 0 to 3
    const y = height - padding - (score / 3) * (height - 2 * padding);
    return { x, y, score };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  let dotsSvg = '';
  points.forEach(p => {
    dotsSvg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#E10600" stroke="#FFFFFF" stroke-width="1.5" />`;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="analytics-svg-graph">
      <!-- Background Grid Lines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#3A3A45" stroke-dasharray="3,3" />
      <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="#3A3A45" stroke-dasharray="3,3" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#3A3A45" />
      
      <!-- Trend Polyline -->
      <polyline fill="none" stroke="#E10600" stroke-width="3" stroke-linecap="square" points="${polylinePoints}" />
      
      <!-- Data Points -->
      ${dotsSvg}
    </svg>
  `;
}
