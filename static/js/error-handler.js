// Error Handler - Centralized error handling
class ErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        this.setupGlobalErrorHandling();
        this.setupNetworkMonitoring();
    }

    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showMessage('تم استعادة الاتصال بالإنترنت', 'success');
            this.processErrorQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showMessage('انقطع الاتصال بالإنترنت', 'warning');
        });
    }

    logError(type, details) {
        const errorInfo = {
            type,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error(`[${type}]`, details);

        // Store error for later reporting if offline
        if (!this.isOnline) {
            this.errorQueue.push(errorInfo);
        } else {
            this.reportError(errorInfo);
        }
    }

    async reportError(errorInfo) {
        try {
            // Only log to console in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Error reporting disabled in development:', errorInfo);
                return;
            }

            // In production, you might want to send to an error reporting service
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(errorInfo)
            // });
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError);
        }
    }

    processErrorQueue() {
        while (this.errorQueue.length > 0) {
            const error = this.errorQueue.shift();
            this.reportError(error);
        }
    }

    handleAPIError(error, context = '') {
        let message = AppConfig.MESSAGES.API_ERROR;
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            message = 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
        } else if (error.status) {
            switch (error.status) {
                case 400:
                    message = 'البيانات المرسلة غير صحيحة';
                    break;
                case 401:
                    message = 'يجب تسجيل الدخول أولاً';
                    break;
                case 403:
                    message = 'ليس لديك صلاحية للوصول لهذا المحتوى';
                    break;
                case 404:
                    message = 'المحتوى المطلوب غير موجود';
                    break;
                case 500:
                    message = 'خطأ في الخادم. يرجى المحاولة لاحقاً';
                    break;
                default:
                    message = `خطأ في الخادم (${error.status})`;
            }
        }

        this.logError('API Error', {
            context,
            error: error.message || error,
            status: error.status
        });

        this.showMessage(message, 'error');
        return message;
    }

    handleFormError(fieldName, errorMessage) {
        const field = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (field) {
            this.showFieldError(field, errorMessage);
        }
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: var(--danger-color, #dc3545);
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        errorDiv.textContent = message;
        
        field.style.borderColor = 'var(--danger-color, #dc3545)';
        field.parentNode.appendChild(errorDiv);
        
        // Auto-clear error on input
        const clearError = () => {
            this.clearFieldError(field);
            field.removeEventListener('input', clearError);
            field.removeEventListener('change', clearError);
        };
        
        field.addEventListener('input', clearError);
        field.addEventListener('change', clearError);
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.app-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `app-message app-message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        messageDiv.style.backgroundColor = colors[type] || colors.info;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, AppConfig.MESSAGE_DURATION);
        
        // Remove on click
        messageDiv.addEventListener('click', () => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        });
    }

    // Wrapper for try-catch with automatic error handling
    async safeExecute(asyncFunction, context = '') {
        try {
            return await asyncFunction();
        } catch (error) {
            this.handleAPIError(error, context);
            throw error;
        }
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else {
    window.ErrorHandler = ErrorHandler;
    window.errorHandler = errorHandler;
}

