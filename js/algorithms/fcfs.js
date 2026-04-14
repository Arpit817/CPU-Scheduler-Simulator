/**
 * First Come First Serve (FCFS) Scheduling Algorithm
 * Non-preemptive: processes run to completion in arrival order
 */

function runFCFS(processes) {
  // Deep clone and sort by arrival time
  const procs = processes.map(p => ({ ...p })).sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));

  const gantt = [];
  const result = [];
  let currentTime = 0;

  for (const proc of procs) {
    // If CPU is idle, jump to next arrival
    if (currentTime < proc.arrival) {
      gantt.push({ id: 'IDLE', start: currentTime, end: proc.arrival });
      currentTime = proc.arrival;
    }

    const start = currentTime;
    const end = currentTime + proc.burst;

    gantt.push({ id: proc.id, start, end, color: proc.color });

    result.push({
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
  }

  return { gantt, result };
}
