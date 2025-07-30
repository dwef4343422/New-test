// Form Handler - Centralized form handling with local storage backup
class FormHandler {
    constructor() {
        this.formData = new Map();
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimers = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    // Initialize form with auto-save and validation
    initializeForm(formId, options = {}) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Form with ID '${formId}' not found`);
            return;
        }

        const config = {
            autoSave: true,
            validateOnInput: true,
            submitEndpoint: null,
            onSuccess: null,
            onError: null,
            ...options
        };

        // Load saved data
        this.loadFormData(formId);

        // Setup auto-save
        if (config.autoSave) {
            this.setupAutoSave(formId);
        }

        // Setup validation
        if (config.validateOnInput) {
            this.setupRealTimeValidation(form);
        }

        // Setup form submission
        if (config.submitEndpoint) {
            this.setupFormSubmission(form, config);
        }

        return {
            save: () => this.saveFormData(formId),
            load: () => this.loadFormData(formId),
            clear: () => this.clearFormData(formId),
            validate: () => this.validateForm(form),
            submit: () => this.submitForm(form, config)
        };
    }

    // Setup auto-save functionality
    setupAutoSave(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.scheduleAutoSave(formId);
            });
            
            input.addEventListener('change', () => {
                this.scheduleAutoSave(formId);
            });
        });
    }

    // Schedule auto-save with debouncing
    scheduleAutoSave(formId) {
        // Clear existing timer
        if (this.autoSaveTimers.has(formId)) {
            clearTimeout(this.autoSaveTimers.get(formId));
        }

        // Set new timer
        const timer = setTimeout(() => {
            this.saveFormData(formId);
            this.autoSaveTimers.delete(formId);
        }, this.autoSaveInterval);

        this.autoSaveTimers.set(formId, timer);
    }

    // Save form data to localStorage
    saveFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const data = new FormData(form);
        const formObject = {};

        // Convert FormData to object
        for (let [key, value] of data.entries()) {
            if (formObject[key]) {
                // Handle multiple values (checkboxes, multiple selects)
                if (Array.isArray(formObject[key])) {
                    formObject[key].push(value);
                } else {
                    formObject[key] = [formObject[key], value];
                }
            } else {
                formObject[key] = value;
            }
        }

        // Handle checkboxes that aren't checked
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked && !formObject.hasOwnProperty(checkbox.name)) {
                formObject[checkbox.name] = false;
            }
        });

        try {
            localStorage.setItem(`form_${formId}`, JSON.stringify({
                data: formObject,
                timestamp: Date.now()
            }));
            
            this.formData.set(formId, formObject);
            
            // Show save confirmation (optional)
            if (Object.keys(formObject).length > 0) {
                console.log(`Form ${formId} auto-saved`);
            }
        } catch (error) {
            console.error('Failed to save form data:', error);
        }
    }

    // Load form data from localStorage
    loadFormData(formId) {
        try {
            const saved = localStorage.getItem(`form_${formId}`);
            if (!saved) return;

            const { data, timestamp } = JSON.parse(saved);
            
            // Check if data is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000;
            if (Date.now() - timestamp > maxAge) {
                this.clearFormData(formId);
                return;
            }

            const form = document.getElementById(formId);
            if (!form) return;

            // Populate form fields
            Object.entries(data).forEach(([key, value]) => {
                const field = form.querySelector(`[name="${key}"]`);
                if (!field) return;

                if (field.type === 'checkbox') {
                    field.checked = Boolean(value);
                } else if (field.type === 'radio') {
                    const radioButton = form.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radioButton) radioButton.checked = true;
                } else if (field.tagName === 'SELECT') {
                    if (Array.isArray(value)) {
                        // Multiple select
                        Array.from(field.options).forEach(option => {
                            option.selected = value.includes(option.value);
                        });
                    } else {
                        field.value = value;
                    }
                } else {
                    field.value = value;
                }
            });

            this.formData.set(formId, data);
            
            // Show restore notification
            errorHandler.showMessage('تم استعادة البيانات المحفوظة', 'info');
        } catch (error) {
            console.error('Failed to load form data:', error);
            this.clearFormData(formId);
        }
    }

    // Clear saved form data
    clearFormData(formId) {
        try {
            localStorage.removeItem(`form_${formId}`);
            this.formData.delete(formId);
            
            // Clear auto-save timer
            if (this.autoSaveTimers.has(formId)) {
                clearTimeout(this.autoSaveTimers.get(formId));
                this.autoSaveTimers.delete(formId);
            }
        } catch (error) {
            console.error('Failed to clear form data:', error);
        }
    }

    // Setup real-time validation
    setupRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Clear error on input
                errorHandler.clearFieldError(input);
            });
        });
    }

    // Validate individual field
    validateField(field) {
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = AppConfig.MESSAGES.REQUIRED_FIELD;
        }
        // Email validation
        else if (field.type === 'email' && field.value && !AppConfig.EMAIL_REGEX.test(field.value)) {
            isValid = false;
            errorMessage = AppConfig.MESSAGES.INVALID_EMAIL;
        }
        // Phone validation
        else if (field.type === 'tel' && field.value && !AppConfig.PHONE_REGEX.test(field.value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = AppConfig.MESSAGES.INVALID_PHONE;
        }
        // Custom validation
        else if (field.dataset.validate) {
            const validationResult = this.customValidation(field, field.dataset.validate);
            if (!validationResult.isValid) {
                isValid = false;
                errorMessage = validationResult.message;
            }
        }

        if (!isValid) {
            errorHandler.showFieldError(field, errorMessage);
        } else {
            errorHandler.clearFieldError(field);
        }

        return isValid;
    }

    // Custom validation rules
    customValidation(field, rule) {
        switch (rule) {
            case 'min-length':
                const minLength = parseInt(field.dataset.minLength) || 0;
                if (field.value.length < minLength) {
                    return {
                        isValid: false,
                        message: `يجب أن يكون الحقل ${minLength} أحرف على الأقل`
                    };
                }
                break;
            
            case 'max-length':
                const maxLength = parseInt(field.dataset.maxLength) || Infinity;
                if (field.value.length > maxLength) {
                    return {
                        isValid: false,
                        message: `يجب أن يكون الحقل ${maxLength} أحرف كحد أقصى`
                    };
                }
                break;
            
            case 'numeric':
                if (field.value && !/^\d+$/.test(field.value)) {
                    return {
                        isValid: false,
                        message: 'يجب أن يحتوي الحقل على أرقام فقط'
                    };
                }
                break;
        }

        return { isValid: true };
    }

    // Validate entire form
    validateForm(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Setup form submission with retry logic
    setupFormSubmission(form, config) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await this.submitForm(form, config);
        });
    }

    // Submit form with retry logic
    async submitForm(form, config) {
        if (!this.validateForm(form)) {
            errorHandler.showMessage('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }

        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : '';

        try {
            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + AppConfig.MESSAGES.LOADING;
            }

            // Attempt submission with retry
            const response = await this.submitWithRetry(config.submitEndpoint, formData);
            
            // Handle success
            if (config.onSuccess) {
                config.onSuccess(response);
            } else {
                errorHandler.showMessage(AppConfig.MESSAGES.FORM_SAVED, 'success');
            }

            // Clear saved form data on successful submission
            this.clearFormData(form.id);

        } catch (error) {
            // Handle error
            if (config.onError) {
                config.onError(error);
            } else {
                errorHandler.handleAPIError(error, 'Form submission');
            }
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    }

    // Submit with retry logic
    async submitWithRetry(endpoint, formData, attempt = 1) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt < this.retryAttempts) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                return this.submitWithRetry(endpoint, formData, attempt + 1);
            } else {
                throw error;
            }
        }
    }

    // Get form data as object
    getFormData(formId) {
        return this.formData.get(formId) || {};
    }

    // Check if form has unsaved changes
    hasUnsavedChanges(formId) {
        const saved = localStorage.getItem(`form_${formId}`);
        return Boolean(saved);
    }
}

// Create singleton instance
const formHandler = new FormHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
} else {
    window.FormHandler = FormHandler;
    window.formHandler = formHandler;
}

