// Dashboard functionality

// Dashboard application namespace
const DashboardApp = {
    currentAdversePage: 1,
    currentIntruderPage: 1,
    adverseReportsData: [],
    intruderReportsData: [],
    statisticsData: {},

    // Initialize dashboard
    init() {
        this.loadStatistics();
        this.loadAdverseReports();
        this.loadIntruderReports();
        this.setupFilters();
        this.setupEventListeners();
    },

    // Switch between dashboard tabs
    switchDashboardTab(tabId) {
        // Hide all content sections
        const contents = document.querySelectorAll('.dashboard-content');
        contents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.dashboard-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected content
        const selectedContent = document.getElementById(tabId);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        // Add active class to corresponding tab
        const tabIndex = ['overview', 'adverse-reports', 'intruder-reports', 'analytics', 'settings'].indexOf(tabId);
        if (tabs[tabIndex]) {
            tabs[tabIndex].classList.add('active');
        }
        
        // Load specific data for the tab
        if (tabId === 'analytics') {
            this.loadAnalytics();
        }
    },

    async loadStatistics() {
        await errorHandler.safeExecute(async () => {
            const response = await fetch(`${AppConfig.API_BASE}/statistics`, {
                timeout: AppConfig.API_TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.statisticsData = data;
            this.updateStatisticsDisplay(data);
        }, 'Loading dashboard statistics');
    },

    updateStatisticsDisplay(data) {
        // Update statistics cards
        this.updateElementText('total-adverse-reports', data.total_adverse_reports || 0);
        this.updateElementText('pending-adverse-reports', data.pending_adverse_reports || 0);
        this.updateElementText('total-intruder-reports', data.total_intruder_reports || 0);
        this.updateElementText('pending-intruder-reports', data.pending_intruder_reports || 0);
    },

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    async loadAdverseReports() {
        await errorHandler.safeExecute(async () => {
            const response = await fetch(`${AppConfig.API_BASE}/adverse_reactions?page=${this.currentAdversePage}`, {
                timeout: AppConfig.API_TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.adverseReportsData = data.reports || [];
            this.displayAdverseReports(this.adverseReportsData);
        }, 'Loading adverse reports');
    },

    displayAdverseReports(reports) {
        const container = document.getElementById('adverse-reports-list');
        if (!container) return;

        if (reports.length === 0) {
            container.innerHTML = '<p class="text-center">لا توجد تقارير أعراض جانبية</p>';
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <h4>${report.drug_name || 'دواء غير محدد'}</h4>
                    <span class="report-status ${report.status}">${this.getStatusText(report.status)}</span>
                </div>
                <div class="report-content">
                    <p><strong>المريض:</strong> ${report.patient_age || 'غير محدد'} سنة، ${report.patient_gender || 'غير محدد'}</p>
                    <p><strong>الأثر الجانبي:</strong> ${report.reaction_description || 'غير محدد'}</p>
                    <p><strong>التاريخ:</strong> ${dateFormatter.formatDate(report.report_date)}</p>
                </div>
            </div>
        `).join('');
    },

    async loadIntruderReports() {
        await errorHandler.safeExecute(async () => {
            const response = await fetch(`${AppConfig.API_BASE}/intruder_reports?page=${this.currentIntruderPage}`, {
                timeout: AppConfig.API_TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.intruderReportsData = data.reports || [];
            this.displayIntruderReports(this.intruderReportsData);
        }, 'Loading intruder reports');
    },

    displayIntruderReports(reports) {
        const container = document.getElementById('intruder-reports-list');
        if (!container) return;

        if (reports.length === 0) {
            container.innerHTML = '<p class="text-center">لا توجد تقارير دخلاء</p>';
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <h4>${report.intruder_name || 'دخيل غير محدد'}</h4>
                    <span class="report-status ${report.status}">${this.getStatusText(report.status)}</span>
                </div>
                <div class="report-content">
                    <p><strong>الصيدلية:</strong> ${report.pharmacy_name || 'غير محدد'}</p>
                    <p><strong>المحافظة:</strong> ${report.governorate || 'غير محدد'}</p>
                    <p><strong>التاريخ:</strong> ${dateFormatter.formatDate(report.report_date)}</p>
                </div>
            </div>
        `).join('');
    },

    getStatusText(status) {
        const statusMap = {
            'pending': 'قيد المراجعة',
            'approved': 'مقبول',
            'rejected': 'مرفوض',
            'in_progress': 'قيد المعالجة'
        };
        return statusMap[status] || status;
    },

    async loadAnalytics() {
        await errorHandler.safeExecute(async () => {
            const response = await fetch(`${AppConfig.API_BASE}/analytics`, {
                timeout: AppConfig.API_TIMEOUT
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayAnalytics(data);
        }, 'Loading analytics');
    },

    displayAnalytics(data) {
        // Analytics display logic here
        console.log('Analytics data:', data);
    },

    setupFilters() {
        // Filter setup logic
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            });
        });
    },

    applyFilter(filter) {
        // Filter application logic
        console.log('Applying filter:', filter);
    },

    setupEventListeners() {
        // Additional event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.dashboard-tab')) {
                const tabId = e.target.dataset.tab;
                if (tabId) {
                    this.switchDashboardTab(tabId);
                }
            }
        });
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    DashboardApp.init();
});

// Make functions globally available
window.switchDashboardTab = (tabId) => DashboardApp.switchDashboardTab(tabId);

// Export for use in other files
window.DashboardApp = DashboardApp;

