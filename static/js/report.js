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
        // The form handler is now managed directly within this script.
    },

    /**
     * Shows a message to the user in the status box.
     * Assumes an element with id="report-status" exists in the HTML.
     * @param {string} msg - The message to display.
     * @param {string} type - The message type ('success', 'error', 'info').
     */
    showMessage(msg, type = "info") {
        const statusBox = document.getElementById("report-status");
        if (statusBox) {
            const alertType = type === 'error' ? 'alert-danger' : 'alert-success';
            statusBox.innerHTML = `
              <div class="alert ${alertType}">
                ${msg}
              </div>
            `;
            statusBox.scrollIntoView({ behavior: "smooth" });
        } else {
            // Fallback to console if status box is not found
            console[type === 'error' ? 'error' : 'log'](msg);
        }
    },

    // Load governorates into the select dropdown
    async loadGovernorates() {
        try {
            // In a real application, you might fetch this from an API.
            // Using a fallback list for demonstration.
            const governorates = [
                'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار',
                'ديالى', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'كركوك', 'واسط',
                'صلاح الدين', 'ميسان', 'دهوك', 'السليمانية'
            ];
            this.populateGovernorateSelects(governorates);
        } catch (error) {
            console.error('Error loading governorates:', error);
            this.showMessage('فشل تحميل قائمة المحافظات.', 'error');
        }
    },

    // Helper function to populate the governorate select element
    populateGovernorateSelects(governorates) {
        const select = document.querySelector('select[name="governorate"]');
        if (select) {
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            governorates.forEach(gov => {
                const option = document.createElement('option');
                option.value = gov;
                option.textContent = gov;
                select.appendChild(option);
            });
        }
    },

    // Set up the main form submission listener
    setupFormSubmissions() {
        // The form ID is taken from your original script.
        const form = document.getElementById('pharmacovigilance-form');
        if (form) {
            form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        }
    },

    /**
     * Handles the final form submission.
     * This function now incorporates the logic from your "fix" script.
     * @param {Event} event - The form submission event.
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        this.showMessage(''); // Clear previous messages

        // Save data from the final step
        this.saveStepData(this.currentStep);

        // --- Logic from the "fix" script starts here ---

        // Final validation before submission
        const requiredFields = {
            drug_name: 'اسم الدواء',
            reaction_description: 'وصف الأثر الجانبي',
            governorate: 'المحافظة'
        };

        for (const field in requiredFields) {
            if (!this.formData[field] || this.formData[field].trim() === "") {
                this.showMessage(`الرجاء ملء الحقل الإلزامي: ${requiredFields[field]}`, "error");
                // Navigate to the step containing the invalid field
                const fieldElement = document.querySelector(`[name="${field}"]`);
                if (fieldElement) {
                   const stepElement = fieldElement.closest('.form-step');
                   if (stepElement) {
                       this.showStep(parseInt(stepElement.dataset.step, 10));
                   }
                }
                return;
            }
        }

        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...`;
        submitButton.disabled = true;

        try {
            const reportData = this.mapFormDataToBackend(this.formData);
            console.log('Sending report data:', reportData);

            // Using the fetch logic from your "fix"
            const res = await fetch("/api/submit_report", { // Endpoint from original script
                method: "POST",
                headers: { "Content-Type": "application/json", 'X-Requested-With': 'XMLHttpRequest' },
                credentials: "include",
                body: JSON.stringify(reportData)
            });

            const data = await res.json();

            if (res.ok) {
                this.showMessage("تم إرسال التقرير بنجاح. شكراً لمساهمتك.", "success");
                this.clearFormData();
                this.resetForm();
            } else {
                this.showMessage(data.message || "حدث خطأ أثناء إرسال التقرير", "error");
            }
        } catch (err) {
            console.error(err);
            this.showMessage("فشل الاتصال بالخادم. حاول مرة أخرى لاحقاً.", "error");
        } finally {
            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    },

    // Maps the multi-step form data to the format expected by the backend.
    mapFormDataToBackend(formData) {
        const reportId = 'ADR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        return {
            id: reportId,
            patient_age: formData.patient_age || '',
            patient_gender: formData.patient_gender || '',
            patient_weight: formData.patient_weight || '',
            patient_height: formData.patient_height || '',
            drug_name: formData.drug_name || '',
            drug_manufacturer: formData.drug_manufacturer || '',
            drug_batch_number: formData.drug_batch || '',
            drug_dosage: formData.drug_dosage || '',
            drug_route: formData.drug_route || '',
            drug_indication: formData.drug_indication || '',
            drug_start_date: formData.drug_start_date || '',
            reaction_description: formData.reaction_description || '',
            reaction_severity: formData.reaction_severity || '',
            reaction_start_date: formData.reaction_start_date || '',
            reaction_end_date: formData.reaction_end_date || '',
            reaction_outcome: formData.outcome || '',
            reporter_name: formData.reporter_name || '',
            reporter_phone: formData.reporter_phone || '',
            reporter_email: formData.reporter_email || '',
            reporter_type: formData.reporter_type || '',
            governorate: formData.governorate || '',
            city: formData.city || '',
            pharmacy_name: formData.pharmacy_name || '',
            pharmacy_address: formData.pharmacy_address || '',
            concomitant_drugs: formData.concomitant_drugs || '',
            medical_history: formData.medical_history || '',
            status: 'pending',
            priority: 'normal',
            assigned_to: '',
            follow_up_required: false,
            report_date: new Date().toISOString()
        };
    },

    // Saves data from the current step into the formData object
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
        console.log('Current form data:', this.formData);
    },

    // Clears the collected form data
    clearFormData() {
        this.formData = {};
    },

    // Resets the entire form to its initial state
    resetForm() {
        this.currentStep = 1;
        this.updateProgressBar();
        this.showStep(1);
        const form = document.getElementById('pharmacovigilance-form');
        if (form) {
            form.reset();
        }
    },

    // Setup navigation (no changes needed here)
    setupStepNavigation() {
        console.log('Step navigation is handled by inline onclick handlers.');
    },

    // Updates the visual progress bar
    updateProgressBar() {
        const progressLine = document.getElementById('progress-line');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        const progressPercentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        if (progressLine) {
            progressLine.style.width = progressPercentage + '%';
        }
        
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            const circle = step.querySelector('.step-circle');
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                if (circle) circle.innerHTML = '<i class="fas fa-check"></i>';
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                if (circle) circle.innerHTML = stepNumber;
            } else {
                if (circle) circle.innerHTML = stepNumber;
            }
        });
    },

    // Shows the specified step number
    showStep(stepNumber) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (stepElement) {
            stepElement.classList.add('active');
            stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        this.currentStep = stepNumber;
        this.updateProgressBar();
    },

    // Validates required fields within a single step
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
        
        if (!isValid) {
            this.showMessage('الرجاء ملء جميع الحقول المطلوبة في هذه الخطوة.', 'error');
        }

        return isValid;
    },

    // Logic for the "Next" button
    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.saveStepData(this.currentStep);
            
            if (this.currentStep < this.totalSteps) {
                // Generate summary on the step before last
                if (this.currentStep === this.totalSteps - 1) {
                    this.generateSummary();
                }
                this.showStep(this.currentStep + 1);
            }
        }
    },

    // Logic for the "Previous" button
    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    // Generates the final summary view before submission
    generateSummary() {
        const summaryContainer = document.getElementById('form-summary');
        if (!summaryContainer) return;
        
        // Save data from the penultimate step before generating summary
        this.saveStepData(this.totalSteps - 1);

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
                    { key: 'drug_dosage', label: 'الجرعة' }
                ]
            },
            {
                title: 'الأثر الجانبي',
                icon: 'fas fa-exclamation-triangle',
                fields: [
                    { key: 'reaction_description', label: 'وصف الأثر الجانبي' },
                    { key: 'reaction_severity', label: 'الشدة' },
                    { key: 'outcome', label: 'النتيجة' }
                ]
            },
            {
                title: 'الموقع والمبلغ',
                icon: 'fas fa-map-marker-alt',
                fields: [
                    { key: 'governorate', label: 'المحافظة' },
                    { key: 'city', label: 'المدينة' },
                    { key: 'reporter_name', label: 'اسم المبلغ' },
                    { key: 'reporter_phone', label: 'رقم الهاتف' }
                ]
            }
        ];

        let summaryHTML = '<h2>ملخص التقرير</h2>';
        
        sections.forEach(section => {
            let sectionHasContent = false;
            let sectionHTML = `
                <div class="summary-section">
                    <h3><i class="${section.icon}"></i> ${section.title}</h3>`;
            
            section.fields.forEach(field => {
                const value = this.formData[field.key] || '';
                if (value && value.trim() !== '') {
                    sectionHasContent = true;
                    sectionHTML += `
                        <div class="summary-item">
                            <span class="summary-label">${field.label}:</span>
                            <span class="summary-value">${value}</span>
                        </div>
                    `;
                }
            });
            
            sectionHTML += '</div>';
            if (sectionHasContent) {
                summaryHTML += sectionHTML;
            }
        });
        
        summaryContainer.innerHTML = summaryHTML;
    },

    // Adds input event listeners for real-time validation feedback
    setupRealTimeValidation() {
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

// --- Global Setup ---

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    ReportApp.init();
});

// Make key functions globally available for inline onclick attributes in the HTML
window.nextStep = () => ReportApp.nextStep();
window.prevStep = () => ReportApp.prevStep();

// Export the main app object for debugging or potential extension
window.ReportApp = ReportApp;

