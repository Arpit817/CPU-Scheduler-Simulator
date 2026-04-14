/**
 * Round Robin Scheduling Algorithm
 * Each process gets a fixed time quantum; preemptive by nature.
 */

function runRoundRobin(processes, quantum = 2) {
  const procs = processes.map(p => ({
    ...p,
    remaining: p.burst,
    firstRun: null,
    completed: false
  })).sort((a, b) => a.arrival - b.arrival);

  const gantt = [];
  const result = [];
  const queue = [];
  const inQueue = new Set();
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;
  let idx = 0; // index into sorted procs for new arrivals

  // Enqueue processes that arrive at time 0
  while (idx < n && procs[idx].arrival <= currentTime) {
    queue.push(procs[idx]);
    inQueue.add(procs[idx].id);
    idx++;
  }

  while (completed < n) {
    if (queue.length === 0) {
      // CPU idle - jump to next arrival
      const nextArrival = procs[idx].arrival;
      gantt.push({ id: 'IDLE', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      while (idx < n && procs[idx].arrival <= currentTime) {
        queue.push(procs[idx]);
        inQueue.add(procs[idx].id);
        idx++;
      }
      continue;
    }

    const proc = queue.shift();
    inQueue.delete(proc.id);

    if (proc.firstRun === null) proc.firstRun = currentTime;

    const runTime = Math.min(quantum, proc.remaining);
    const start = currentTime;
    const end = currentTime + runTime;

    // Merge consecutive gantt blocks for same process
    if (gantt.length > 0 && gantt[gantt.length - 1].id === proc.id) {
      gantt[gantt.length - 1].end = end;
    } else {
      gantt.push({ id: proc.id, start, end, color: proc.color });
    }

    proc.remaining -= runTime;
    currentTime = end;

    // Enqueue newly arrived processes
    while (idx < n && procs[idx].arrival <= currentTime) {
      queue.push(procs[idx]);
      inQueue.add(procs[idx].id);
      idx++;
    }

    if (proc.remaining <= 0) {
      proc.completed = true;
      result.push({
        id: proc.id,
        arrival: proc.arrival,
        burst: proc.burst,
        priority: proc.priority,
        start: proc.firstRun,
        completion: currentTime,
        turnaround: currentTime - proc.arrival,
        waiting: currentTime - proc.arrival - proc.burst,
        response: proc.firstRun - proc.arrival,
        color: proc.color
      });
      completed++;
    } else {
      // Re-enqueue at the back
      queue.push(proc);
      inQueue.add(proc.id);
    }
  }

  return { gantt, result };
}
