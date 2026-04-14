/**
 * Chart.js-based visualizations:
 * - Bar chart: Waiting & Turnaround times per process
 * - Comparison radar/bar chart across algorithms
 */

let wtTatChart = null;
let comparisonChart = null;

/**
 * Render bar chart for WT and TAT per process
 */
function renderMetricsChart(results, canvasId = 'metrics-chart') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = results.map(r => r.id);
  const wtData = results.map(r => r.waiting);
  const tatData = results.map(r => r.turnaround);
  const rtData = results.map(r => r.response);

  if (wtTatChart) wtTatChart.destroy();

  wtTatChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Waiting Time',
          data: wtData,
          backgroundColor: 'rgba(0, 200, 83, 0.75)',
          borderColor: '#00c853',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Turnaround Time',
          data: tatData,
          backgroundColor: 'rgba(29, 233, 182, 0.75)',
          borderColor: '#1de9b6',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Response Time',
          data: rtData,
          backgroundColor: 'rgba(118, 255, 3, 0.65)',
          borderColor: '#76ff03',
          borderWidth: 2,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          labels: { color: '#e0e0e0', font: { size: 13, family: 'Inter' } }
        },
        title: {
          display: true,
          text: 'Per-Process Time Metrics',
          color: '#00e676',
          font: { size: 15, weight: 'bold', family: 'Inter' }
        },
        tooltip: {
          backgroundColor: '#1a2a1a',
          titleColor: '#00c853',
          bodyColor: '#ccc',
          borderColor: '#00c853',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { color: '#aaa', font: { family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#aaa', font: { family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.08)' },
          title: { display: true, text: 'Time Units', color: '#aaa' }
        }
      }
    }
  });
}

/**
 * Render algorithm comparison bar chart
 */
function renderComparisonChart(compData, canvasId = 'comparison-chart') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const labels = compData.map(d => d.name);
  const avgWT = compData.map(d => d.metrics?.avgWT ?? 0);
  const avgTAT = compData.map(d => d.metrics?.avgTAT ?? 0);
  const cpuUtil = compData.map(d => d.metrics?.cpuUtilization ?? 0);

  if (comparisonChart) comparisonChart.destroy();

  comparisonChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Avg Waiting Time',
          data: avgWT,
          backgroundColor: 'rgba(0, 200, 83, 0.8)',
          borderColor: '#00c853',
          borderWidth: 2,
          borderRadius: 5,
        },
        {
          label: 'Avg Turnaround Time',
          data: avgTAT,
          backgroundColor: 'rgba(29, 233, 182, 0.8)',
          borderColor: '#1de9b6',
          borderWidth: 2,
          borderRadius: 5,
        },
        {
          label: 'CPU Utilization (%)',
          data: cpuUtil,
          backgroundColor: 'rgba(118, 255, 3, 0.7)',
          borderColor: '#76ff03',
          borderWidth: 2,
          borderRadius: 5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          labels: { color: '#e0e0e0', font: { size: 12, family: 'Inter' } }
        },
        title: {
          display: true,
          text: 'Algorithm Comparison',
          color: '#00e676',
          font: { size: 15, weight: 'bold', family: 'Inter' }
        },
        tooltip: {
          backgroundColor: '#1a2a1a',
          titleColor: '#00c853',
          bodyColor: '#ccc',
          borderColor: '#00c853',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { color: '#aaa', font: { size: 10, family: 'Inter' }, maxRotation: 30 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#aaa', font: { family: 'Inter' } },
          grid: { color: 'rgba(255,255,255,0.08)' }
        }
      }
    }
  });
}
