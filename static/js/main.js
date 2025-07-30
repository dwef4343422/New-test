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
        this.setupMobileMenu(); // Added from the fix
    },

    /**
     * Load statistics from the API.
     * This version incorporates the improved error handling from the "fix" file.
     */
    async loadStatistics() {
        try {
            // Assuming API_BASE is defined globally or replace with actual endpoint
            const API_BASE = "/pharma"; 
            const response = await fetch(`${API_BASE}/statistics`);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error("API response is not JSON, using fallback.");
            }

            const stats = await response.json();
            this.updateStatisticsDisplay(stats);
        } catch (err) {
            console.warn("Statistics fallback due to error:", err);
            // Use fallback data if the API call fails
            this.updateStatisticsDisplay({
                total_adverse_reports: 0,
                total_intruder_reports: 0,
                pending_adverse_reports: 0,
                pending_intruder_reports: 0
            });
        }
    },

    // Update statistics display on the page
    updateStatisticsDisplay(data) {
        const totalReports = (data.total_adverse_reports || 0) + (data.total_intruder_reports || 0);
        const pendingReports = (data.pending_adverse_reports || 0) + (data.pending_intruder_reports || 0);
        
        this.updateElementText('total-reports', totalReports);
        this.updateElementText('pending-reports', pendingReports);
        // This is an estimation, retained from original
        this.updateElementText('total-users', Math.floor(totalReports * 1.5)); 
        
        this.animateNumbers();
    },

    // Load latest alerts from the API
    async loadLatestAlerts() {
        try {
            const API_BASE = "/pharma"; // Assuming API_BASE
            const response = await fetch(`${API_BASE}/drug_alerts`);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('Alerts API returned non-JSON response, using fallback alerts');
                this.displayDefaultAlerts();
                return;
            }
            
            const alerts = await response.json();
            this.displayAlerts(alerts);
        } catch (error) {
            console.error("Error loading alerts:", error);
            this.displayDefaultAlerts();
        }
    },

    // Display alerts in the container
    displayAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = `<p class="text-center">لا توجد تنبيهات حالياً.</p>`;
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

    // Display default alerts if the API fails
    displayDefaultAlerts() {
        const defaultAlerts = [{
            title: 'تنبيه عام حول سلامة الأدوية',
            content: 'يرجى قراءة النشرة الداخلية للأدوية بعناية واتباع تعليمات الطبيب والصيدلي.',
            alert_type: 'معلومات',
            severity: 'متوسط'
        }];
        this.displayAlerts(defaultAlerts);
    },

    // Helper functions for styling alerts
    getSeverityClass(severity) {
        switch (String(severity).toLowerCase()) {
            case 'عالي': case 'critical': return 'danger';
            case 'متوسط': case 'medium': return 'warning';
            default: return 'info';
        }
    },
    getAlertIcon(alertType) {
        switch (String(alertType).toLowerCase()) {
            case 'تحذير': case 'warning': return 'fa-exclamation-triangle';
            case 'استدعاء': case 'recall': return 'fa-ban';
            default: return 'fa-info-circle';
        }
    },

    // Animate numbers for statistics
    animateNumbers() {
        const numberElements = document.querySelectorAll('.stat-number');
        numberElements.forEach(element => {
            const target = parseInt(element.textContent.replace(/,/g, ''), 10) || 0;
            if (isNaN(target)) return;
            
            let current = 0;
            const duration = 1500; // ms
            const increment = target / (duration / 16); // 60fps

            const updateNumber = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.ceil(current).toLocaleString('ar-EG');
                    requestAnimationFrame(updateNumber);
                } else {
                    element.textContent = target.toLocaleString('ar-EG');
                }
            };
            requestAnimationFrame(updateNumber);
        });
    },

    // Safely update text content of an element by its ID
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text.toLocaleString('ar-EG');
        }
    },
    
    /**
     * Sets up the mobile menu toggle functionality.
     * This function is from the "fix" file.
     */
    setupMobileMenu() {
        const navToggle = document.getElementById("nav-toggle");
        const mobileMenu = document.getElementById("mobile-menu");

        if (!navToggle || !mobileMenu) return;

        navToggle.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent click from immediately closing the menu
            navToggle.classList.toggle("active");
            mobileMenu.classList.toggle("active");
        });

        // Close menu when clicking outside of it
        document.addEventListener("click", (e) => {
            if (!navToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                navToggle.classList.remove("active");
                mobileMenu.classList.remove("active");
            }
        });
    },

    // Placeholder for form validation setup
    setupFormValidation() {
        // This part can be expanded or connected to a dedicated form handler module
        console.log("Form validation setup initialized.");
    },

    // Setup smooth scrolling for anchor links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    // Setup window event handlers
    setupWindowEvents() {
        // Refresh data when tab becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadStatistics();
                this.loadLatestAlerts();
            }
        });
    }
};

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PharmaApp.init();
});

// Export for use in other files or for debugging
window.PharmaApp = PharmaApp;

