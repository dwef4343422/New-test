// Main JavaScript file for Pharmacovigilance Iraq Platform

// Global variables
let currentLanguage = 'ar';
const API_BASE = '/pharma';

// DOM Content Loaded - Consolidated initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeMobileNavigation();
    enhanceMobileNavigation();
});

// Initialize the application
function initializeApp() {
    loadStatistics();
    loadLatestAlerts();
    setupFormValidation();
}

// Load statistics from API
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE}/statistics`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('Statistics API returned non-JSON response, using fallback data');
            updateStatisticsDisplay({
                total_adverse_reports: 0,
                total_intruder_reports: 0,
                pending_adverse_reports: 0,
                pending_intruder_reports: 0
            });
            return;
        }
        
        const data = await response.json();
        updateStatisticsDisplay(data);
    } catch (error) {
        console.error("Error loading statistics:", error);
        // Fallback to default values if API fails
        updateStatisticsDisplay({
            total_adverse_reports: 0,
            total_intruder_reports: 0,
            pending_adverse_reports: 0,
            pending_intruder_reports: 0
        });
    }
}

// Update statistics display
function updateStatisticsDisplay(data) {
    const totalReports = (data.total_adverse_reports || 0) + (data.total_intruder_reports || 0);
    const pendingReports = (data.pending_adverse_reports || 0) + (data.pending_intruder_reports || 0);
    
    updateElementText('total-reports', totalReports);
    updateElementText('pending-reports', pendingReports);
    updateElementText('total-users', Math.floor(totalReports * 1.5)); // Estimated users
    
    // Animate numbers
    animateNumbers();
}

// Load latest alerts
async function loadLatestAlerts() {
    try {
        const response = await fetch(`${API_BASE}/drug_alerts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('API returned non-JSON response, using fallback alerts');
            displayDefaultAlerts();
            return;
        }
        
        const alerts = await response.json();
        displayAlerts(alerts);
    } catch (error) {
        console.error("Error loading alerts:", error);
        // Fallback to default alerts if API fails
        displayDefaultAlerts();
    }
}

// Display alerts
function displayAlerts(alerts) {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    if (alerts.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد تنبيهات حالياً</p>';
        return;
    }

    container.innerHTML = alerts.map(alert => `
        <div class="alert-card">
            <div class="alert-header">
                <div class="alert-icon ${getSeverityClass(alert.severity)}">
                    <i class="fas ${getAlertIcon(alert.alert_type)}"></i>
                </div>
                <h3 class="alert-title">${alert.title}</h3>
            </div>
            <div class="alert-content">
                ${alert.content.substring(0, 200)}${alert.content.length > 200 ? '...' : ''}
            </div>
        </div>
    `).join('');
}

// Display default alerts if API fails
function displayDefaultAlerts() {
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

    displayAlerts(defaultAlerts);
}

// Get severity CSS class
function getSeverityClass(severity) {
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
}

// Get alert icon
function getAlertIcon(alertType) {
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
}

// Animate numbers
function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-number');
    
    numberElements.forEach(element => {
        const target = parseInt(element.textContent);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    });
}

// Update element text safely
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(form)) {
                event.preventDefault();
            }
        });
    });
}

// Validate form
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'هذا الحقل مطلوب');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }
    });
    
    // Phone validation
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
            showFieldError(field, 'يرجى إدخال رقم هاتف صحيح');
            isValid = false;
        }
    });
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--danger-color)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    
    field.style.borderColor = 'var(--danger-color)';
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '';
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (Iraqi phone numbers)
function isValidPhone(phone) {
    const phoneRegex = /^(\+964|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Show loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    }
}

// Hide loading spinner
function hideLoading(element, originalContent) {
    if (element) {
        element.innerHTML = originalContent;
    }
}

// Show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: var(--shadow-lg);
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = 'var(--success-color)';
    } else {
        messageDiv.style.backgroundColor = 'var(--danger-color)';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
    
    // Remove on click
    messageDiv.addEventListener('click', () => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Smooth scrolling for anchor links
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

// Handle window resize
window.addEventListener('resize', function() {
    // Close mobile menu on resize
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (window.innerWidth > 768) {
        if (navMenu) navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
    }
});

// Export functions for use in other files
window.PharmacovigilanceApp = {
    showSuccessMessage,
    showErrorMessage,
    showLoading,
    hideLoading,
    validateForm,
    formatDate,
    formatTime,
    API_BASE
};

// Mobile Navigation Toggle Functionality - CONSOLIDATED
function initializeMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    console.log('Initializing mobile navigation:', { navToggle: !!navToggle, navMenu: !!navMenu });
    
    if (navToggle && navMenu) {
        // Toggle mobile menu
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Hamburger menu clicked');
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Update ARIA attributes
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            navMenu.setAttribute('aria-hidden', !isExpanded);
        });
        
        // Close mobile menu when clicking on nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Close mobile menu on window resize to desktop size
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        });
    } else {
        console.warn('Mobile navigation elements not found:', { navToggle: !!navToggle, navMenu: !!navMenu });
    }
}

// Enhanced mobile navigation for better accessibility
function enhanceMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        // Add ARIA attributes for accessibility
        navToggle.setAttribute('aria-label', 'Toggle navigation menu');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
        
        // Handle keyboard navigation
        navToggle.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navToggle.click();
            }
        });
        
        // Handle escape key to close menu
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
                navToggle.focus(); // Return focus to toggle button
            }
        });
    }
}

