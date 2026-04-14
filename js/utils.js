/**
 * Utility functions: metrics calculator, process color palette, helpers
 */

// Color palette for processes (green-accent themed)
const PROCESS_COLORS = [
  { bg: '#00c853', text: '#fff' },
  { bg: '#1de9b6', text: '#000' },
  { bg: '#76ff03', text: '#000' },
  { bg: '#64dd17', text: '#fff' },
  { bg: '#00e676', text: '#000' },
  { bg: '#69f0ae', text: '#000' },
  { bg: '#b9f6ca', text: '#000' },
  { bg: '#039be5', text: '#fff' },
  { bg: '#7c4dff', text: '#fff' },
  { bg: '#ff6d00', text: '#fff' },
];

/**
 * Assign colors to processes
 */
function assignColors(processes) {
  return processes.map((p, i) => ({
    ...p,
    color: PROCESS_COLORS[i % PROCESS_COLORS.length]
  }));
}

/**
 * Calculate overall metrics from per-process results
 */
function calculateOverallMetrics(results, gantt) {
  const n = results.length;
  if (n === 0) return null;

  const totalBurst = results.reduce((s, r) => s + r.burst, 0);
  const makespan = Math.max(...results.map(r => r.completion));
  const startTime = Math.min(...results.map(r => r.arrival));

  // CPU busy time = total time minus idle time
  const idleTime = gantt
    .filter(g => g.id === 'IDLE')
    .reduce((s, g) => s + (g.end - g.start), 0);
  const totalTime = makespan - (gantt[0]?.start ?? 0);
  const cpuBusyTime = totalTime - idleTime;

  const avgWT = results.reduce((s, r) => s + r.waiting, 0) / n;
  const avgTAT = results.reduce((s, r) => s + r.turnaround, 0) / n;
  const avgRT = results.reduce((s, r) => s + r.response, 0) / n;
  const cpuUtilization = totalTime > 0 ? (cpuBusyTime / totalTime) * 100 : 0;
  const throughput = makespan > 0 ? n / makespan : 0;

  return {
    avgWT: +avgWT.toFixed(2),
    avgTAT: +avgTAT.toFixed(2),
    avgRT: +avgRT.toFixed(2),
    cpuUtilization: +cpuUtilization.toFixed(2),
    throughput: +throughput.toFixed(4),
    makespan
  };
}

/**
 * Validate process inputs
 */
function validateProcesses(processes) {
  if (processes.length === 0) throw new Error('Add at least one process.');
  for (const p of processes) {
    if (p.burst <= 0) throw new Error(`Process ${p.id}: Burst time must be > 0.`);
    if (p.arrival < 0) throw new Error(`Process ${p.id}: Arrival time must be >= 0.`);
    if (p.priority < 1) throw new Error(`Process ${p.id}: Priority must be >= 1.`);
  }
  const ids = processes.map(p => p.id);
  if (new Set(ids).size !== ids.length) throw new Error('Process IDs must be unique.');
}

/**
 * Generate random processes for demo
 */
function generateRandomProcesses(count = 5) {
  const procs = [];
  for (let i = 1; i <= count; i++) {
    procs.push({
      id: `P${i}`,
      arrival: Math.floor(Math.random() * 8),
      burst: Math.floor(Math.random() * 10) + 1,
      priority: Math.floor(Math.random() * 5) + 1
    });
  }
  return procs;
}

/**
 * Format a number to 2 decimal places string
 */
function fmt(n) {
  return Number(n).toFixed(2);
}

/**
 * Get algorithm display name
 */
function getAlgorithmName(algo) {
  const names = {
    fcfs: 'FCFS',
    sjf: 'SJF (Non-Preemptive)',
    srtf: 'SRTF (Preemptive SJF)',
    priorityNP: 'Priority (Non-Preemptive)',
    priorityP: 'Priority (Preemptive)',
    rr: 'Round Robin'
  };
  return names[algo] || algo;
}
