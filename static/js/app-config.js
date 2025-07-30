// Application Configuration
const AppConfig = {
    // API Configuration
    API_BASE: '/pharma',
    API_TIMEOUT: 5000,
    
    // Date Format Configuration
    DATE_LOCALE: 'ar-IQ',
    DATE_FORMAT: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    },
    TIME_FORMAT: {
        hour: '2-digit',
        minute: '2-digit'
    },
    
    // Animation Configuration
    ANIMATION_DURATION: 2000,
    ANIMATION_FPS: 60,
    
    // Message Configuration
    MESSAGE_DURATION: 5000,
    
    // Validation Configuration
    PHONE_REGEX: /^(\+964|0)?[0-9]{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // UI Configuration
    MOBILE_BREAKPOINT: 768,
    
    // Error Messages
    MESSAGES: {
        REQUIRED_FIELD: 'هذا الحقل مطلوب',
        INVALID_EMAIL: 'يرجى إدخال بريد إلكتروني صحيح',
        INVALID_PHONE: 'يرجى إدخال رقم هاتف صحيح',
        LOADING: 'جاري التحميل...',
        NO_ALERTS: 'لا توجد تنبيهات حالياً',
        API_ERROR: 'حدث خطأ في الاتصال بالخادم',
        FORM_SAVED: 'تم حفظ البيانات بنجاح',
        FORM_ERROR: 'حدث خطأ أثناء حفظ البيانات'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else {
    window.AppConfig = AppConfig;
}

