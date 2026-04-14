/**
 * Shortest Job First (SJF) Scheduling Algorithm
 * Supports both Non-Preemptive and Preemptive (SRTF) modes
 */

function runSJF(processes, preemptive = false) {
  if (preemptive) return runSRTF(processes);
  return runSJFNonPreemptive(processes);
}

/**
 * SJF Non-Preemptive: Once a process starts, it runs to completion.
 * Among available processes, pick the one with shortest burst.
 */
function runSJFNonPreemptive(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burst }));
  const gantt = [];
  const result = new Map();
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    // Get all arrived and not-yet completed processes
    const available = procs.filter(p => p.arrival <= currentTime && !result.has(p.id));

    if (available.length === 0) {
      // CPU idle
      const nextArrival = Math.min(...procs.filter(p => !result.has(p.id)).map(p => p.arrival));
      gantt.push({ id: 'IDLE', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Sort by burst time, then by arrival for tie-breaking
    available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
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
 * SRTF (Shortest Remaining Time First) - Preemptive SJF
 * At each time unit, switch to the process with shortest remaining burst.
 */
function runSRTF(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burst, firstRun: null, completed: false }));
  const gantt = [];
  const result = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    // Available processes
    const available = procs.filter(p => p.arrival <= currentTime && !p.completed);

    if (available.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !p.completed).map(p => p.arrival));
      gantt.push({ id: 'IDLE', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Pick shortest remaining time, tie-break by arrival
    available.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival);
    const proc = available[0];

    if (proc.firstRun === null) proc.firstRun = currentTime;

    // Determine how long this process runs before preemption
    // Check when the next process arrives that might preempt it
    const nextEvent = procs
      .filter(p => p.arrival > currentTime && !p.completed)
      .map(p => p.arrival)
      .filter(t => t <= currentTime + proc.remaining);

    let runUntil;
    if (nextEvent.length > 0) {
      runUntil = Math.min(...nextEvent);
    } else {
      runUntil = currentTime + proc.remaining;
    }

    const runTime = runUntil - currentTime;

    // Merge with previous gantt if same process
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
