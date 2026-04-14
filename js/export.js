/**
 * Export functionality: CSV and PDF (via jsPDF)
 */

/**
 * Export results to CSV
 */
function exportCSV(results, metrics, algoName) {
  const headers = ['Process ID', 'Arrival', 'Burst', 'Priority', 'Completion', 'Turnaround', 'Waiting', 'Response'];
  const rows = results.map(r => [r.id, r.arrival, r.burst, r.priority, r.completion, r.turnaround, r.waiting, r.response]);

  const csvContent = [
    `CPU Scheduler Simulator - ${algoName}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
    '',
    'Summary Metrics',
    `Avg Waiting Time,${metrics.avgWT}`,
    `Avg Turnaround Time,${metrics.avgTAT}`,
    `Avg Response Time,${metrics.avgRT}`,
    `CPU Utilization,${metrics.cpuUtilization}%`,
    `Throughput,${metrics.throughput} proc/unit`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scheduler_${algoName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export results to PDF using jsPDF
 */
function exportPDF(results, metrics, algoName, gantt) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(0, 100, 30);
  doc.rect(0, 0, 297, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Intelligent CPU Scheduler Simulator', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Algorithm: ${algoName}   |   Generated: ${new Date().toLocaleString()}`, 14, 20);

  // Summary metrics box
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(230, 255, 240);
  doc.rect(14, 26, 269, 28, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Metrics', 16, 33);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const col = 50;
  doc.text(`Avg Waiting Time: ${metrics.avgWT}`, 16, 40);
  doc.text(`Avg Turnaround Time: ${metrics.avgTAT}`, 16 + col, 40);
  doc.text(`Avg Response Time: ${metrics.avgRT}`, 16 + col * 2, 40);
  doc.text(`CPU Utilization: ${metrics.cpuUtilization}%`, 16, 48);
  doc.text(`Throughput: ${metrics.throughput} proc/unit`, 16 + col, 48);
  doc.text(`Makespan: ${metrics.makespan} units`, 16 + col * 2, 48);

  // Process table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Process Details', 14, 62);

  const headers = ['ID', 'Arrival', 'Burst', 'Priority', 'Completion', 'Turnaround', 'Waiting', 'Response'];
  const colWidths = [20, 22, 22, 22, 28, 28, 22, 24];
  let x = 14, y = 67;

  // Table header
  doc.setFillColor(0, 150, 50);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  headers.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], 8, 'F');
    doc.text(h, x + 2, y + 5.5);
    x += colWidths[i];
  });

  // Table rows
  results.forEach((r, ri) => {
    y += 8;
    x = 14;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(ri % 2 === 0 ? 245 : 255, ri % 2 === 0 ? 255 : 255, ri % 2 === 0 ? 245 : 255);
    const rowData = [r.id, r.arrival, r.burst, r.priority, r.completion, r.turnaround, r.waiting, r.response];
    rowData.forEach((val, i) => {
      doc.rect(x, y, colWidths[i], 7, 'F');
      doc.text(String(val), x + 2, y + 5);
      x += colWidths[i];
    });
  });

  // Gantt text representation
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Gantt Chart (Text)', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const ganttText = gantt.map(g => `[${g.id}: ${g.start}-${g.end}]`).join('  →  ');
  const lines = doc.splitTextToSize(ganttText, 269);
  doc.text(lines, 14, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Intelligent CPU Scheduler Simulator | OS Project', 14, 200);

  doc.save(`scheduler_${algoName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
