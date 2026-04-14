/**
 * Gantt Chart Renderer
 * Creates animated, color-coded timeline blocks
 */

function renderGanttChart(gantt, containerId = 'gantt-chart') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (gantt.length === 0) {
    container.innerHTML = '<p class="empty-msg">No data to display.</p>';
    return;
  }

  const totalTime = gantt[gantt.length - 1].end;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'gantt-wrapper';

  // Timeline bar
  const bar = document.createElement('div');
  bar.className = 'gantt-bar';

  gantt.forEach((block, index) => {
    const width = ((block.end - block.start) / totalTime) * 100;
    const isIdle = block.id === 'IDLE';

    const blockEl = document.createElement('div');
    blockEl.className = `gantt-block ${isIdle ? 'gantt-idle' : 'gantt-process'}`;
    blockEl.style.width = `${width}%`;
    blockEl.style.animationDelay = `${index * 0.05}s`;

    if (!isIdle && block.color) {
      blockEl.style.background = `linear-gradient(135deg, ${block.color.bg}dd, ${block.color.bg})`;
      blockEl.style.color = block.color.text;
    }

    blockEl.innerHTML = `
      <span class="gantt-label">${block.id}</span>
      <div class="gantt-tooltip">
        <strong>${block.id}</strong><br>
        Start: ${block.start}<br>
        End: ${block.end}<br>
        Duration: ${block.end - block.start}
      </div>
    `;

    bar.appendChild(blockEl);
  });

  // Time labels
  const timeLabels = document.createElement('div');
  timeLabels.className = 'gantt-time-labels';

  // Collect unique time points
  const timePoints = new Set();
  gantt.forEach(b => { timePoints.add(b.start); timePoints.add(b.end); });
  const sortedTimes = [...timePoints].sort((a, b) => a - b);

  sortedTimes.forEach(t => {
    const label = document.createElement('span');
    label.className = 'gantt-time-marker';
    label.style.left = `${(t / totalTime) * 100}%`;
    label.textContent = t;
    timeLabels.appendChild(label);
  });

  wrapper.appendChild(bar);
  wrapper.appendChild(timeLabels);
  container.appendChild(wrapper);
}
