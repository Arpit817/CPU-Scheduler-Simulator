/**
 * Main Application Controller
 * Handles UI events, simulation flow, rendering results
 */

// ─── State ────────────────────────────────────────────────────────────────────
let processes = [];
let lastResults = null;
let lastGantt = null;
let lastMetrics = null;
let lastAlgoName = '';
let compData = [];
let processCounter = 1;
let stepLog = [];
let showingSteps = false;

// ─── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateAlgoOptions();
  renderProcessTable();
  // Load sample data
  processes = assignColors([
    { id: 'P1', arrival: 0, burst: 6, priority: 2 },
    { id: 'P2', arrival: 2, burst: 4, priority: 1 },
    { id: 'P3', arrival: 4, burst: 2, priority: 3 },
    { id: 'P4', arrival: 6, burst: 8, priority: 2 },
  ]);
  processCounter = 5;
  renderProcessTable();
});

// ─── Event Listeners ─────────────────────────────────────────────────────────
function setupEventListeners() {
  document.getElementById('algo-select').addEventListener('change', updateAlgoOptions);
  document.getElementById('add-process-btn').addEventListener('click', addProcess);
  document.getElementById('random-btn').addEventListener('click', loadRandomProcesses);
  document.getElementById('simulate-btn').addEventListener('click', runSimulation);
  document.getElementById('reset-btn').addEventListener('click', resetAll);
  document.getElementById('compare-btn').addEventListener('click', runComparison);
  document.getElementById('export-csv-btn').addEventListener('click', handleExportCSV);
  document.getElementById('export-pdf-btn').addEventListener('click', handleExportPDF);
  document.getElementById('toggle-steps-btn').addEventListener('click', toggleStepLog);
  document.getElementById('dark-toggle').addEventListener('click', toggleDarkMode);

  // Process form enter key
  document.getElementById('process-form').addEventListener('keydown', e => {
    if (e.key === 'Enter') addProcess();
  });
}

// ─── Algorithm Selection ──────────────────────────────────────────────────────
function updateAlgoOptions() {
  const algo = document.getElementById('algo-select').value;
  const rrSection = document.getElementById('quantum-section');
  rrSection.style.display = algo === 'rr' ? 'flex' : 'none';
}

// ─── Process Management ───────────────────────────────────────────────────────
function addProcess() {
  const id = document.getElementById('proc-id').value.trim() || `P${processCounter}`;
  const arrival = parseInt(document.getElementById('proc-arrival').value) || 0;
  const burst = parseInt(document.getElementById('proc-burst').value);
  const priority = parseInt(document.getElementById('proc-priority').value) || 1;

  if (!burst || burst <= 0) {
    showToast('Burst time must be > 0', 'error');
    return;
  }
  if (processes.find(p => p.id === id)) {
    showToast(`Process ID "${id}" already exists`, 'error');
    return;
  }

  processes.push({ id, arrival, burst, priority });
  processes = assignColors(processes);
  processCounter++;

  // Reset form
  document.getElementById('proc-id').value = '';
  document.getElementById('proc-arrival').value = '';
  document.getElementById('proc-burst').value = '';
  document.getElementById('proc-priority').value = '1';
  document.getElementById('proc-id').focus();

  renderProcessTable();
  showToast(`Process ${id} added`, 'success');
}

function deleteProcess(id) {
  processes = assignColors(processes.filter(p => p.id !== id));
  renderProcessTable();
}

function loadRandomProcesses() {
  const count = 4 + Math.floor(Math.random() * 3);
  processes = assignColors(generateRandomProcesses(count));
  processCounter = count + 1;
  renderProcessTable();
  showToast(`Generated ${count} random processes`, 'success');
}

