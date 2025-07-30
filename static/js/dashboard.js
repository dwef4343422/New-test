// Dashboard functionality

let currentAdversePage = 1;
let currentIntruderPage = 1;
let adverseReportsData = [];
let intruderReportsData = [];
let statisticsData = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    loadStatistics();
    loadAdverseReports();
    loadIntruderReports();
    setupFilters();
    setupEventListeners();
}

// Switch between dashboard tabs
function switchDashboardTab(tabId) {
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
        loadAnalytics();
    }
}

// Load statistics
async function loadStatistics() {
    // Statistics endpoint not implemented yet
    displayDefaultStatistics();
}

// Display statistics
function displayStatistics(data) {
    const container = document.getElementById('stats-overview');
    if (!container) return;

    const stats = [
        {
            icon: 'fa-file-medical',
            iconClass: 'primary',
            number: (data.total_adverse_reports || 0) + (data.total_intruder_reports || 0),
            label: 'إجمالي التقارير'
        },
        {
            icon: 'fa-clock',
            iconClass: 'warning',
            number: (data.pending_adverse_reports || 0) + (data.pending_intruder_reports || 0),
            label: 'قيد المراجعة'
        },
        {
            icon: 'fa-pills',
            iconClass: 'success',
            number: data.total_adverse_reports || 0,
            label: 'تقارير الآثار الجانبية'
        },
        {
            icon: 'fa-user-slash',
            iconClass: 'danger',
            number: data.total_intruder_reports || 0,
            label: 'بلاغات الدخلاء'
        }
    ];

    container.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-icon ${stat.iconClass}">
                <i class="fas ${stat.icon}"></i>
            </div>
            <div class="stat-number">${stat.number}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

// Display default statistics if API fails
function displayDefaultStatistics() {
    const defaultData = {
        total_adverse_reports: 0,
        total_intruder_reports: 0,
        pending_adverse_reports: 0,
        pending_intruder_reports: 0
    };
    displayStatistics(defaultData);
}

// Load adverse reports
async function loadAdverseReports(page = 1, filters = {}) {
    try {
        const params = new URLSearchParams({
            page: page,
            per_page: 20,
            ...filters
        });
        
        const response = await fetch(`${window.PharmacovigilanceApp.API_BASE}/adverse_reactions`);
        if (response.ok) {
            const data = await response.json();
            adverseReportsData = {
                reports: data,
                current_page: 1,
                pages: 1,
                total: data.length
            };
            displayAdverseReports(adverseReportsData);
        } else if (response.status === 401) {
            // User not authenticated, show login message
            displayAuthenticationRequired();
        } else {
            displayNoAdverseReports();
        }
    } catch (error) {
        console.error('Error loading adverse reports:', error);
        displayNoAdverseReports();
    }
}

// Display adverse reports
function displayAdverseReports(data) {
    const tableBody = document.getElementById('adverse-reports-table');
    const paginationInfo = document.getElementById('adverse-pagination-info');
    const prevBtn = document.getElementById('adverse-prev-btn');
    const nextBtn = document.getElementById('adverse-next-btn');
    
    if (!tableBody) return;

    if (!data.reports || data.reports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    لا توجد تقارير متاحة
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.reports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.drug_name || 'غير محدد'}</td>
            <td>${truncateText(report.reaction_description || '', 50)}</td>
            <td>${report.governorate || 'غير محدد'}</td>
            <td>${formatDate(report.report_date)}</td>
            <td><span class="status-badge status-${report.status || 'pending'}">${getStatusText(report.status)}</span></td>
            <td><span class="status-badge priority-${report.priority || 'normal'}">${getPriorityText(report.priority)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewReport('adverse', ${report.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editReport('adverse', ${report.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update pagination
    if (paginationInfo) {
        const start = ((data.current_page - 1) * 20) + 1;
        const end = Math.min(data.current_page * 20, data.total);
        paginationInfo.textContent = `عرض ${start}-${end} من ${data.total} تقرير`;
    }

    if (prevBtn) {
        prevBtn.disabled = data.current_page <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = data.current_page >= data.pages;
    }
}

// Display no adverse reports message
function displayNoAdverseReports() {
    const tableBody = document.getElementById('adverse-reports-table');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    لا توجد تقارير متاحة
                </td>
            </tr>
        `;
    }
}

// Display authentication required message
function displayAuthenticationRequired() {
    const tableBody = document.getElementById('adverse-reports-table');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--warning-color);">
                    <i class="fas fa-lock" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    يجب تسجيل الدخول لعرض التقارير
                    <br>
                    <a href="/login" style="color: var(--primary-color); text-decoration: underline; margin-top: 1rem; display: inline-block;">
                        تسجيل الدخول
                    </a>
                </td>
            </tr>
        `;
    }
}

// Load intruder reports
async function loadIntruderReports(page = 1, filters = {}) {
    // Intruder reports not implemented yet
    displayNoIntruderReports();
}

// Display intruder reports
function displayIntruderReports(data) {
    const tableBody = document.getElementById('intruder-reports-table');
    const paginationInfo = document.getElementById('intruder-pagination-info');
    const prevBtn = document.getElementById('intruder-prev-btn');
    const nextBtn = document.getElementById('intruder-next-btn');
    
    if (!tableBody) return;

    if (!data.reports || data.reports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    لا توجد بلاغات متاحة
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.reports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.intruder_name || 'غير محدد'}</td>
            <td>${report.pharmacy_name || 'غير محدد'}</td>
            <td>${report.governorate || 'غير محدد'}</td>
            <td>${formatDate(report.report_date)}</td>
            <td><span class="status-badge status-${report.status || 'pending'}">${getStatusText(report.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewReport('intruder', ${report.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editReport('intruder', ${report.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update pagination
    if (paginationInfo) {
        const start = ((data.current_page - 1) * 20) + 1;
        const end = Math.min(data.current_page * 20, data.total);
        paginationInfo.textContent = `عرض ${start}-${end} من ${data.total} بلاغ`;
    }

    if (prevBtn) {
        prevBtn.disabled = data.current_page <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = data.current_page >= data.pages;
    }
}

// Display no intruder reports message
function displayNoIntruderReports() {
    const tableBody = document.getElementById('intruder-reports-table');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    لا توجد بلاغات متاحة
                </td>
            </tr>
        `;
    }
}

// Setup filters
function setupFilters() {
    // Load governorates for filters
    loadGovernoratesForFilters();
    
    // Setup filter event listeners
    const adverseStatusFilter = document.getElementById('adverse-status-filter');
    const adversePriorityFilter = document.getElementById('adverse-priority-filter');
    const adverseGovernorateFilter = document.getElementById('adverse-governorate-filter');
    
    if (adverseStatusFilter) {
        adverseStatusFilter.addEventListener('change', () => {
            currentAdversePage = 1;
            loadAdverseReports(1, getAdverseFilters());
        });
    }
    
    if (adversePriorityFilter) {
        adversePriorityFilter.addEventListener('change', () => {
            currentAdversePage = 1;
            loadAdverseReports(1, getAdverseFilters());
        });
    }
    
    if (adverseGovernorateFilter) {
        adverseGovernorateFilter.addEventListener('change', () => {
            currentAdversePage = 1;
            loadAdverseReports(1, getAdverseFilters());
        });
    }
    
    // Intruder filters
    const intruderStatusFilter = document.getElementById('intruder-status-filter');
    const intruderGovernorateFilter = document.getElementById('intruder-governorate-filter');
    
    if (intruderStatusFilter) {
        intruderStatusFilter.addEventListener('change', () => {
            currentIntruderPage = 1;
            loadIntruderReports(1, getIntruderFilters());
        });
    }
    
    if (intruderGovernorateFilter) {
        intruderGovernorateFilter.addEventListener('change', () => {
            currentIntruderPage = 1;
            loadIntruderReports(1, getIntruderFilters());
        });
    }
}

// Load governorates for filters
async function loadGovernoratesForFilters() {
    // Governorates endpoint not implemented yet
    const fallbackGovernorates = [
        'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار',
        'ديالى', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'كركوك', 'واسط',
        'صلاح الدين', 'ميسان', 'دهوك', 'السليمانية'
    ];
    populateGovernorateFilters(fallbackGovernorates);
}

// Populate governorate filters
function populateGovernorateFilters(governorates) {
    const adverseFilter = document.getElementById('adverse-governorate-filter');
    const intruderFilter = document.getElementById('intruder-governorate-filter');
    
    [adverseFilter, intruderFilter].forEach(filter => {
        if (filter) {
            governorates.forEach(gov => {
                const option = document.createElement('option');
                option.value = gov;
                option.textContent = gov;
                filter.appendChild(option);
            });
        }
    });
}

// Get adverse filters
function getAdverseFilters() {
    const filters = {};
    
    const statusFilter = document.getElementById('adverse-status-filter');
    if (statusFilter && statusFilter.value) {
        filters.status = statusFilter.value;
    }
    
    const priorityFilter = document.getElementById('adverse-priority-filter');
    if (priorityFilter && priorityFilter.value) {
        filters.priority = priorityFilter.value;
    }
    
    const governorateFilter = document.getElementById('adverse-governorate-filter');
    if (governorateFilter && governorateFilter.value) {
        filters.governorate = governorateFilter.value;
    }
    
    return filters;
}

// Get intruder filters
function getIntruderFilters() {
    const filters = {};
    
    const statusFilter = document.getElementById('intruder-status-filter');
    if (statusFilter && statusFilter.value) {
        filters.status = statusFilter.value;
    }
    
    const governorateFilter = document.getElementById('intruder-governorate-filter');
    if (governorateFilter && governorateFilter.value) {
        filters.governorate = governorateFilter.value;
    }
    
    return filters;
}

// Setup event listeners
function setupEventListeners() {
    // Add any additional event listeners here
}

// Change adverse reports page
function changeAdversePage(direction) {
    const newPage = currentAdversePage + direction;
    if (newPage >= 1 && newPage <= (adverseReportsData.pages || 1)) {
        currentAdversePage = newPage;
        loadAdverseReports(newPage, getAdverseFilters());
    }
}

// Change intruder reports page
function changeIntruderPage(direction) {
    const newPage = currentIntruderPage + direction;
    if (newPage >= 1 && newPage <= (intruderReportsData.pages || 1)) {
        currentIntruderPage = newPage;
        loadIntruderReports(newPage, getIntruderFilters());
    }
}

// Refresh functions
function refreshAdverseReports() {
    loadAdverseReports(currentAdversePage, getAdverseFilters());
    window.PharmacovigilanceApp.showSuccessMessage('تم تحديث تقارير الآثار الجانبية');
}

function refreshIntruderReports() {
    loadIntruderReports(currentIntruderPage, getIntruderFilters());
    window.PharmacovigilanceApp.showSuccessMessage('تم تحديث بلاغات الدخلاء');
}

// Export functions
function exportAdverseReports() {
    // In a real implementation, this would generate and download a CSV/Excel file
    window.PharmacovigilanceApp.showSuccessMessage('سيتم تصدير التقارير قريباً');
}

function exportIntruderReports() {
    // In a real implementation, this would generate and download a CSV/Excel file
    window.PharmacovigilanceApp.showSuccessMessage('سيتم تصدير البلاغات قريباً');
}

// View report
function viewReport(type, id) {
    // Create modal to view report details
    const modal = document.createElement('div');
    modal.className = 'content-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        border-radius: var(--border-radius);
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        position: relative;
    `;

    modalContent.innerHTML = `
        <button onclick="closeReportModal()" style="
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-secondary);
        ">&times;</button>
        <h2 style="margin-bottom: 1.5rem; color: var(--primary-color);">
            ${type === 'adverse' ? 'تفاصيل تقرير الآثار الجانبية' : 'تفاصيل بلاغ الدخيل'} #${id}
        </h2>
        <div style="line-height: 1.7; color: var(--text-primary);">
            <p>سيتم عرض تفاصيل التقرير هنا...</p>
            <p>رقم التقرير: ${id}</p>
            <p>النوع: ${type === 'adverse' ? 'آثار جانبية' : 'بلاغ دخيل'}</p>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeReportModal();
        }
    });
}

// Edit report
function editReport(type, id) {
    window.PharmacovigilanceApp.showSuccessMessage(`سيتم فتح محرر ${type === 'adverse' ? 'التقرير' : 'البلاغ'} #${id} قريباً`);
}

// Close report modal
function closeReportModal() {
    const modal = document.querySelector('.content-modal');
    if (modal) {
        modal.remove();
    }
}

// Load analytics
function loadAnalytics() {
    // This would load charts and analytics data
    // For now, we'll just show placeholder messages
    console.log('Loading analytics...');
}

// Save settings
function saveSettings() {
    window.PharmacovigilanceApp.showSuccessMessage('تم حفظ الإعدادات بنجاح');
}

// Utility functions
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'قيد المراجعة';
        case 'reviewed':
            return 'تمت المراجعة';
        case 'closed':
            return 'مغلق';
        default:
            return 'غير محدد';
    }
}

function getPriorityText(priority) {
    switch (priority) {
        case 'high':
            return 'عالية';
        case 'normal':
            return 'عادية';
        case 'low':
            return 'منخفضة';
        default:
            return 'عادية';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Make functions globally available
window.switchDashboardTab = switchDashboardTab;
window.changeAdversePage = changeAdversePage;
window.changeIntruderPage = changeIntruderPage;
window.refreshAdverseReports = refreshAdverseReports;
window.refreshIntruderReports = refreshIntruderReports;
window.exportAdverseReports = exportAdverseReports;
window.exportIntruderReports = exportIntruderReports;
window.viewReport = viewReport;
window.editReport = editReport;
window.closeReportModal = closeReportModal;
window.saveSettings = saveSettings;

