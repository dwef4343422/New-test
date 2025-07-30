// Report page functionality

// Report application namespace
const ReportApp = {
    currentStep: 1,
    totalSteps: 5,
    formData: {},

    // Initialize report page
    init() {
        this.loadGovernorates();
        this.setupFormSubmissions();
        this.setupStepNavigation();
        this.updateProgressBar();
        this.setupRealTimeValidation();
        this.initializeFormHandler();
    },

    // Initialize form handler for auto-save and validation
    initializeFormHandler() {
        const reportForm = document.getElementById('pharmacovigilance-form');
        if (reportForm) {
            formHandler.initializeForm('pharmacovigilance-form', {
                autoSave: true,
                validateOnInput: true,
                submitEndpoint: '/api/submit_report',
                onSuccess: (response) => {
                    errorHandler.showMessage('تم إرسال التقرير بنجاح! شكراً لمساهمتك في تحسين سلامة الأدوية.', 'success');
                    this.clearFormData();
                    this.resetForm();
                },
                onError: (error) => {
                    errorHandler.handleAPIError(error, 'Report submission');
                }
            });
        }
    },

    async loadGovernorates() {
        await errorHandler.safeExecute(async () => {
            const fallbackGovernorates = [
                'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار',
                'ديالى', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'كركوك', 'واسط',
                'صلاح الدين', 'ميسان', 'دهوك', 'السليمانية'
            ];
            this.populateGovernorateSelects(fallbackGovernorates);
        }, 'Loading governorates');
    },

    populateGovernorateSelects(governorates) {
        const select = document.querySelector('select[name="governorate"]');
        if (select) {
            // Clear existing options except the first one
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // Add governorate options
            governorates.forEach(gov => {
                const option = document.createElement('option');
                option.value = gov;
                option.textContent = gov;
                select.appendChild(option);
            });
        }
    },

    setupFormSubmissions() {
        const form = document.getElementById('pharmacovigilance-form');
        if (form) {
            form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        }
    },

    async handleFormSubmit(event) {
        event.preventDefault();
        
        // Save final step data
        this.saveStepData(this.currentStep);
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${AppConfig.MESSAGES.LOADING}`;
        submitButton.disabled = true;
        
        try {
            // Map form data to match backend expectations
            const reportData = this.mapFormDataToBackend(this.formData);
            
            console.log('Sending report data:', reportData);
            
            // Send data to backend using public endpoint with retry logic
            const response = await this.submitWithRetry('/api/submit_report', reportData);
            
            if (response.success || response.status === 'success') {
                errorHandler.showMessage('تم إرسال التقرير بنجاح! شكراً لمساهمتك في تحسين سلامة الأدوية.', 'success');
                this.clearFormData();
                this.resetForm();
            } else {
                throw new Error(response.message || response.error || 'Submission failed');
            }
        } catch (error) {
            errorHandler.handleAPIError(error, 'Report submission');
        } finally {
            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    },

    async submitWithRetry(endpoint, data, attempt = 1) {
        const maxRetries = 3;
        const retryDelay = 1000;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Timestamp': dateFormatter.getCurrentISODate()
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                return this.submitWithRetry(endpoint, data, attempt + 1);
            } else {
                throw error;
            }
        }
    },

    mapFormDataToBackend(formData) {
        // Generate unique ID for the report
        const reportId = 'ADR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        return {
            id: reportId,
            // Patient information
            patient_age: formData.patient_age || '',
            patient_gender: formData.patient_gender || '',
            patient_weight: formData.patient_weight || '',
            patient_height: formData.patient_height || '',
            
            // Drug information - map to backend expected field names
            drug_name: formData.drug_name || '',
            drug_manufacturer: formData.drug_manufacturer || '',
            drug_batch_number: formData.drug_batch || '', // Map drug_batch to drug_batch_number
            drug_dosage: formData.drug_dosage || '',
            drug_route: formData.drug_route || '',
            drug_indication: formData.drug_indication || '',
            drug_start_date: formData.drug_start_date || '',
            
            // Reaction information
            reaction_description: formData.reaction_description || '',
            reaction_severity: formData.reaction_severity || '',
            reaction_start_date: formData.reaction_start_date || '',
            reaction_end_date: formData.reaction_end_date || '',
            reaction_outcome: formData.outcome || '', // Map outcome to reaction_outcome
            
            // Reporter and location information
            reporter_name: formData.reporter_name || '',
            reporter_phone: formData.reporter_phone || '',
            reporter_email: formData.reporter_email || '',
            reporter_type: formData.reporter_type || '',
            
            // Location information
            governorate: formData.governorate || '',
            city: formData.city || '',
            pharmacy_name: formData.pharmacy_name || '',
            pharmacy_address: formData.pharmacy_address || '',
            
            // Additional fields
            concomitant_drugs: formData.concomitant_drugs || '',
            medical_history: formData.medical_history || '',
            
            // Default status and priority
            status: 'pending',
            priority: 'normal',
            assigned_to: '',
            follow_up_required: false,
            
            // Timestamp
            report_date: dateFormatter.getCurrentISODate()
        };
    },

    saveStepData(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepElement) return;

        const inputs = stepElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    },

    clearFormData() {
        this.formData = {};
        formHandler.clearFormData('pharmacovigilance-form');
    },

    resetForm() {
        this.currentStep = 1;
        this.updateProgressBar();
        this.showStep(1);
        const form = document.getElementById('pharmacovigilance-form');
        if (form) {
            form.reset();
        }
    },

    setupStepNavigation() {
        // Navigation is handled by inline onclick attributes in HTML
        // This function is kept for compatibility but doesn't add conflicting listeners
        console.log('Step navigation setup completed - using inline onclick handlers');
    },

    updateProgressBar() {
        const progressLine = document.getElementById('progress-line');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        // Update progress line width
        const progressPercentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        if (progressLine) {
            progressLine.style.width = progressPercentage + '%';
        }
        
        // Update step indicators
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                const circle = step.querySelector('.step-circle');
                if (circle) circle.innerHTML = '<i class="fas fa-check"></i>';
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                const circle = step.querySelector('.step-circle');
                if (circle) circle.innerHTML = stepNumber;
            } else {
                const circle = step.querySelector('.step-circle');
                if (circle) circle.innerHTML = stepNumber;
            }
        });
    },

    showStep(stepNumber) {
        console.log(`Highlighting step ${stepNumber}`);
        
        // Remove active class from all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Add active class to current step - specifically target form-step elements
        const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (stepElement) {
            stepElement.classList.add('active');
            stepElement.scrollIntoView({ behavior: 'smooth' });
            console.log(`Step ${stepNumber} element highlighted`);
        }
        
        this.currentStep = stepNumber;
        this.updateProgressBar();
    },

    validateStep(stepNumber) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (!currentStepElement) return false;
        
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            
            if (!field.value || !field.value.trim()) {
                if (formGroup) formGroup.classList.add('error');
                isValid = false;
            } else {
                if (formGroup) formGroup.classList.remove('error');
            }
        });

        // For step 1, only validate if age is provided (more lenient validation)
        if (stepNumber === 1) {
            const ageField = currentStepElement.querySelector('input[name="patient_age"]');
            if (ageField && ageField.value && ageField.value.trim()) {
                return true; // Allow progression if age is provided
            }
        }

        return isValid;
    },

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.saveStepData(this.currentStep);
            
            if (this.currentStep < this.totalSteps) {
                if (this.currentStep === 4) {
                    this.generateSummary();
                }
                this.showStep(this.currentStep + 1);
            }
        }
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    generateSummary() {
        const summaryContainer = document.getElementById('form-summary');
        if (!summaryContainer) return;
        
        const sections = [
            {
                title: 'معلومات المريض',
                icon: 'fas fa-user',
                fields: [
                    { key: 'patient_age', label: 'العمر' },
                    { key: 'patient_gender', label: 'الجنس' },
                    { key: 'patient_weight', label: 'الوزن (كغ)' },
                    { key: 'patient_height', label: 'الطول (سم)' }
                ]
            },
            {
                title: 'معلومات الدواء',
                icon: 'fas fa-pills',
                fields: [
                    { key: 'drug_name', label: 'اسم الدواء' },
                    { key: 'drug_manufacturer', label: 'الشركة المصنعة' },
                    { key: 'drug_batch', label: 'رقم الدفعة' },
                    { key: 'drug_dosage', label: 'الجرعة' },
                    { key: 'drug_route', label: 'طريقة التناول' },
                    { key: 'drug_start_date', label: 'تاريخ البدء' }
                ]
            },
            {
                title: 'الأثر الجانبي',
                icon: 'fas fa-exclamation-triangle',
                fields: [
                    { key: 'reaction_description', label: 'وصف الأثر الجانبي' },
                    { key: 'reaction_severity', label: 'الشدة' },
                    { key: 'reaction_start_date', label: 'تاريخ البداية' },
                    { key: 'reaction_end_date', label: 'تاريخ الانتهاء' },
                    { key: 'outcome', label: 'النتيجة' }
                ]
            },
            {
                title: 'الموقع والمبلغ',
                icon: 'fas fa-map-marker-alt',
                fields: [
                    { key: 'governorate', label: 'المحافظة' },
                    { key: 'city', label: 'المدينة' },
                    { key: 'pharmacy_name', label: 'اسم الصيدلية' },
                    { key: 'pharmacy_address', label: 'عنوان الصيدلية' },
                    { key: 'reporter_name', label: 'اسم المبلغ' },
                    { key: 'reporter_type', label: 'نوع المبلغ' },
                    { key: 'reporter_phone', label: 'رقم الهاتف' },
                    { key: 'reporter_email', label: 'البريد الإلكتروني' }
                ]
            }
        ];

        let summaryHTML = '';
        
        sections.forEach(section => {
            summaryHTML += `
                <div class="summary-section">
                    <h3><i class="${section.icon}"></i> ${section.title}</h3>
            `;
            
            section.fields.forEach(field => {
                const value = this.formData[field.key] || 'غير محدد';
                if (value && value !== 'غير محدد' && value.trim() !== '') {
                    summaryHTML += `
                        <div class="summary-item">
                            <span class="summary-label">${field.label}:</span>
                            <span class="summary-value">${value}</span>
                        </div>
                    `;
                }
            });
            
            summaryHTML += '</div>';
        });
        
        summaryContainer.innerHTML = summaryHTML;
    },

    setupRealTimeValidation() {
        // Add input event listeners for real-time validation
        document.addEventListener('input', function(e) {
            if (e.target.matches('input[required], select[required], textarea[required]')) {
                const formGroup = e.target.closest('.form-group');
                if (e.target.value.trim()) {
                    if (formGroup) formGroup.classList.remove('error');
                }
            }
        });
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    ReportApp.init();
});

// Make functions globally available for inline onclick handlers
window.nextStep = () => ReportApp.nextStep();
window.prevStep = () => ReportApp.prevStep();
window.generateSummary = () => ReportApp.generateSummary();
window.validateStep = (step) => ReportApp.validateStep(step);
window.saveStepData = (step) => ReportApp.saveStepData(step);
window.showStep = (step) => ReportApp.showStep(step);

// Export for use in other files
window.ReportApp = ReportApp;

