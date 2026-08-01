/* ==========================================
   APEX Simracing Coach - PDF Exporter Module
   Powered by React & @react-pdf/renderer
   ========================================== */

/**
 * Ensures React and @react-pdf/renderer scripts are loaded in the browser.
 */
export async function ensurePdfLibrariesLoaded() {
  if (window.React && window.ReactPDF) {
    return true;
  }

  return new Promise((resolve, reject) => {
    const loadScript = (src) => {
      return new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          res();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = res;
        script.onerror = () => rej(new Error(`Failed to load script ${src}`));
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
      loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
    ])
      .then(() => loadScript('https://unpkg.com/@react-pdf/renderer@3.4.0/dist/react-pdf.browser.min.js'))
      .then(() => resolve(true))
      .catch((err) => {
        console.error('Error loading PDF libraries:', err);
        reject(err);
      });
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

  const { ReactPDF, React } = window;
  const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;
  const e = React.createElement;

  // Define APEX Telemetry PDF Styles (Clean Print Theme with F1 Red accents)
  const styles = StyleSheet.create({
    page: {
      paddingTop: 0,
      paddingBottom: 30,
      paddingHorizontal: 0,
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontSize: 10,
      color: '#1A1A1A'
    },
    // Header Bar
    headerBar: {
      backgroundColor: '#121212',
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderBottomWidth: 3,
      borderBottomColor: '#E10600',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Helvetica-Bold',
      letterSpacing: 1
    },
    headerSubtitle: {
      color: '#E10600',
      fontSize: 11,
      fontFamily: 'Helvetica-Bold'
    },
    headerRightText: {
      color: '#A0A0B0',
      fontSize: 8,
      textAlign: 'right'
    },
    bodyContainer: {
      paddingHorizontal: 30,
      paddingTop: 16
    },
    // Meta Banner
    metaBanner: {
      backgroundColor: '#F4F4F6',
      borderLeftWidth: 3,
      borderLeftColor: '#E10600',
      padding: 10,
      marginBottom: 14,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    metaBlock: {
      flexDirection: 'column'
    },
    metaLabel: {
      fontSize: 7,
      color: '#6C6C7D',
      fontFamily: 'Helvetica-Bold',
      letterSpacing: 0.5,
      marginBottom: 2
    },
    metaValue: {
      fontSize: 11,
      color: '#121212',
      fontFamily: 'Helvetica-Bold'
    },
    // Section Header
    sectionHeader: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: '#121212',
      borderBottomWidth: 1,
      borderBottomColor: '#121212',
      paddingBottom: 3,
      marginTop: 12,
      marginBottom: 8,
      letterSpacing: 0.5
    },
    // Setup Grid
    setupGrid: {
      flexDirection: 'row',
      marginBottom: 10,
      gap: 8
    },
    setupBox: {
      flex: 1,
      backgroundColor: '#FAFAFC',
      borderWidth: 1,
      borderColor: '#E0E0E8',
      padding: 8
    },
    // Telemetry Stat Boxes
    telemetryGrid: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12
    },
    statCard: {
      flex: 1,
      backgroundColor: '#F8F8FA',
      borderWidth: 1,
      borderColor: '#D8D8E0',
      padding: 8,
      alignItems: 'center'
    },
    statValue: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: '#E10600',
      marginTop: 2
    },
    statValueGreen: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: '#00A859',
      marginTop: 2
    },
    // Table
    table: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#E0E0E8',
      marginBottom: 12
    },
    tableHeaderRow: {
      backgroundColor: '#1E1E28',
      flexDirection: 'row',
      paddingVertical: 5,
      paddingHorizontal: 8
    },
    tableHeaderCell: {
      color: '#FFFFFF',
      fontSize: 8,
      fontFamily: 'Helvetica-Bold'
    },
    tableRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#E0E0E8',
      paddingVertical: 5,
      paddingHorizontal: 8,
      alignItems: 'center'
    },
    tableRowAlt: {
      backgroundColor: '#FAFAFC'
    },
    badgePass: {
      backgroundColor: '#E6F9F0',
      color: '#008744',
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 7,
      fontFamily: 'Helvetica-Bold'
    },
    badgeFail: {
      backgroundColor: '#FFEBEB',
      color: '#CC0000',
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 7,
      fontFamily: 'Helvetica-Bold'
    },
    // Reflections & Notes
    noteBox: {
      backgroundColor: '#FAFAFC',
      borderLeftWidth: 2,
      borderLeftColor: '#3A3A45',
      padding: 8,
      marginBottom: 6
    },
    questionText: {
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      color: '#555566',
      marginBottom: 2
    },
    answerText: {
      fontSize: 9,
      color: '#121212',
      fontFamily: 'Courier'
    },
    // Footer
    footer: {
      position: 'absolute',
      bottom: 12,
      left: 30,
      right: 30,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E8',
      paddingTop: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: 7,
      color: '#888899'
    }
  });

  // Calculate metrics
  const dateFormatted = sessionData.completedAt
    ? new Date(sessionData.completedAt).toLocaleString()
    : new Date().toLocaleString();

  const correctCount = sessionData.correctCount !== undefined ? sessionData.correctCount : 0;
  const totalQuestions = sessionData.totalQuestions || (session.assessment ? session.assessment.length : 3);
  const passed = sessionData.assessmentPassed !== undefined ? sessionData.assessmentPassed : correctCount >= 2;

  // Build Document
  const doc = e(
    Document,
    { title: `APEX Telemetry Report - ${session.title}` },
    e(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      e(
        View,
        { style: styles.headerBar },
        e(
          View,
          null,
          e(Text, { style: styles.headerTitle }, 'APEX // SIMRACING COACH'),
          e(Text, { style: styles.headerSubtitle }, 'TELEMETRY SESSION REPORT')
        ),
        e(
          View,
          null,
          e(Text, { style: styles.headerRightText }, 'MOZA R3 DIRECT DRIVE'),
          e(Text, { style: styles.headerRightText }, 'FORZA MOTORSPORT (2023)')
        )
      ),

      // Body Container
      e(
        View,
        { style: styles.bodyContainer },

        // Metadata Banner
        e(
          View,
          { style: styles.metaBanner },
          e(
            View,
            { style: styles.metaBlock },
            e(Text, { style: styles.metaLabel }, 'MODULE'),
            e(Text, { style: styles.metaValue }, `MOD ${module.id}: ${module.title}`)
          ),
          e(
            View,
            { style: styles.metaBlock },
            e(Text, { style: styles.metaLabel }, 'SESSION DRILL'),
            e(Text, { style: styles.metaValue }, session.title)
          ),
          e(
            View,
            { style: styles.metaBlock },
            e(Text, { style: styles.metaLabel }, 'COMPLETED AT'),
            e(Text, { style: styles.metaValue }, dateFormatted)
          )
        ),

        // Section: Hardware & Setup
        e(Text, { style: styles.sectionHeader }, '1. HARDWARE & TRACK SETUP'),
        e(
          View,
          { style: styles.setupGrid },
          e(
            View,
            { style: styles.setupBox },
            e(Text, { style: styles.metaLabel }, 'TARGET CAR'),
            e(Text, { style: { fontSize: 10, fontFamily: 'Helvetica-Bold' } }, session.setup ? session.setup.car : 'N/A')
          ),
          e(
            View,
            { style: styles.setupBox },
            e(Text, { style: styles.metaLabel }, 'TARGET TRACK'),
            e(Text, { style: { fontSize: 10, fontFamily: 'Helvetica-Bold' } }, session.setup ? session.setup.track : 'N/A')
          )
        ),
        session.setup && session.setup.mozaR3Note
          ? e(
              View,
              { style: [styles.noteBox, { borderLeftColor: '#E10600', marginBottom: 10 }] },
              e(Text, { style: styles.questionText }, 'MOZA R3 FFB NOTE:'),
              e(Text, { style: { fontSize: 8.5, color: '#333344' } }, session.setup.mozaR3Note)
            )
          : null,

        // Section: Telemetry & Performance
        e(Text, { style: styles.sectionHeader }, '2. TELEMETRY & PERFORMANCE SUMMARY'),
        e(
          View,
          { style: styles.telemetryGrid },
          e(
            View,
            { style: styles.statCard },
            e(Text, { style: styles.metaLabel }, 'BEST LAP TIME'),
            e(Text, { style: styles.statValue }, sessionData.bestLapTime || 'N/A')
          ),
          e(
            View,
            { style: styles.statCard },
            e(Text, { style: styles.metaLabel }, 'LAPS COMPLETED'),
            e(Text, { style: styles.statValue }, sessionData.lapsCompleted || 'N/A')
          ),
          e(
            View,
            { style: styles.statCard },
            e(Text, { style: styles.metaLabel }, 'QUIZ SCORE'),
            e(
              Text,
              { style: passed ? styles.statValueGreen : styles.statValue },
              `${correctCount}/${totalQuestions} (${passed ? 'PASSED' : 'RETRY'})`
            )
          ),
          e(
            View,
            { style: styles.statCard },
            e(Text, { style: styles.metaLabel }, 'DRIVER FEEDBACK'),
            e(Text, { style: styles.statValue }, `${sessionData.feedbackRating || 5} / 5 Stars`)
          )
        ),

        // Section: Knowledge Assessment Results
        e(Text, { style: styles.sectionHeader }, '3. KNOWLEDGE ASSESSMENT RESULTS'),
        session.assessment && session.assessment.length > 0
          ? e(
              View,
              { style: styles.table },
              e(
                View,
                { style: styles.tableHeaderRow },
                e(Text, { style: [styles.tableHeaderCell, { flex: 3 }] }, 'QUESTION'),
                e(Text, { style: [styles.tableHeaderCell, { flex: 2 }] }, 'SELECTED ANSWER'),
                e(Text, { style: [styles.tableHeaderCell, { flex: 1, textAlign: 'center' }] }, 'RESULT')
              ),
              ...session.assessment.map((q, idx) => {
                const userAnsIdx = sessionData.assessmentScores ? sessionData.assessmentScores[q.id] : undefined;
                const userAnsText = userAnsIdx !== undefined && q.options[userAnsIdx] ? q.options[userAnsIdx] : 'Not Answered';
                const isCorrect = userAnsIdx === q.correctIndex;

                return e(
                  View,
                  { key: q.id || idx, style: [styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : null] },
                  e(Text, { style: { flex: 3, fontSize: 8 } }, `${idx + 1}. ${q.question}`),
                  e(Text, { style: { flex: 2, fontSize: 8, color: '#333344' } }, userAnsText),
                  e(
                    View,
                    { style: { flex: 1, alignItems: 'center' } },
                    e(Text, { style: isCorrect ? styles.badgePass : styles.badgeFail }, isCorrect ? 'PASS' : 'FAIL')
                  )
                );
              })
            )
          : e(Text, { style: { fontSize: 8.5, color: '#6C6C7D' } }, 'No assessment recorded.'),

        // Section: Psychological Check-In Ratings
        e(Text, { style: styles.sectionHeader }, '4. PSYCHOLOGICAL CHECK-IN RATINGS'),
        session.psychCheckin && session.psychCheckin.length > 0
          ? e(
              View,
              { style: styles.telemetryGrid },
              session.psychCheckin.map((p, idx) => {
                const val = sessionData.psychRatings && sessionData.psychRatings[p.id] !== undefined
                  ? sessionData.psychRatings[p.id]
                  : (sessionData.psychRatings ? sessionData.psychRatings[p.prompt] || 'N/A' : 'N/A');
                return e(
                  View,
                  { key: p.id || idx, style: styles.statCard },
                  e(Text, { style: styles.metaLabel }, `CHECK-IN #${idx + 1}`),
                  e(Text, { style: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#121212', marginTop: 2 } }, `${val} / 5`)
                );
              })
            )
          : e(
              View,
              { style: styles.telemetryGrid },
              ['Focus', 'Confidence', 'Energy', 'Stress'].map((label) => {
                const val = sessionData.psychRatings ? sessionData.psychRatings[label.toLowerCase()] || 'N/A' : 'N/A';
                return e(
                  View,
                  { key: label, style: styles.statCard },
                  e(Text, { style: styles.metaLabel }, label.toUpperCase()),
                  e(Text, { style: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#121212', marginTop: 2 } }, `${val} / 5`)
                );
              })
            ),

        // Section: Driver Reflections & Notes
        e(Text, { style: styles.sectionHeader }, '5. DRIVER REFLECTION & NOTES'),
        (() => {
          const reflectionPrompts = session.reflection || session.reflectionPrompts;
          return reflectionPrompts && reflectionPrompts.length > 0
            ? reflectionPrompts.map((prompt, idx) => {
                const ans = sessionData.reflections ? sessionData.reflections[idx] : '';
                return e(
                  View,
                  { key: idx, style: styles.noteBox },
                  e(Text, { style: styles.questionText }, `PROMPT ${idx + 1}: ${prompt}`),
                  e(Text, { style: styles.answerText }, ans || '(No response provided)')
                );
              })
            : null;
        })(),
        sessionData.driverNotes
          ? e(
              View,
              { style: [styles.noteBox, { marginTop: 4 }] },
              e(Text, { style: styles.questionText }, 'ADDITIONAL DRIVER TELEMETRY NOTES:'),
              e(Text, { style: styles.answerText }, sessionData.driverNotes)
            )
          : null
      ),

      // Footer
      e(
        View,
        { style: styles.footer },
        e(Text, null, 'APEX SIMRACING TELEMETRY SYSTEM v1.5 • OFFICIAL SESSION DRILL REPORT'),
        e(Text, null, `Generated: ${new Date().toLocaleDateString()}`)
      )
    )
  );

  // Generate PDF Blob
  const blob = await pdf(doc).toBlob();

  // Trigger Download
  const filename = `APEX_Session_${session.id}_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`;
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