function renderProcessTable() {
  const tbody = document.getElementById('process-tbody');
  const empty = document.getElementById('process-empty');

  if (processes.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = processes.map((p, i) => `
    <tr class="process-row" style="animation-delay:${i * 0.05}s">
      <td>
        <span class="pid-badge" style="background:${p.color.bg};color:${p.color.text}">${p.id}</span>
      </td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${p.priority}</td>
      <td>
        <button class="btn-icon delete-btn" onclick="deleteProcess('${p.id}')" title="Remove process">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14H6L5 6"></path>
            <path d="M10 11v6M14 11v6"></path>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

// ─── Simulation ───────────────────────────────────────────────────────────────
function runSimulation() {
  try {
    validateProcesses(processes);
  } catch (e) {
    showToast(e.message, 'error');
    return;
  }

  const algo = document.getElementById('algo-select').value;
  const quantum = parseInt(document.getElementById('quantum-input').value) || 2;
  const colored = assignColors(processes);

  let gantt, result;
  try {
    switch (algo) {
      case 'fcfs':      ({ gantt, result } = runFCFS(colored)); break;
      case 'sjf':       ({ gantt, result } = runSJF(colored, false)); break;
      case 'srtf':      ({ gantt, result } = runSJF(colored, true)); break;
      case 'priorityNP':({ gantt, result } = runPriority(colored, false)); break;
      case 'priorityP': ({ gantt, result } = runPriority(colored, true)); break;
      case 'rr':        ({ gantt, result } = runRoundRobin(colored, quantum)); break;
      default: throw new Error('Unknown algorithm');
    }
  } catch (e) {
    showToast('Simulation error: ' + e.message, 'error');
    return;
  }

  const algoName = getAlgorithmName(algo) + (algo === 'rr' ? ` (q=${quantum})` : '');
  const metrics = calculateOverallMetrics(result, gantt);

  lastResults = result;
  lastGantt = gantt;
  lastMetrics = metrics;
  lastAlgoName = algoName;

  // Update UI
  document.getElementById('results-section').style.display = 'block';
  document.getElementById('current-algo-name').textContent = algoName;

  renderGanttChart(gantt, 'gantt-chart');
  renderResultsTable(result);
  renderMetricsChart(result, 'metrics-chart');
  renderOverallMetrics(metrics);
  buildStepLog(gantt, result);

  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
  showToast('Simulation complete!', 'success');
}

// ─── Results Table ────────────────────────────────────────────────────────────
function renderResultsTable(results) {
  const tbody = document.getElementById('results-tbody');
  tbody.innerHTML = results
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(r => `
      <tr>
        <td><span class="pid-badge" style="background:${r.color.bg};color:${r.color.text}">${r.id}</span></td>
        <td>${r.arrival}</td>
        <td>${r.burst}</td>
        <td>${r.priority}</td>
        <td>${r.completion}</td>
        <td class="metric-highlight">${r.turnaround}</td>
        <td class="metric-highlight">${r.waiting}</td>
        <td>${r.response}</td>
      </tr>
    `).join('');
}

// ─── Overall Metrics Cards ────────────────────────────────────────────────────
function renderOverallMetrics(metrics) {
  document.getElementById('stat-awt').textContent = fmt(metrics.avgWT);
  document.getElementById('stat-atat').textContent = fmt(metrics.avgTAT);
  document.getElementById('stat-art').textContent = fmt(metrics.avgRT);
  document.getElementById('stat-cpu').textContent = fmt(metrics.cpuUtilization) + '%';
  document.getElementById('stat-tp').textContent = metrics.throughput;
  document.getElementById('stat-ms').textContent = metrics.makespan;
}

// ─── Step Log ─────────────────────────────────────────────────────────────────
function buildStepLog(gantt, results) {
  stepLog = gantt.map((g, i) => {
    const proc = results.find(r => r.id === g.id);
    return {
      step: i + 1,
      id: g.id,
      start: g.start,
      end: g.end,
      duration: g.end - g.start,
      isIdle: g.id === 'IDLE',
      remaining: proc ? proc.burst - (g.end - (proc.start || g.start)) : null
    };
  });
}

function toggleStepLog() {
  const panel = document.getElementById('step-log-panel');
  showingSteps = !showingSteps;

  if (showingSteps) {
    const html = stepLog.map(s => `
      <div class="step-item ${s.isIdle ? 'step-idle' : ''}">
        <span class="step-num">Step ${s.step}</span>
        <span class="step-proc">${s.id}</span>
        <span class="step-time">t=${s.start} → t=${s.end}</span>
        <span class="step-dur">${s.duration} unit${s.duration !== 1 ? 's' : ''}</span>
      </div>
    `).join('');
    panel.innerHTML = html || '<p class="empty-msg">No steps.</p>';
    panel.style.display = 'block';
    document.getElementById('toggle-steps-btn').textContent = '🔼 Hide Steps';
  } else {
    panel.style.display = 'none';
    document.getElementById('toggle-steps-btn').textContent = '🔽 Show Steps';
  }
}

// ─── Algorithm Comparison ─────────────────────────────────────────────────────
function runComparison() {
  try {
    validateProcesses(processes);
  } catch (e) {
    showToast(e.message, 'error');
    return;
  }

  const quantum = parseInt(document.getElementById('quantum-input').value) || 2;
  compData = compareAllAlgorithms(processes, quantum);
  const suggestion = suggestBestAlgorithm(processes, compData);

  document.getElementById('comparison-section').style.display = 'block';
  renderComparisonTable(compData, suggestion);
  renderComparisonChart(compData, 'comparison-chart');
  renderSuggestion(suggestion);
  document.getElementById('comparison-section').scrollIntoView({ behavior: 'smooth' });
  showToast('Comparison complete!', 'success');
}

function renderComparisonTable(data, suggestion) {
  const tbody = document.getElementById('comparison-tbody');
  tbody.innerHTML = data.map(d => {
    const isBest = d.key === suggestion.best?.key;
    return `
      <tr class="${isBest ? 'best-algo-row' : ''}">
        <td>
          ${isBest ? '<span class="best-badge">🏆 Best</span> ' : ''}
          ${d.name}
        </td>
        <td>${d.metrics ? fmt(d.metrics.avgWT) : 'N/A'}</td>
        <td>${d.metrics ? fmt(d.metrics.avgTAT) : 'N/A'}</td>
        <td>${d.metrics ? fmt(d.metrics.avgRT) : 'N/A'}</td>
        <td>${d.metrics ? d.metrics.cpuUtilization + '%' : 'N/A'}</td>
        <td>${d.metrics ? d.metrics.throughput : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

function renderSuggestion(suggestion) {
  const box = document.getElementById('suggestion-box');
  const reasonsList = suggestion.reasons.map(r => `<li>${r}</li>`).join('');
  box.innerHTML = `
    <div class="suggestion-header">
      <span class="suggestion-icon">🧠</span>
      <h3>Intelligent Recommendation</h3>
    </div>
    <p class="suggestion-summary">${suggestion.summary}</p>
    ${suggestion.reasons.length > 0 ? `
      <ul class="suggestion-reasons">
        ${reasonsList}
      </ul>
    ` : ''}
    <div class="suggestion-rank">
      <strong>Ranking by efficiency:</strong>
      ${suggestion.scored.map((s, i) => `
        <span class="rank-item rank-${i + 1}">${i + 1}. ${s.name}</span>
      `).join(' › ')}
    </div>
  `;
}

// ─── Export ───────────────────────────────────────────────────────────────────
function handleExportCSV() {
  if (!lastResults || !lastMetrics) { showToast('Run a simulation first', 'error'); return; }
  exportCSV(lastResults, lastMetrics, lastAlgoName);
  showToast('CSV exported!', 'success');
}

function handleExportPDF() {
  if (!lastResults || !lastMetrics) { showToast('Run a simulation first', 'error'); return; }
  exportPDF(lastResults, lastMetrics, lastAlgoName, lastGantt);
  showToast('PDF exported!', 'success');
}

// ─── Reset ────────────────────────────────────────────────────────────────────
function resetAll() {
  processes = [];
  processCounter = 1;
  lastResults = null;
  lastGantt = null;
  lastMetrics = null;
  compData = [];
  stepLog = [];
  showingSteps = false;

  renderProcessTable();
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('comparison-section').style.display = 'none';
  document.getElementById('step-log-panel').style.display = 'none';
  document.getElementById('toggle-steps-btn').textContent = '🔽 Show Steps';

  if (wtTatChart) { wtTatChart.destroy(); wtTatChart = null; }
  if (comparisonChart) { comparisonChart.destroy(); comparisonChart = null; }

  showToast('Reset complete', 'success');
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('dark-toggle');
  btn.textContent = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
