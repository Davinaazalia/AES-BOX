class SBoxAnalyzer {
    constructor() {
        this.currentSBox = null;
        this.distChart = null;
        this.scoreChart = null;
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => this.generateSBox());
        document.getElementById('download-excel-btn').addEventListener('click', () => this.downloadExcel());
        document.getElementById('parse-paste-btn').addEventListener('click', () => this.parsePastedSBox());
        document.getElementById('sbox-upload').addEventListener('change', (e) => this.handleUpload(e));

        document.querySelectorAll('button[data-sample]').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadSample(e.target.closest('button').dataset.sample));
        });
    }

    async generateSBox() {
        const mode = document.querySelector('input[name="genMode"]:checked').value;
        try {
            const response = await fetch(CONFIG.ENDPOINTS.GENERATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode })
            });
            const data = await response.json();
            if (data.sbox) {
                this.displayResults(data.sbox, data.metrics);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error generating S-Box');
        }
    }

    async loadSample(num) {
        try {
            const response = await fetch(`${CONFIG.ENDPOINTS.SAMPLE}/${num}`);
            const data = await response.json();
            if (data.sbox) {
                this.displayResults(data.sbox, data.metrics);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error loading sample');
        }
    }

    displayResults(sbox, metrics) {
        this.currentSBox = sbox;
        this.displaySBox(sbox);
        this.displayMetrics(metrics);
        this.renderCharts(sbox, metrics);
        document.getElementById('results-section').classList.add('active');
        this.updateSteps(4);
    }

    displaySBox(sbox) {
        const container = document.getElementById('sbox-display');
        let html = '<div class="sbox-cell header"></div>';

        // ...existing code...
        for (let i = 0; i < CONFIG.GRID_SIZE; i++) {
            html += `<div class="sbox-cell header">${i.toString(16).toUpperCase()}</div>`;
        }

        for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
            html += `<div class="sbox-cell header">${row.toString(16).toUpperCase()}</div>`;
            for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
                const val = sbox[row * CONFIG.GRID_SIZE + col];
                html += `<div class="sbox-cell">${val.toString(16).toUpperCase().padStart(2, '0')}</div>`;
            }
        }

        container.innerHTML = html;
    }

    displayMetrics(metrics) {
        const container = document.getElementById('metrics-display');
        let html = '';

        CONFIG.METRICS.forEach(m => {
            const value = metrics[m.key] ?? 'N/A';
            let status = '';

            if (m.key === 'nonlinearity' && typeof value === 'number') {
                status = value >= 112 ? 'success' : value >= 100 ? 'warning' : 'danger';
            }

            const display = typeof value === 'number' ? (value < 1 ? value.toFixed(4) : value.toFixed(0)) : value;
            html += `<div class="metric-card ${status}"><div class="metric-value">${display}</div><div class="metric-label">${m.label}</div></div>`;
        });

        container.innerHTML = html;
    }

    renderCharts(sbox, metrics) {
        this.destroyCharts();
        this.renderDistributionChart(sbox);
        this.renderSecurityChart(metrics);
    }

    renderDistributionChart(sbox) {
        const distCtx = document.getElementById('distribution-chart').getContext('2d');
        const distribution = new Array(CONFIG.SBOX_SIZE).fill(0);
        sbox.forEach(v => distribution[v]++);

        this.distChart = new Chart(distCtx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: CONFIG.SBOX_SIZE }, (_, i) => i),
                datasets: [{
                    data: distribution,
                    backgroundColor: CONFIG.CHART.DISTRIBUTION_COLOR,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a78bfa' },
                        grid: { color: 'rgba(139,92,246,0.15)' }
                    }
                }
            }
        });
    }

    renderSecurityChart(metrics) {
        const scoreCtx = document.getElementById('score-chart').getContext('2d');
        const m = metrics;
        const data = [
            (m.nonlinearity / 112) * 100,
            (m.sac / 0.5) * 100,
            (m.bic_nl / 112) * 100,
            (m.bic_sac / 0.5) * 100,
            Math.max(0, (1 - m.lap / 0.25) * 100),
            Math.max(0, (1 - m.dap / 0.1) * 100)
        ];

        this.scoreChart = new Chart(scoreCtx, {
            type: 'radar',
            data: {
                labels: ['NL', 'SAC', 'BIC-NL', 'BIC-SAC', 'LAP', 'DAP'],
                datasets: [{
                    data: data,
                    backgroundColor: CONFIG.CHART.SECURITY_COLOR,
                    borderColor: CONFIG.CHART.SECURITY_BORDER,
                    borderWidth: 2,
                    pointBackgroundColor: CONFIG.CHART.SECURITY_BORDER
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 120,
                        ticks: { color: '#a78bfa', backdropColor: 'transparent' },
                        grid: { color: 'rgba(139,92,246,0.2)' },
                        pointLabels: { color: '#e9d5ff', font: { size: 12, weight: 'bold' } }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    destroyCharts() {
        if (this.distChart) { this.distChart.destroy(); this.distChart = null; }
        if (this.scoreChart) { this.scoreChart.destroy(); this.scoreChart = null; }
    }

    updateSteps(n) {
        document.querySelectorAll('.step-badge').forEach((b, i) => {
            b.classList.toggle('active', i < n);
            b.classList.toggle('pending', i >= n);
        });
    }

    async downloadExcel() {
        if (!this.currentSBox) { this.showError('Generate S-Box first'); return; }
        try {
            const response = await fetch(CONFIG.ENDPOINTS.EXPORT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sbox: this.currentSBox })
            });
            const blob = await response.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'sbox_analysis.xlsx';
            a.click();
        } catch (e) { console.error(e); }
    }

    handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => this.parseSBoxContent(event.target.result);
        reader.readAsText(file);
    }

    parsePastedSBox() {
        const content = document.getElementById('sbox-paste').value;
        if (!content.trim()) { this.showError('Paste values first'); return; }
        this.parseSBoxContent(content);
    }

    async parseSBoxContent(content) {
        try {
            const values = content
                .match(/[0-9a-fA-F]+/g)
                ?.map(v => parseInt(v, 16))
                .filter(v => !isNaN(v) && v >= 0 && v <= 255) || [];

            if (values.length !== CONFIG.SBOX_SIZE) {
                this.showError(`Expected ${CONFIG.SBOX_SIZE} values, got ${values.length}`);
                return;
            }

            const response = await fetch(CONFIG.ENDPOINTS.ANALYZE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sbox: values })
            });
            const data = await response.json();
            this.displayResults(values, data.metrics);
        } catch (e) {
            console.error(e);
            this.showError('Error parsing S-Box');
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    new SBoxAnalyzer();
});