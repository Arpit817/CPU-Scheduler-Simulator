/**
 * Priority Scheduling Algorithm
 * Supports both Non-Preemptive and Preemptive modes
 * Lower priority number = Higher priority (e.g., priority 1 runs before priority 2)
 */

function runPriority(processes, preemptive = false) {
  if (preemptive) return runPriorityPreemptive(processes);
  return runPriorityNonPreemptive(processes);
}

/**
 * Priority Non-Preemptive: Among available processes, pick highest priority.
 * Once selected, runs to completion.
 */
function runPriorityNonPreemptive(processes) {
  const procs = processes.map(p => ({ ...p }));
  const gantt = [];
  const result = new Map();
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    const available = procs.filter(p => p.arrival <= currentTime && !result.has(p.id));

    if (available.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !result.has(p.id)).map(p => p.arrival));
      gantt.push({ id: 'IDLE', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Sort by priority (lower number = higher priority), tie-break by arrival
    available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
    const proc = available[0];

    const start = currentTime;
    const end = currentTime + proc.burst;

    gantt.push({ id: proc.id, start, end, color: proc.color });

    result.set(proc.id, {
      id: proc.id,
      arrival: proc.arrival,
      burst: proc.burst,
      priority: proc.priority,
      start,
      completion: end,
      turnaround: end - proc.arrival,
      waiting: end - proc.arrival - proc.burst,
      response: start - proc.arrival,
      color: proc.color
    });

    currentTime = end;
    completed++;
  }

  return { gantt, result: [...result.values()] };
}

/**
 * Priority Preemptive: At every time unit, if a higher priority process arrives, preempt.
 */
function runPriorityPreemptive(processes) {
  const procs = processes.map(p => ({
    ...p,
    remaining: p.burst,
    firstRun: null,
    completed: false
  }));
  const gantt = [];
  const result = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    const available = procs.filter(p => p.arrival <= currentTime && !p.completed);

    if (available.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !p.completed).map(p => p.arrival));
      gantt.push({ id: 'IDLE', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Pick highest priority (lowest number), tie-break by arrival
    available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
    const proc = available[0];

    if (proc.firstRun === null) proc.firstRun = currentTime;

    // Find next event that could cause preemption
    const nextArrivals = procs
      .filter(p => p.arrival > currentTime && !p.completed && p.priority < proc.priority)
      .map(p => p.arrival);

    let runUntil;
    if (nextArrivals.length > 0) {
      runUntil = Math.min(Math.min(...nextArrivals), currentTime + proc.remaining);
    } else {
      runUntil = currentTime + proc.remaining;
    }

    const runTime = runUntil - currentTime;

    // Merge consecutive gantt blocks for same process
    if (gantt.length > 0 && gantt[gantt.length - 1].id === proc.id) {
      gantt[gantt.length - 1].end = runUntil;
    } else {
      gantt.push({ id: proc.id, start: currentTime, end: runUntil, color: proc.color });
    }

    proc.remaining -= runTime;
    currentTime = runUntil;

    if (proc.remaining <= 0) {
      proc.completed = true;
      const end = currentTime;
      result.push({
        id: proc.id,
        arrival: proc.arrival,
        burst: proc.burst,
        priority: proc.priority,
        start: proc.firstRun,
        completion: end,
        turnaround: end - proc.arrival,
        waiting: end - proc.arrival - proc.burst,
        response: proc.firstRun - proc.arrival,
        color: proc.color
      });
      completed++;
    }
  }

  return { gantt, result };
}
