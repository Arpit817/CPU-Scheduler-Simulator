/**
 * Algorithm Comparator & Intelligent Suggestion Engine
 * Runs all 6 scheduling variants and recommends the best one
 */

/**
 * Run all algorithms on the same process set and collect metrics
 */
function compareAllAlgorithms(processes, quantum = 2) {
  const colored = assignColors(processes);

  const algorithms = [
    { key: 'fcfs',       name: 'FCFS',                    fn: () => runFCFS(colored) },
    { key: 'sjf',        name: 'SJF (Non-Preemptive)',    fn: () => runSJF(colored, false) },
    { key: 'srtf',       name: 'SRTF (Preemptive SJF)',   fn: () => runSJF(colored, true) },
    { key: 'priorityNP', name: 'Priority (Non-Preemp.)',  fn: () => runPriority(colored, false) },
    { key: 'priorityP',  name: 'Priority (Preemptive)',   fn: () => runPriority(colored, true) },
    { key: 'rr',         name: `Round Robin (q=${quantum})`, fn: () => runRoundRobin(colored, quantum) },
  ];

  const results = algorithms.map(algo => {
    try {
      const { gantt, result } = algo.fn();
      const metrics = calculateOverallMetrics(result, gantt);
      return { key: algo.key, name: algo.name, metrics, gantt, result };
    } catch (e) {
      return { key: algo.key, name: algo.name, metrics: null, error: e.message };
    }
  });

  return results;
}

/**
 * Suggest best algorithm based on process characteristics
 */
function suggestBestAlgorithm(processes, compResults) {
  const n = processes.length;
  const bursts = processes.map(p => p.burst);
  const arrivals = processes.map(p => p.arrival);
  const priorities = processes.map(p => p.priority);

  const allSameArrival = new Set(arrivals).size === 1;
  const burstVariance = variance(bursts);
  const priorityVariance = variance(priorities);
  const allSamePriority = priorityVariance < 0.5;
  const highBurstVariance = burstVariance > 4;

  // Score each algorithm: lower avgWT = better
  const scored = compResults
    .filter(r => r.metrics)
    .map(r => ({ ...r, score: r.metrics.avgWT * 0.5 + r.metrics.avgTAT * 0.3 + (100 - r.metrics.cpuUtilization) * 0.2 }))
    .sort((a, b) => a.score - b.score);

  let reasons = [];
  let suggestions = [];

  // Rule-based insights
  if (allSameArrival && n <= 6) {
    suggestions.push('fcfs');
    reasons.push('All processes arrive at the same time — FCFS is simple and fair.');
  }
  if (highBurstVariance) {
    suggestions.push('srtf');
    reasons.push('High burst time variance — SRTF minimizes average waiting time.');
  }
  if (!allSamePriority) {
    suggestions.push('priorityP');
    reasons.push('Processes have different priorities — Priority Scheduling respects urgency.');
  }
  if (n > 5) {
    suggestions.push('rr');
    reasons.push('Many processes — Round Robin ensures fairness and prevents starvation.');
  }
  if (highBurstVariance && !suggestions.includes('sjf')) {
    suggestions.push('sjf');
    reasons.push('Varied burst times — SJF minimizes average waiting time when non-preemptive is preferred.');
  }

  const best = scored[0];
  const worst = scored[scored.length - 1];

  return {
    best,
    worst,
    scored,
    reasons,
    summary: `Based on your ${n} processes, <strong>${best?.name}</strong> gives the best performance with avg wait time of <strong>${best?.metrics?.avgWT}</strong> units.`
  };
}

function variance(arr) {
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  return arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
}
