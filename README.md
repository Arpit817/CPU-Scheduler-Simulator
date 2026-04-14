# 🧠 Intelligent CPU Scheduler Simulator

A modern, feature-rich CPU Scheduling Algorithm Simulator with animated Gantt charts, real-time metrics, intelligent algorithm recommendations, and export functionality.

![CPU Scheduler](https://img.shields.io/badge/OS%20Project-CPU%20Scheduler-00c853?style=for-the-badge&logo=cpu&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🚀 Quick Start

```bash
# No installation needed! Just open:
index.html
```

Or serve with a local server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## ✨ Features

### Scheduling Algorithms
| Algorithm | Type | Description |
|-----------|------|-------------|
| **FCFS** | Non-Preemptive | First Come First Serve — simple queue |
| **SJF** | Non-Preemptive | Shortest Job First — pick shortest burst |
| **SRTF** | Preemptive | Shortest Remaining Time First |
| **Priority (NP)** | Non-Preemptive | Higher priority runs first |
| **Priority (P)** | Preemptive | Preempt if higher priority arrives |
| **Round Robin** | Preemptive | Fair time-sharing with configurable quantum |

### Metrics Calculated
- ✅ **Completion Time** — When a process finishes
- ✅ **Turnaround Time** = Completion − Arrival
- ✅ **Waiting Time** = Turnaround − Burst
- ✅ **Response Time** = First CPU − Arrival
- ✅ **CPU Utilization** = (Busy time / Total time) × 100%
- ✅ **Throughput** = Processes / Makespan

### Visualizations
- 🎨 Animated **Gantt Chart** with hover tooltips
- 📊 **Bar Chart** (Chart.js) — WT, TAT, RT per process
- ⚖️ **Comparison Chart** — all 6 algorithms side-by-side
- 📋 **Detailed metrics table** per process

### Intelligent Features
- 🧠 **Smart Algorithm Suggestion** — analyzes burst variance, priorities, process count
- 🏆 **Auto-highlights best algorithm** with ranking
- 📝 **Step-by-step execution log** (toggle on/off)

### Extra Features
- 🎲 **Random process generator**
- 🌙 **Dark/Light mode toggle**
- 📋 **Export to CSV**
- 📄 **Export to PDF** (via jsPDF)
- 🔄 **Reset simulation**

---

## 📁 Project Structure

```
OS_Project/
├── index.html                    # Main application
├── css/
│   └── style.css                 # Complete green-theme stylesheet
├── js/
│   ├── algorithms/
│   │   ├── fcfs.js               # FCFS algorithm
│   │   ├── sjf.js                # SJF + SRTF algorithms
│   │   ├── priority.js           # Priority (P + NP) algorithms
│   │   └── roundRobin.js         # Round Robin algorithm
│   ├── utils.js                  # Shared utilities, metrics calculator
│   ├── gantt.js                  # Animated Gantt chart renderer
│   ├── charts.js                 # Chart.js visualizations
│   ├── comparator.js             # All-algorithm comparison + AI suggestion
│   ├── export.js                 # CSV + PDF export
│   └── main.js                   # App controller & event handling
└── README.md
```

---

## 🧪 Sample Test Cases

### Test 1 — Basic FCFS
| PID | Arrival | Burst | Priority |
|-----|---------|-------|----------|
| P1  | 0       | 5     | 1        |
| P2  | 1       | 3     | 2        |
| P3  | 2       | 8     | 1        |

Expected (FCFS): P1→P2→P3 | WT: 0, 4, 6 | TAT: 5, 7, 14

### Test 2 — Round Robin (q=2)
| PID | Arrival | Burst |
|-----|---------|-------|
| P1  | 0       | 5     |
| P2  | 0       | 4     |
| P3  | 0       | 3     |

### Test 3 — Priority Preemptive
| PID | Arrival | Burst | Priority |
|-----|---------|-------|----------|
| P1  | 0       | 6     | 2        |
| P2  | 2       | 4     | 1        |
| P3  | 4       | 2     | 3        |

Expected: P1 runs 0-2, P2 preempts 2-6, P1 resumes 6-10, P3 runs 10-12

---

## 🎨 UI Design

- **Color Theme**: Deep green dark mode (`#0a0f0a` background, `#00c853` accent)
- **Typography**: Inter + JetBrains Mono
- **Animations**: Gantt bar slide-in, metric card pop, row fade-in
- **Layout**: Responsive 2-column grid, collapses to single column on mobile

---

## 🔬 Algorithm Details

### Priority Note
> Lower priority number = **Higher priority** (e.g., P=1 runs before P=2).
> This matches standard OS conventions.

### SRTF vs SJF
> SRTF continuously re-evaluates at each new arrival. SJF only picks at dispatch time.

### Round Robin Fairness
> Processes are queued in arrival order. After each quantum, newly arrived processes join before the preempted one.

---

## 📦 Dependencies (CDN — no install needed)

| Library | Version | Purpose |
|---------|---------|---------|
| [Chart.js](https://www.chartjs.org/) | 4.4.0 | Bar charts |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | PDF export |

---

## 👨‍💻 Author

CPU Scheduler Simulator  
Built with pure HTML, CSS, and JavaScript. No frameworks, no build tools. Just open and run!
