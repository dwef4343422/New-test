// Info page functionality

let currentContent = [];
let currentAlerts = [];
let searchTimeout;

document.addEventListener('DOMContentLoaded', function() {
    initializeInfoPage();
});

function initializeInfoPage() {
    loadEducationalContent();
    loadAlerts();
    setupSearch();
    setupGuidelinesAccordion();
    setupMobileNavigation();

    const hash = window.location.hash;
    if (hash === '#alerts') {
        switchContentTab('alerts');
    }
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

// Switch between content tabs
function switchContentTab(tabId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const selectedSection = document.getElementById(tabId);
    if (selectedSection) selectedSection.classList.add('active');

    const selectedTab = document.querySelector(`.content-tab[onclick="switchContentTab('${tabId}')"]`);
    if (selectedTab) selectedTab.classList.add('active');
    
    window.location.hash = (tabId === 'alerts' || tabId === 'guidelines') ? `#${tabId}` : '';
}

// Load educational content from API
async function loadEducationalContent() {
    try {
        const response = await fetch(`${window.PharmacovigilanceApp.API_BASE}/educational_content`);
        if (response.ok) {
            const data = await response.json();
            currentContent = data.map(item => ({
                id: item.id,
                title: item.title_ar,
                summary: item.content_ar.substring(0, 200),
                content: item.content_ar,
                category: item.category,
                icon: 'fa-notes-medical'
            }));
            displayEducationalContent(currentContent);
        } else {
            displayDefaultEducationalContent();
        }
    } catch (error) {
        console.error('Error loading educational content:', error);
        displayDefaultEducationalContent();
    }
}

// Display educational content with new modern card style
function displayEducationalContent(content) {
    const container = document.getElementById('educational-content');
    if (!container) return;

    if (content.length === 0) {
        container.innerHTML = `
            <div class="no-content">
                <i class="fas fa-book-open"></i>
                <h3>لا يوجد محتوى متاح حالياً</h3>
                <p>سيتم إضافة المزيد من المحتوى التعليمي قريباً</p>
            </div>
        `;
        return;
    }

    container.innerHTML = content.map(item => `
        <div class="content-card">
            <div class="content-card-header">
                <div class="content-card-icon">
                    <i class="fas ${item.icon || 'fa-notes-medical'}"></i>
                </div>
                <div class="content-card-title-wrapper">
                    <div class="content-card-title">${item.title}</div>
                    <div class="content-card-category">${item.category || 'عام'}</div>
                </div>
            </div>
            <div class="content-card-body">
                <div class="content-card-text">
                    ${truncateText(item.summary, 150)}
                </div>
            </div>
            <div class="content-card-footer">
                <button class="read-more-btn" onclick="showFullContent(${item.id})">اقرأ المزيد</button>
            </div>
        </div>
    `).join('');
}

function displayDefaultEducationalContent() {
    const defaultContent = [
        {
            id: 1,
            title: 'فهم الوصفة الطبية',
            icon: 'fa-file-prescription',
            category: 'أساسيات الدواء',
            summary: 'الوصفة الطبية هي تعليمات الطبيب للصيدلي. تعلم كيفية قراءتها بشكل صحيح، فهم الجرعات، ومعرفة أهمية الالتزام بها لضمان أفضل النتائج العلاجية.',
            content: `<h3>أجزاء الوصفة الطبية:</h3><ul><li><b>اسم المريض:</b> للتأكد من أن الدواء للشخص الصحيح.</li><li><b>اسم الدواء:</b> الاسم العلمي أو التجاري.</li><li><b>الجرعة:</b> كمية الدواء في كل مرة (مثل 500 ملغ).</li><li><b>طريقة التناول:</b> (فموي، حقن، موضعي).</li><li><b>تكرار الاستخدام:</b> (مثال: مرتان يومياً).</li><li><b>مدة العلاج:</b> (مثال: لمدة 7 أيام).</li></ul><h3>نصائح هامة:</h3><p>لا تتردد أبداً في سؤال الصيدلي عن أي جزء غير واضح في الوصفة. تأكد من إخبار طبيبك بأي حساسية لديك تجاه أدوية معينة.</p>`
        },
        {
            id: 2,
            title: 'التفاعلات الدوائية الخطيرة',
            icon: 'fa-exclamation-triangle',
            category: 'سلامة الأدوية',
            summary: 'يمكن لبعض الأدوية أن تتفاعل مع أدوية أخرى، أو مع أطعمة معينة، أو حتى مع المكملات الغذائية. هذه التفاعلات قد تقلل من فعالية الدواء أو تزيد من آثاره الجانبية.',
            content: `<h3>أنواع التفاعلات:</h3><ul><li><b>دواء مع دواء:</b> قد يزيد دواء من تأثير دواء آخر أو يبطله.</li><li><b>دواء مع طعام:</b> عصير الجريب فروت، منتجات الألبان، والكحول هي أمثلة شائعة لأطعمة تتفاعل مع بعض الأدوية.</li><li><b>دواء مع حالة مرضية:</b> بعض الأدوية قد تكون خطيرة إذا كنت تعاني من أمراض معينة مثل أمراض الكلى أو القلب.</li></ul><h3>كيفية تجنبها:</h3><p>أخبر طبيبك والصيدلي بجميع الأدوية والمكملات التي تتناولها. اقرأ النشرة المرفقة مع الدواء دائماً.</p>`
        },
        {
            id: 3,
            title: 'التخزين والتخلص الآمن من الأدوية',
            icon: 'fa-trash-alt',
            category: 'إرشادات منزلية',
            summary: 'الطريقة التي تخزن بها الأدوية وتتخلص منها تؤثر على سلامتها وسلامة البيئة. التخزين الخاطئ قد يفسد الدواء، والتخلص غير الآمن قد يضر بالآخرين.',
            content: `<h3>التخزين الصحيح:</h3><ul><li>احفظ الأدوية في مكان بارد وجاف، بعيداً عن ضوء الشمس المباشر. الحمام ليس مكاناً جيداً بسبب الرطوبة.</li><li>احفظها بعيداً عن متناول الأطفال والحيوانات الأليفة.</li><li>لا تقم بإزالة الأدوية من عبواتها الأصلية.</li></ul><h3>التخلص الآمن:</h3><p>لا ترمِ الأدوية في المرحاض أو القمامة مباشرة. استشر الصيدلي عن أفضل الطرق للتخلص من الأدوية منتهية الصلاحية أو غير المستخدمة.</p>`
        },
        {
            id: 4,
            title: 'الأدوية أثناء الحمل والرضاعة',
            icon: 'fa-female',
            category: 'حالات خاصة',
            summary: 'يجب التعامل مع الأدوية بحذر شديد أثناء فترتي الحمل والرضاعة، حيث يمكن لبعضها أن يؤثر على الجنين أو الرضيع. استشارة الطبيب ضرورية قبل تناول أي دواء.',
            content: `<h3>قاعدة أساسية:</h3><p><b>لا تتناولي أي دواء أو مكمل غذائي دون استشارة طبيبك أولاً.</b> هذا يشمل الأدوية التي لا تحتاج لوصفة طبية والمسكنات البسيطة.</p><h3>معلومات هامة:</h3><ul><li>بعض الأدوية آمنة تماماً، بينما البعض الآخر قد يسبب تشوهات خلقية.</li><li>طبيبك سيوازن بين حاجتك للدواء والمخاطر المحتملة على الجنين.</li><li>أخبري طبيبك إذا كنتِ تخططين للحمل لمراجعة أدويتك الحالية.</li></ul>`
        },
        {
            id: 5,
            title: 'كيفية التعرف على الأدوية المغشوشة',
            icon: 'fa-search-plus',
            category: 'توعية المستهلك',
            summary: 'الأدوية المغشوشة تشكل خطراً كبيراً على الصحة. قد تحتوي على مكونات خاطئة، أو لا تحتوي على أي مكون فعال، أو تحتوي على شوائب ضارة. تعلم بعض العلامات للتعرف عليها.',
            content: `<h3>علامات تحذيرية:</h3><ul><li><b>العبوة:</b> أخطاء إملائية، طباعة رديئة، أو عبوة تبدو مختلفة عن المعتاد.</li><li><b>الدواء نفسه:</b> لون أو شكل أو حجم أو طعم غير متوقع. يتكسر بسهولة.</li><li><b>السعر:</b> سعر منخفض بشكل غير طبيعي مقارنة بالصيدليات الموثوقة.</li><li><b>المصدر:</b> الشراء من مصادر غير موثوقة عبر الإنترنت أو بائعين متجولين.</li></ul><h3>ماذا تفعل؟</h3><p>اشترِ الأدوية من الصيدليات المرخصة فقط. إذا شككت في دواء، لا تتناوله وأبلغ الصيدلي أو السلطات الصحية فوراً.</p>`
        },
        {
            id: 6,
            title: 'أهمية إكمال جرعة المضاد الحيوي',
            icon: 'fa-pills',
            category: 'سلامة الأدوية',
            summary: 'التوقف عن تناول المضاد الحيوي بمجرد الشعور بالتحسن هو خطأ شائع وخطير. إكمال الجرعة كاملة ضروري للقضاء على البكتيريا ومنع تطور مقاومتها للدواء.',
            content: `<h3>لماذا هو مهم؟</h3><ul><li><b>القضاء على العدوى بالكامل:</b> التوقف المبكر قد يترك البكتيريا الأقوى حية، مما قد يسبب عودة المرض بشكل أشد.</li><li><b>منع مقاومة المضادات الحيوية:</b> البكتيريا التي تنجو تتعلم كيفية مقاومة الدواء، مما يجعل العدوى المستقبلية أصعب في العلاج. هذه مشكلة صحية عالمية خطيرة.</li></ul><h3>القاعدة الذهبية:</h3><p>دائماً أكمل دورة المضاد الحيوي كاملة كما وصفها الطبيب، حتى لو شعرت بتحسن تام قبل انتهائها.</p>`
        }
    ];

    currentContent = defaultContent;
    displayEducationalContent(defaultContent);
}

// Load alerts from API
async function loadAlerts() {
    try {
        const response = await fetch(`${window.PharmacovigilanceApp.API_BASE}/drug_alerts`);
        if (response.ok) {
            const data = await response.json();
            currentAlerts = data.map(alert => ({
                title: alert.title_ar,
                content: alert.content_ar,
                alert_type: alert.alert_type,
                severity: alert.severity,
                created_date: alert.created_date
            }));
            displayAlerts(currentAlerts);
        } else {
            displayDefaultAlerts();
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
        displayDefaultAlerts();
    }
}

// Display alerts
function displayAlerts(alerts) {
    const container = document.getElementById('alerts-content');
    if (!container) return;

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="no-content">
                <i class="fas fa-bell"></i>
                <h3>لا توجد تنبيهات حالياً</h3>
                <p>سيتم عرض التنبيهات الجديدة هنا عند توفرها</p>
            </div>
        `;
        return;
    }

    container.innerHTML = alerts.map(alert => `
        <div class="alert-card ${getPriorityClass(alert.severity)}">
            <div class="alert-header">
                <div class="alert-icon ${getSeverityClass(alert.severity)}">
                    <i class="fas ${getAlertIcon(alert.alert_type)}"></i>
                </div>
                <div class="alert-title">${alert.title}</div>
                <div class="alert-date">${formatDate(alert.created_date)}</div>
            </div>
            <div class="alert-content">
                ${alert.content}
            </div>
        </div>
    `).join('');
}

function displayDefaultAlerts() {
    const defaultAlerts = [
        {
            title: 'تنبيه عام حول سلامة الأدوية',
            content: 'يرجى قراءة النشرة الداخلية للأدوية بعناية واتباع تعليمات الطبيب والصيدلي. في حالة ظهور أي آثار جانبية غير متوقعة، يرجى الإبلاغ عنها فوراً.',
            alert_type: 'معلومات',
            severity: 'متوسط',
            created_date: new Date().toISOString()
        },
        {
            title: 'تذكير بأهمية الإبلاغ',
            content: 'نذكر جميع المواطنين والمهنيين الصحيين بأهمية الإبلاغ عن الآثار الجانبية للأدوية. كل تقرير يساهم في تحسين سلامة الأدوية للجميع.',
            alert_type: 'تذكير',
            severity: 'منخفض',
            created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    currentAlerts = defaultAlerts;
    displayAlerts(defaultAlerts);
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(event) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(event.target.value);
            }, 300);
        });
    }
}

// Perform search
function performSearch(query) {
    if (!query.trim()) {
        displayEducationalContent(currentContent);
        return;
    }

    const filteredContent = currentContent.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
    );

    displayEducationalContent(filteredContent);
}

// Show full content in modal
function showFullContent(contentId) {
    const content = currentContent.find(item => item.id === contentId);
    if (!content) return;

    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div class="content-modal">
            <div class="modal-content">
                <button class="modal-close-btn" onclick="closeModal()">&times;</button>
                <h2 style="margin-bottom: 1rem; color: var(--primary-color);">${content.title}</h2>
                <div style="margin-bottom: 1rem;">
                    <span style="background-color: var(--primary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">${content.category || 'عام'}</span>
                </div>
                <div style="line-height: 1.7; color: var(--text-primary);">${content.content}</div>
            </div>
        </div>
    `;
    
    // Allow for smooth transition by not immediately making visible
    const modal = document.querySelector('.content-modal');
    setTimeout(() => {
        if (modal) {
            modal.classList.add('visible');
        }
    }, 10);
}

function closeModal() {
    const modal = document.querySelector('.content-modal');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.parentElement.innerHTML = '', 300);
    }
}

// Setup Guidelines Accordion
function setupGuidelinesAccordion() {
    const container = document.querySelector('.guidelines-container');
    if (container) {
        container.addEventListener('click', (e) => {
            const question = e.target.closest('.guideline-question');
            if (!question) return;
            
            const answer = question.nextElementSibling;
            question.classList.toggle('active');
            answer.classList.toggle('active');
        });
    }
}

// Utility functions
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function getPriorityClass(severity) {
    switch (severity) {
        case 'عالي':
        case 'critical':
            return 'high-priority';
        case 'متوسط':
        case 'medium':
            return 'medium-priority';
        default:
            return 'low-priority';
    }
}

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

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Make functions globally available
window.switchContentTab = switchContentTab;
window.showFullContent = showFullContent;
window.closeModal = closeModal;
