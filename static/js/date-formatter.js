// Date Formatter - Centralized date handling
class DateFormatter {
    constructor() {
        this.locale = AppConfig.DATE_LOCALE;
        this.dateFormat = AppConfig.DATE_FORMAT;
        this.timeFormat = AppConfig.TIME_FORMAT;
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date.toLocaleDateString(this.locale, this.dateFormat);
        } catch (error) {
            console.warn('Date formatting error:', error, 'Input:', dateString);
            return dateString; // Return original string if formatting fails
        }
    }

    // Format time for display
    formatTime(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date.toLocaleTimeString(this.locale, this.timeFormat);
        } catch (error) {
            console.warn('Time formatting error:', error, 'Input:', dateString);
            return dateString; // Return original string if formatting fails
        }
    }

    // Format date and time together
    formatDateTime(dateString) {
        if (!dateString) return '';
        
        const date = this.formatDate(dateString);
        const time = this.formatTime(dateString);
        
        return `${date} ${time}`;
    }

    // Format date for API (ISO format)
    formatForAPI(date) {
        if (!date) return null;
        
        try {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date.toISOString();
        } catch (error) {
            console.warn('API date formatting error:', error, 'Input:', date);
            return null;
        }
    }

    // Parse date from input field
    parseInputDate(inputValue) {
        if (!inputValue) return null;
        
        try {
            const date = new Date(inputValue);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date;
        } catch (error) {
            console.warn('Input date parsing error:', error, 'Input:', inputValue);
            return null;
        }
    }

    // Get relative time (e.g., "منذ ساعتين")
    getRelativeTime(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMinutes < 1) {
                return 'الآن';
            } else if (diffMinutes < 60) {
                return `منذ ${diffMinutes} دقيقة`;
            } else if (diffHours < 24) {
                return `منذ ${diffHours} ساعة`;
            } else if (diffDays < 7) {
                return `منذ ${diffDays} يوم`;
            } else {
                return this.formatDate(dateString);
            }
        } catch (error) {
            console.warn('Relative time formatting error:', error, 'Input:', dateString);
            return this.formatDate(dateString);
        }
    }

    // Validate date range
    isValidDateRange(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return false;
            }
            
            return start <= end;
        } catch (error) {
            return false;
        }
    }

    // Get current date in ISO format
    getCurrentISODate() {
        return new Date().toISOString();
    }

    // Get current date formatted for display
    getCurrentFormattedDate() {
        return this.formatDate(this.getCurrentISODate());
    }

    // Get current time formatted for display
    getCurrentFormattedTime() {
        return this.formatTime(this.getCurrentISODate());
    }

    // Format date for input field (YYYY-MM-DD)
    formatForInput(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Input date formatting error:', error, 'Input:', dateString);
            return '';
        }
    }

    // Check if date is today
    isToday(dateString) {
        if (!dateString) return false;
        
        try {
            const date = new Date(dateString);
            const today = new Date();
            
            return date.toDateString() === today.toDateString();
        } catch (error) {
            return false;
        }
    }

    // Check if date is within last N days
    isWithinDays(dateString, days) {
        if (!dateString) return false;
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            
            return diffDays >= 0 && diffDays <= days;
        } catch (error) {
            return false;
        }
    }
}

// Create singleton instance
const dateFormatter = new DateFormatter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateFormatter;
} else {
    window.DateFormatter = DateFormatter;
    window.dateFormatter = dateFormatter;
}

