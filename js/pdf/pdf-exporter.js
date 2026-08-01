/* ==========================================
   APEX Simracing Coach - PDF Exporter Module
   Powered by html2pdf.js (Browser Native Export)
   ========================================== */

/**
 * Ensures html2pdf library script is loaded in the browser.
 */
export async function ensurePdfLibrariesLoaded() {
  if (window.html2pdf) {
    return true;
  }

  return new Promise((resolve, reject) => {
    const src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    if (document.querySelector(`script[src="${src}"]`)) {
      const checkInterval = setInterval(() => {
        if (window.html2pdf) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load PDF export library script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Creates and exports a PDF document for a completed session.
 * @param {Object} session - Session definitions object
 * @param {Object} sessionData - Completed session user data
 * @param {Object} module - Module definitions object
 */
export async function exportSessionPDF(session, sessionData, module) {
  await ensurePdfLibrariesLoaded();

  const dateFormatted = sessionData.completedAt
    ? new Date(sessionData.completedAt).toLocaleString()
    : new Date().toLocaleString();

  const correctCount = sessionData.correctCount !== undefined ? sessionData.correctCount : 0;
  const totalQuestions = sessionData.totalQuestions || (session && session.assessment ? session.assessment.length : 3);
  const passed = sessionData.assessmentPassed !== undefined ? sessionData.assessmentPassed : correctCount >= 2;

  // Build HTML string for PDF rendering
  let quizRowsHtml = '';
  if (session && session.assessment && session.assessment.length > 0) {
    quizRowsHtml = session.assessment.map((q, idx) => {
      const userAnsIdx = sessionData.assessmentScores ? sessionData.assessmentScores[q.id] : undefined;
      const userAnsText = userAnsIdx !== undefined && q.options[userAnsIdx] ? q.options[userAnsIdx] : 'Not Answered';
      const isCorrect = userAnsIdx === q.correctIndex;

      return `
        <tr style="border-bottom: 1px solid #EAEAEA; font-size: 11px;">
          <td style="padding: 8px; color: #121212;"><strong>${idx + 1}.</strong> ${q.question}</td>
          <td style="padding: 8px; color: #444455;">${userAnsText}</td>
          <td style="padding: 8px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 10px; ${isCorrect ? 'background: #E6F9F0; color: #008744;' : 'background: #FFEBEB; color: #CC0000;'}">
              ${isCorrect ? 'PASS' : 'FAIL'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    quizRowsHtml = `<tr><td colspan="3" style="padding: 8px; color: #888; text-align: center;">No assessment recorded.</td></tr>`;
  }

  let psychHtml = '';
  if (session && session.psychCheckin && session.psychCheckin.length > 0) {
    psychHtml = session.psychCheckin.map((p, idx) => {
      const val = sessionData.psychRatings && sessionData.psychRatings[p.id] !== undefined
        ? sessionData.psychRatings[p.id]
        : (sessionData.psychRatings ? sessionData.psychRatings[p.prompt] || 'N/A' : 'N/A');
      return `
        <div style="flex: 1; min-width: 110px; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 8px 12px; margin-right: 8px; margin-bottom: 8px;">
          <div style="font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase;">CHECK-IN #${idx + 1}</div>
          <div style="font-size: 14px; font-weight: bold; color: #121212; margin-top: 4px;">${val} / 5</div>
        </div>
      `;
    }).join('');
  } else {
    psychHtml = ['Focus', 'Confidence', 'Energy', 'Stress'].map(label => {
      const val = sessionData.psychRatings ? sessionData.psychRatings[label.toLowerCase()] || 'N/A' : 'N/A';
      return `
        <div style="flex: 1; min-width: 110px; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 8px 12px; margin-right: 8px; margin-bottom: 8px;">
          <div style="font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase;">${label.toUpperCase()}</div>
          <div style="font-size: 14px; font-weight: bold; color: #121212; margin-top: 4px;">${val} / 5</div>
        </div>
      `;
    }).join('');
  }

  let reflectionHtml = '';
  const reflectionPrompts = session ? (session.reflection || session.reflectionPrompts) : null;
  if (reflectionPrompts && reflectionPrompts.length > 0) {
    reflectionHtml = reflectionPrompts.map((prompt, idx) => {
      const ans = sessionData.reflections ? sessionData.reflections[idx] : '';
      return `
        <div style="background: #F8F9FA; border-left: 3px solid #3A3A45; padding: 8px 12px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
          <div style="font-size: 10px; font-weight: bold; color: #555566; margin-bottom: 2px;">PROMPT ${idx + 1}: ${prompt}</div>
          <div style="font-size: 11px; color: #121212; font-family: monospace;">${ans || '(No response provided)'}</div>
        </div>
      `;
    }).join('');
  }

  const container = document.createElement('div');
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.padding = '0';
  container.style.margin = '0 auto';
  container.style.backgroundColor = '#FFFFFF';
  container.style.fontFamily = 'Helvetica, Arial, sans-serif';
  container.style.color = '#121212';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <!-- Header Bar -->
    <div style="background: #121212; border-bottom: 4px solid #E10600; padding: 16px 30px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="color: #FFFFFF; font-size: 18px; font-weight: 800; letter-spacing: 1px;">APEX // SIMRACING COACH</div>
        <div style="color: #E10600; font-size: 12px; font-weight: 700; margin-top: 2px;">TELEMETRY SESSION REPORT</div>
      </div>
      <div style="text-align: right; color: #A0A0B0; font-size: 9px; font-weight: 600;">
        <div>MOZA R3 DIRECT DRIVE</div>
        <div>FORZA MOTORSPORT (2023)</div>
      </div>
    </div>

    <div style="padding: 24px 30px;">
      <!-- Meta Banner -->
      <div style="background: #F4F4F6; border-left: 4px solid #E10600; border-radius: 0 4px 4px 0; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between;">
        <div>
          <div style="font-size: 9px; font-weight: bold; color: #E10600; text-transform: uppercase;">MODULE ${module ? module.id : ''}</div>
          <div style="font-size: 12px; font-weight: bold; color: #121212; margin-top: 2px;">${module ? module.title : ''}</div>
        </div>
        <div>
          <div style="font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase;">SESSION DRILL</div>
          <div style="font-size: 12px; font-weight: bold; color: #121212; margin-top: 2px;">${session ? session.title : ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase;">COMPLETED AT</div>
          <div style="font-size: 11px; font-weight: bold; color: #121212; margin-top: 2px;">${dateFormatted}</div>
        </div>
      </div>

      <!-- Section 1: Hardware & Setup -->
      <div style="font-size: 11px; font-weight: bold; color: #121212; border-bottom: 1.5px solid #121212; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">
        1. HARDWARE & TRACK SETUP
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 12px;">
        <div style="flex: 1; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 8px 12px;">
          <div style="font-size: 9px; font-weight: bold; color: #666;">TARGET CAR</div>
          <div style="font-size: 12px; font-weight: bold; color: #121212; margin-top: 2px;">${session && session.setup ? session.setup.car : 'N/A'}</div>
        </div>
        <div style="flex: 1; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 8px 12px;">
          <div style="font-size: 9px; font-weight: bold; color: #666;">TARGET TRACK</div>
          <div style="font-size: 12px; font-weight: bold; color: #121212; margin-top: 2px;">${session && session.setup ? session.setup.track : 'N/A'}</div>
        </div>
      </div>
      ${session && session.setup && session.setup.mozaR3Note ? `
        <div style="background: #FFF8F8; border-left: 3px solid #E10600; padding: 8px 12px; margin-bottom: 16px; border-radius: 0 4px 4px 0;">
          <div style="font-size: 9px; font-weight: bold; color: #E10600; margin-bottom: 2px;">MOZA R3 FFB NOTE:</div>
          <div style="font-size: 10px; color: #333344;">${session.setup.mozaR3Note}</div>
        </div>
      ` : ''}

      <!-- Section 2: Telemetry & Performance -->
      <div style="font-size: 11px; font-weight: bold; color: #121212; border-bottom: 1.5px solid #121212; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">
        2. TELEMETRY & PERFORMANCE SUMMARY
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <div style="flex: 1; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 10px 12px;">
          <div style="font-size: 9px; font-weight: bold; color: #666;">BEST LAP TIME</div>
          <div style="font-size: 14px; font-weight: bold; color: #121212; margin-top: 2px;">${sessionData.bestLapTime || 'N/A'}</div>
        </div>
        <div style="flex: 1; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 10px 12px;">
          <div style="font-size: 9px; font-weight: bold; color: #666;">LAPS COMPLETED</div>
          <div style="font-size: 14px; font-weight: bold; color: #121212; margin-top: 2px;">${sessionData.lapsCompleted || 'N/A'}</div>
        </div>
        <div style="flex: 1; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 10px 12px;">
          <div style="font-size: 9px; font-weight: bold; color: #666;">QUIZ SCORE</div>
          <div style="font-size: 14px; font-weight: bold; color: ${passed ? '#008744' : '#E10600'}; margin-top: 2px;">
            ${correctCount}/${totalQuestions} (${passed ? 'PASSED' : 'RETRY'})
          </div>
        </div>
        <div style="flex: 1; background: #F8F9FA; border: 1px solid #E0E0E8; border-radius: 4px; padding: 10px 12px;">
          <div style="font-size: 9px; font-weight: bold; color: #666;">DRIVER RATING</div>
          <div style="font-size: 14px; font-weight: bold; color: #121212; margin-top: 2px;">${sessionData.feedbackRating || 5} / 5 Stars</div>
        </div>
      </div>

      <!-- Section 3: Knowledge Assessment -->
      <div style="font-size: 11px; font-weight: bold; color: #121212; border-bottom: 1.5px solid #121212; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">
        3. KNOWLEDGE ASSESSMENT RESULTS
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #E0E0E8; border-radius: 4px; overflow: hidden;">
        <thead>
          <tr style="background: #121212; color: #FFFFFF; font-size: 10px; text-align: left;">
            <th style="padding: 8px; width: 50%;">QUESTION</th>
            <th style="padding: 8px; width: 35%;">SELECTED ANSWER</th>
            <th style="padding: 8px; width: 15%; text-align: center;">RESULT</th>
          </tr>
        </thead>
        <tbody>
          ${quizRowsHtml}
        </tbody>
      </table>

      <!-- Section 4: Psych Check-in -->
      <div style="font-size: 11px; font-weight: bold; color: #121212; border-bottom: 1.5px solid #121212; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">
        4. PSYCHOLOGICAL CHECK-IN RATINGS
      </div>
      <div style="display: flex; flex-wrap: wrap; margin-bottom: 16px;">
        ${psychHtml}
      </div>

      <!-- Section 5: Driver Reflections & Notes -->
      <div style="font-size: 11px; font-weight: bold; color: #121212; border-bottom: 1.5px solid #121212; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">
        5. DRIVER REFLECTION & NOTES
      </div>
      ${reflectionHtml}
      ${sessionData.driverNotes ? `
        <div style="background: #F8F9FA; border-left: 3px solid #E10600; padding: 8px 12px; margin-top: 8px; border-radius: 0 4px 4px 0;">
          <div style="font-size: 10px; font-weight: bold; color: #E10600; margin-bottom: 2px;">ADDITIONAL TELEMETRY NOTES:</div>
          <div style="font-size: 11px; color: #121212; font-family: monospace;">${sessionData.driverNotes}</div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 24px; border-top: 1px solid #E0E0E8; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #888899;">
        <div>APEX SIMRACING TELEMETRY SYSTEM v1.5 • OFFICIAL SESSION DRILL REPORT</div>
        <div>Generated: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>
  `;

  // Render to PDF using html2pdf
  const filename = `APEX_Session_${session ? session.id : 'drill'}_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`;
  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };

  return window.html2pdf().set(opt).from(container).save();
}
