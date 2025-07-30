// Report page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeReportPage();
});

let currentStep = 1;
const totalSteps = 5;
const formData = {};

function initializeReportPage() {
    loadGovernorates();
    setupFormSubmissions();
    setupStepNavigation();
    setupMobileNavigation();
    updateProgressBar();
    setupRealTimeValidation();
}

// Mobile Navigation Toggle
function setupMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    }
}

async function loadGovernorates() {
    const fallbackGovernorates = [
        'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار',
        'ديالى', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'كركوك', 'واسط',
        'صلاح الدين', 'ميسان', 'دهوك', 'السليمانية'
    ];
    populateGovernorateSelects(fallbackGovernorates);
}

function populateGovernorateSelects(governorates) {
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
}

function setupFormSubmissions() {
    const form = document.getElementById('pharmacovigilance-form');
    if (form) {
        // Remove any existing event listeners
        form.removeEventListener('submit', handleFormSubmit);
        // Add the event listener
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form submission handler attached successfully');
    } else {
        console.error('Form element not found!');
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submit handler called');
    
    // Save final step data
    saveStepData(currentStep);
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitButton.disabled = true;
    
    try {
        // Map form data to match backend expectations
        const reportData = mapFormDataToBackend(formData);
        
        console.log('Sending report data:', reportData);
        
        // Send data to backend using public endpoint
        const response = await fetch('/api/submit_report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Timestamp': new Date().toISOString()
            },
            credentials: 'include', // Include cookies for potential authentication
            body: JSON.stringify(reportData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Show success message
            showSuccessMessage('تم إرسال التقرير بنجاح! شكراً لمساهمتك في تحسين سلامة الأدوية.');
            
            // Reset form after successful submission
            event.target.reset();
            currentStep = 1;
            showStep(1);
            Object.keys(formData).forEach(key => delete formData[key]);
            
        } else if (response.status === 401) {
            // Handle authentication error
            showErrorMessage('يجب تسجيل الدخول أولاً لإرسال التقرير.');
            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }, 2000);
            
        } else {
            // Handle other errors
            showErrorMessage(result.error || 'حدث خطأ أثناء إرسال التقرير. يرجى المحاولة مرة أخرى.');
        }
        
    } catch (error) {
        console.error('Error submitting report:', error);
        showErrorMessage('حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    } finally {
        // Restore button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

function mapFormDataToBackend(formData) {
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
        report_date: new Date().toISOString()
    };
}

function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'notification success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-family: 'Noto Sans Arabic', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function showErrorMessage(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-family: 'Noto Sans Arabic', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 7 seconds (longer for error messages)
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 7000);
}

function setupStepNavigation() {
    // Navigation is handled by inline onclick attributes in HTML
    // This function is kept for compatibility but doesn't add conflicting listeners
    console.log('Step navigation setup completed - using inline onclick handlers');
}

function updateProgressBar() {
    const progressLine = document.getElementById('progress-line');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Update progress line width
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    if (progressLine) {
        progressLine.style.width = progressPercentage + '%';
    }
    
    // Update step indicators
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            const circle = step.querySelector('.step-circle');
            if (circle) circle.innerHTML = '<i class="fas fa-check"></i>';
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            const circle = step.querySelector('.step-circle');
            if (circle) circle.innerHTML = stepNumber;
        } else {
            const circle = step.querySelector('.step-circle');
            if (circle) circle.innerHTML = stepNumber;
        }
    });
}

function showStep(stepNumber) {
    console.log(`Highlighting step ${stepNumber}`);
    
    // Just remove active class from all steps
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
    
    currentStep = stepNumber;
    updateProgressBar();
}

function validateStep(stepNumber) {
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

    // For step 4 (location and reporter), make reporter fields optional but validate if provided
    if (stepNumber === 4) {
        // Check if at least one reporter field is filled
        const reporterName = currentStepElement.querySelector('input[name="reporter_name"]');
        const reporterPhone = currentStepElement.querySelector('input[name="reporter_phone"]');
        const reporterType = currentStepElement.querySelector('select[name="reporter_type"]');
        
        // If any reporter field is filled, validate basic requirements
        if ((reporterName && reporterName.value.trim()) || 
            (reporterPhone && reporterPhone.value.trim()) || 
            (reporterType && reporterType.value.trim())) {
            
            // If reporter info is provided, require at least name and type
            if (!reporterName.value.trim()) {
                reporterName.closest('.form-group').classList.add('error');
                isValid = false;
            }
            if (!reporterType.value.trim()) {
                reporterType.closest('.form-group').classList.add('error');
                isValid = false;
            }
        }
        
        // Always allow progression from step 4 even if reporter fields are empty
        // This makes reporter information optional
        return true;
    }

    return isValid;
}

function saveStepData(stepNumber) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (!currentStepElement) return;
    
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
}

function nextStep() {
    if (validateStep(currentStep)) {
        saveStepData(currentStep);
        
        if (currentStep < totalSteps) {
            if (currentStep === 4) {
                generateSummary();
            }
            showStep(currentStep + 1);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function generateSummary() {
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
            const value = formData[field.key] || 'غير محدد';
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
}

function setupRealTimeValidation() {
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

// Make functions globally available
window.nextStep = nextStep;
window.prevStep = prevStep;
window.generateSummary = generateSummary;
window.validateStep = validateStep;
window.saveStepData = saveStepData;
window.showStep = showStep;
