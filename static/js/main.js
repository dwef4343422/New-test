// Main JavaScript file for Pharmacovigilance Iraq Platform

// Application namespace
const PharmaApp = {
    // Initialize the application
    init() {
        this.loadStatistics();
        this.loadLatestAlerts();
        this.setupFormValidation();
        this.setupSmoothScrolling();
        this.setupWindowEvents();
    },

    // Load statistics from API
    async loadStatistics() {
        await errorHandler.safeExecute(async () => {
            const response = await fetch(`${AppConfig.API_BASE}/statistics`, {
                timeout: AppConfig.API_TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('Statistics API returned non-JSON response, using fallback data');
                this.updateStatisticsDisplay({
                    total_adverse_reports: 0,
                    total_intruder_reports: 0,
                    pending_adverse_reports: 0,
                    pending_intruder_reports: 0
                });
                return;
            }
            
            const data = await response.json();
            this.updateStatisticsDisplay(data);
        }, 'Loading statistics');
    },

    // Update statistics display
    updateStatisticsDisplay(data) {
        const totalReports = (data.total_adverse_reports || 0) + (data.total_intruder_reports || 0);
        const pendingReports = (data.pending_adverse_reports || 0) + (data.pending_intruder_reports || 0);
        
        this.updateElementText('total-reports', totalReports);
        this.updateElementText('pending-reports', pendingReports);
        this.updateElementText('total-users', Math.floor(totalReports * 1.5)); // Estimated users
        
        // Animate numbers
        this.animateNumbers();
    },

    // Load latest alerts
    async loadLatestAlerts() {
        await errorHandler.safeExecute(async () => {
            const response = await fetch(`${AppConfig.API_BASE}/drug_alerts`, {
                timeout: AppConfig.API_TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('API returned non-JSON response, using fallback alerts');
                this.displayDefaultAlerts();
                return;
            }
            
            const alerts = await response.json();
            this.displayAlerts(alerts);
        }, 'Loading alerts');
    },

    // Display alerts
    displayAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = `<p class="text-center">${AppConfig.MESSAGES.NO_ALERTS}</p>`;
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-card">
                <div class="alert-header">
                    <div class="alert-icon ${this.getSeverityClass(alert.severity)}">
                        <i class="fas ${this.getAlertIcon(alert.alert_type)}"></i>
                    </div>
                    <h3 class="alert-title">${alert.title}</h3>
                </div>
                <div class="alert-content">
                    ${alert.content.substring(0, 200)}${alert.content.length > 200 ? '...' : ''}
                </div>
            </div>
        `).join('');
    },

    // Display default alerts if API fails
    displayDefaultAlerts() {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        const defaultAlerts = [
            {
                title: 'تنبيه عام حول سلامة الأدوية',
                content: 'يرجى قراءة النشرة الداخلية للأدوية بعناية واتباع تعليمات الطبيب والصيدلي.',
                alert_type: 'معلومات',
                severity: 'متوسط'
            }
        ];

        this.displayAlerts(defaultAlerts);
    },

    // Get severity CSS class
    getSeverityClass(severity) {
        switch (severity) {
            case 'عالي':
            case 'critical':
                return 'danger';
            case 'متوسط':
            case 'medium':
                return 'warning';
            default:
                return 'info';
        }
    },

    // Get alert icon
    getAlertIcon(alertType) {
        switch (alertType) {
            case 'تحذير':
            case 'warning':
                return 'fa-exclamation-triangle';
            case 'استدعاء':
            case 'recall':
                return 'fa-ban';
            default:
                return 'fa-info-circle';
        }
    },

    // Animate numbers
    animateNumbers() {
        const numberElements = document.querySelectorAll('.stat-number');
        
        numberElements.forEach(element => {
            const target = parseInt(element.textContent);
            const duration = AppConfig.ANIMATION_DURATION;
            const step = target / (duration / (1000 / AppConfig.ANIMATION_FPS));
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 1000 / AppConfig.ANIMATION_FPS);
        });
    },

    // Update element text safely
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    // Form validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Use the centralized form handler
            formHandler.initializeForm(form.id || `form_${Date.now()}`, {
                validateOnInput: true,
                autoSave: true
            });
        });
    },

    // Setup smooth scrolling for anchor links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // Setup window event handlers
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            // Navigation manager handles mobile menu closure
            // Additional resize handling can be added here
        });

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Refresh data when page becomes visible
                this.loadStatistics();
                this.loadLatestAlerts();
            }
        });
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    PharmaApp.init();
});

// Export for use in other files
window.PharmaApp = PharmaApp;

