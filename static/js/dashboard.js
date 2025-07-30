// Dashboard functionality for Pharmacovigilance Iraq Platform

// Dashboard application namespace
const DashboardApp = {
    // Initialize dashboard
    init() {
        // Initial data loading
        this.loadStatistics();
        this.refreshAdverseReports();
        this.refreshIntruderReports();
        
        // Setup UI and event listeners
        this.setupEventListeners();
        
        // Load initial analytics charts
        this.loadAnalyticsCharts();
    },

    /**
     * Switches the visible content based on the selected tab.
     * @param {string} tabId - The ID of the content section to show (e.g., 'overview', 'adverse-reports').
     */
    switchDashboardTab(tabId) {
        // Hide all dashboard content sections
        document.querySelectorAll('.dashboard-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the selected content section
        const selectedContent = document.getElementById(tabId);
        if (selectedContent) {
            selectedContent.classList.add('active');
        } else {
            console.warn(`Dashboard content with ID "${tabId}" not found.`);
        }
        
        // If the analytics tab is selected, ensure charts are loaded
        if (tabId === 'analytics') {
            this.loadAnalyticsCharts();
        }
    },

    /**
     * Loads summary statistics for the overview cards.
     * Uses improved error handling from the fix file.
     */
    async loadStatistics() {
        try {
            const res = await fetch("/api/statistics"); // Endpoint from fix
            if (!res.ok) throw new Error("Failed to fetch statistics");

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format from statistics API");
            }

            const data = await res.json();
            // Update the main overview cards
            this.updateElementText('total-adverse-reports', data.total_adverse_reports || 0);
            this.updateElementText('pending-adverse-reports', data.pending_adverse_reports || 0);
            this.updateElementText('total-intruder-reports', data.total_intruder_reports || 0);
            this.updateElementText('pending-intruder-reports', data.pending_intruder_reports || 0);

        } catch (err) {
            console.error("Statistics Load Error:", err.message);
            // Display 'N/A' on error to indicate a problem
            this.updateElementText('total-adverse-reports', 'N/A');
            this.updateElementText('pending-adverse-reports', 'N/A');
            this.updateElementText('total-intruder-reports', 'N/A');
            this.updateElementText('pending-intruder-reports', 'N/A');
        }
    },

    /**
     * Fetches and displays adverse reaction reports in a table.
     * This function adopts the table-based layout from the fix file.
     */
    async refreshAdverseReports() {
        const tableBody = document.getElementById("adverse-reports-table-body");
        if (!tableBody) return;

        tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>جاري التحميل...</td></tr>";
        try {
            const res = await fetch("/api/adverse-reports"); // Endpoint from fix
            if (!res.ok) throw new Error('Failed to fetch adverse reports');
            
            const reports = await res.json();

            if (!reports || reports.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>لا توجد تقارير حالياً</td></tr>";
                return;
            }

            tableBody.innerHTML = reports.map(r => `
              <tr>
                <td>${r.id || 'N/A'}</td>
                <td>${r.drug_name || 'غير محدد'}</td>
                <td>${r.reaction_description || 'لا يوجد وصف'}</td>
                <td>${r.governorate || 'غير محدد'}</td>
                <td>${new Date(r.report_date).toLocaleDateString('ar-EG')}</td>
                <td><span class="status-badge status-${r.status || 'pending'}">${this.getStatusText(r.status)}</span></td>
                <td><span class="priority-badge priority-${r.priority || 'normal'}">${this.getPriorityText(r.priority)}</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view" title="عرض التفاصيل"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>`).join("");
        } catch (err) {
            console.error("Error refreshing adverse reports:", err);
            tableBody.innerHTML = "<tr><td colspan='8' class='text-center'>فشل في تحميل البيانات</td></tr>";
        }
    },

    /**
     * Fetches and displays intruder reports in a table.
     * This function also adopts the table-based layout from the fix file.
     */
    async refreshIntruderReports() {
        const tableBody = document.getElementById("intruder-reports-table-body");
        if (!tableBody) return;

        tableBody.innerHTML = "<tr><td colspan='7' class='text-center'>جاري التحميل...</td></tr>";
        try {
            const res = await fetch("/api/intruder-reports"); // Endpoint from fix
            if (!res.ok) throw new Error('Failed to fetch intruder reports');

            const reports = await res.json();
            
            if (!reports || reports.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='7' class='text-center'>لا توجد تقارير حالياً</td></tr>";
                return;
            }

            tableBody.innerHTML = reports.map(r => `
              <tr>
                <td>${r.id || 'N/A'}</td>
                <td>${r.intruder_name || 'غير محدد'}</td>
                <td>${r.pharmacy_name || 'غير محدد'}</td>
                <td>${r.governorate || 'غير محدد'}</td>
                <td>${new Date(r.report_date).toLocaleDateString('ar-EG')}</td>
                <td><span class="status-badge status-${r.status || 'pending'}">${this.getStatusText(r.status)}</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view" title="عرض التفاصيل"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>`).join("");
        } catch (err) {
            console.error("Error refreshing intruder reports:", err);
            tableBody.innerHTML = "<tr><td colspan='7' class='text-center'>فشل في تحميل البيانات</td></tr>";
        }
    },

    /**
     * Placeholder functions for loading analytics charts.
     * These can be implemented with a library like Chart.js.
     */
    loadAnalyticsCharts() {
        this.loadGovernorateChart();
        this.loadMonthlyTrendChart();
    },
    loadGovernorateChart() {
        console.log("Loading governorate distribution chart...");
        // Chart.js implementation would go here
    },
    loadMonthlyTrendChart() {
        console.log("Loading monthly trend chart...");
        // Chart.js implementation would go here
    },

    /**
     * Sets up all event listeners for the dashboard page, including tab navigation.
     */
    setupEventListeners() {
        const tabs = document.querySelectorAll('.dashboard-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to the clicked tab
                tab.classList.add('active');

                const tabId = tab.dataset.tab;
                if (tabId) {
                    this.switchDashboardTab(tabId);
                }
            });
        });
    },

    // --- Helper Functions ---
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
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
    getPriorityText(priority) {
        const priorityMap = {
            'high': 'عالي',
            'medium': 'متوسط',
            'low': 'منخفض',
            'normal': 'عادي'
        };
        return priorityMap[priority] || priority;
    }
};

// --- Initialization ---

// Initialize the dashboard application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', function() {
    DashboardApp.init();
});

// Make the tab switching function globally available for any legacy onclick attributes.
window.switchDashboardTab = (tabId) => DashboardApp.switchDashboardTab(tabId);

// Export the main app object for debugging or potential extension.
window.DashboardApp = DashboardApp;

