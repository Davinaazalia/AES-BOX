const CONFIG = {
    API_BASE: '',
    SBOX_SIZE: 256,
    GRID_SIZE: 16,
    ENDPOINTS: {
        GENERATE: '/api/generate-sbox',
        SAMPLE: '/api/sample-sbox',
        ANALYZE: '/api/analyze-sbox',
        EXPORT: '/api/export-excel'
    },
    METRICS: [
        { key: 'nonlinearity', label: 'Nonlinearity', threshold: 112, ideal: true },
        { key: 'sac', label: 'SAC', threshold: 0.5, ideal: true },
        { key: 'bic_nl', label: 'BIC-NL', threshold: 112, ideal: true },
        { key: 'bic_sac', label: 'BIC-SAC', threshold: 0.5, ideal: true },
        { key: 'lap', label: 'LAP', threshold: 0.25, ideal: false },
        { key: 'dap', label: 'DAP', threshold: 0.1, ideal: false },
        { key: 'algebraic_degree', label: 'Alg. Degree', threshold: 7, ideal: true }
    ],
    CHART: {
        DISTRIBUTION_COLOR: 'rgba(139, 92, 246, 0.7)',
        SECURITY_COLOR: 'rgba(16, 185, 129, 0.25)',
        SECURITY_BORDER: '#10b981'
    }
};
