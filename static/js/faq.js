// FAQ page functionality

let allFAQs = [];
let filteredFAQs = [];
let currentCategory = 'all';
let searchTimeout;

document.addEventListener('DOMContentLoaded', function() {
    initializeFAQPage();
});

function initializeFAQPage() {
    loadFAQs();
    setupSearch();
    setupCategoryFilters();
}

// Load FAQs from API
async function loadFAQs() {
    try {
        const response = await fetch(`${window.PharmacovigilanceApp.API_BASE}/faqs`);
        if (response.ok) {
            const data = await response.json();
            allFAQs = data.map(faq => ({
                id: faq.id,
                question: faq.question_ar,
                answer: faq.answer_ar,
                category: faq.category
            }));
            filteredFAQs = [...allFAQs];
            setupCategories();
            displayFAQs(filteredFAQs);
        } else {
            displayDefaultFAQs();
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
        displayDefaultFAQs();
    }
}

// Display default FAQs if API fails
function displayDefaultFAQs() {
    const defaultFAQs = [
        {
            id: 1,
            question: 'ما هي الآثار الجانبية للأدوية؟',
            answer: 'الآثار الجانبية هي تأثيرات غير مرغوب فيها قد تحدث عند تناول الأدوية. يمكن أن تتراوح من خفيفة مثل الصداع أو الغثيان إلى شديدة مثل الحساسية الشديدة. من المهم الإبلاغ عن أي آثار جانبية غير عادية لطبيبك أو الصيدلي.',
            category: 'عام'
        },
        {
            id: 2,
            question: 'كيف يمكنني الإبلاغ عن آثار جانبية للأدوية؟',
            answer: 'يمكنك الإبلاغ عن الآثار الجانبية من خلال هذه المنصة بملء نموذج الإبلاغ المتاح في قسم "الإبلاغ عن الآثار الجانبية". كما يمكنك التواصل مع طبيبك أو الصيدلي أو الاتصال بوزارة الصحة مباشرة.',
            category: 'إبلاغ'
        },
        {
            id: 3,
            question: 'هل الإبلاغ عن الآثار الجانبية مجاني؟',
            answer: 'نعم، الإبلاغ عن الآثار الجانبية مجاني تماماً. هذه الخدمة مقدمة من وزارة الصحة العراقية لضمان سلامة المواطنين وتحسين جودة الأدوية المتاحة في السوق.',
            category: 'عام'
        },
        {
            id: 4,
            question: 'ماذا يحدث بعد إرسال تقرير الآثار الجانبية؟',
            answer: 'بعد إرسال التقرير، سيتم مراجعته من قبل فريق متخصص في وزارة الصحة. قد يتم التواصل معك للحصول على معلومات إضافية إذا لزم الأمر. سيتم استخدام المعلومات لتحسين سلامة الأدوية وإصدار تنبيهات إذا لزم الأمر.',
            category: 'إبلاغ'
        },
        {
            id: 5,
            question: 'هل يمكنني الإبلاغ بشكل مجهول؟',
            answer: 'نعم، يمكنك الإبلاغ عن الآثار الجانبية دون ذكر اسمك أو معلوماتك الشخصية. ومع ذلك، توفير معلومات الاتصال يساعد في الحصول على تفاصيل إضافية إذا لزم الأمر.',
            category: 'خصوصية'
        },
        {
            id: 6,
            question: 'ما هي المعلومات المطلوبة للإبلاغ؟',
            answer: 'المعلومات الأساسية تشمل: اسم الدواء، وصف الأثر الجانبي، تاريخ بداية الأعراض، معلومات المريض (العمر والجنس)، والجرعة المستخدمة. كلما كانت المعلومات أكثر تفصيلاً، كان التقييم أفضل.',
            category: 'إبلاغ'
        },
        {
            id: 7,
            question: 'كم من الوقت يستغرق معالجة التقرير؟',
            answer: 'يتم مراجعة التقارير خلال 48 ساعة من الإرسال. في حالة التقارير الطارئة أو الخطيرة، يتم التعامل معها فوراً. سيتم إشعارك بحالة التقرير عبر البريد الإلكتروني أو الهاتف إذا قدمت معلومات الاتصال.',
            category: 'إبلاغ'
        },
        {
            id: 8,
            question: 'هل يمكن للأطباء والصيادلة الإبلاغ أيضاً؟',
            answer: 'نعم، نشجع جميع المهنيين الصحيين بما في ذلك الأطباء والصيادلة والممرضين على الإبلاغ عن الآثار الجانبية. لديهم قسم خاص في نموذج الإبلاغ ويمكنهم الوصول إلى ميزات إضافية.',
            category: 'مهنيين'
        },
        {
            id: 9,
            question: 'ما هو الفرق بين الأثر الجانبي والحساسية؟',
            answer: 'الأثر الجانبي هو تأثير غير مرغوب فيه للدواء يحدث بجرعات عادية، بينما الحساسية هي رد فعل مناعي للجسم ضد الدواء. الحساسية عادة ما تكون أكثر خطورة وتتطلب عناية طبية فورية.',
            category: 'عام'
        },
        {
            id: 10,
            question: 'كيف يمكنني حماية خصوصيتي عند الإبلاغ؟',
            answer: 'نحن نلتزم بحماية خصوصيتك. جميع المعلومات الشخصية محمية ولا تُشارك مع أطراف ثالثة. يمكنك اختيار الإبلاغ بشكل مجهول، ويمكنك طلب حذف معلوماتك في أي وقت.',
            category: 'خصوصية'
        }
    ];

    allFAQs = defaultFAQs;
    filteredFAQs = [...allFAQs];
    setupCategories();
    displayFAQs(filteredFAQs);
}

// Setup categories based on loaded FAQs
function setupCategories() {
    const categories = [...new Set(allFAQs.map(faq => faq.category).filter(Boolean))];
    const filtersContainer = document.getElementById('category-filters');
    
    if (filtersContainer) {
        // Keep the "all" button and add category buttons
        const allButton = filtersContainer.querySelector('[data-category="all"]');
        filtersContainer.innerHTML = '';
        filtersContainer.appendChild(allButton);
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-filter';
            button.setAttribute('data-category', category);
            button.textContent = category;
            button.addEventListener('click', () => filterByCategory(category));
            filtersContainer.appendChild(button);
        });
    }
}

// Display FAQs
function displayFAQs(faqs) {
    const container = document.getElementById('faq-content');
    if (!container) return;

    if (faqs.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>لم يتم العثور على نتائج</h3>
                <p>جرب البحث بكلمات مختلفة أو تصفح جميع الأسئلة</p>
            </div>
        `;
        return;
    }

    container.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item">
            <button class="faq-question" onclick="toggleFAQ(${index})">
                <span>${faq.question}</span>
                <i class="fas fa-chevron-down faq-icon"></i>
            </button>
            <div class="faq-answer" id="faq-answer-${index}">
                <div class="faq-answer-content">
                    ${faq.answer}
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle FAQ answer
function toggleFAQ(index) {
    const question = document.querySelector(`.faq-question:nth-of-type(${index + 1})`);
    const answer = document.getElementById(`faq-answer-${index}`);
    
    if (!question || !answer) return;

    // Close all other FAQs
    document.querySelectorAll('.faq-question').forEach((q, i) => {
        if (i !== index) {
            q.classList.remove('active');
            const a = document.getElementById(`faq-answer-${i}`);
            if (a) a.classList.remove('active');
        }
    });

    // Toggle current FAQ
    question.classList.toggle('active');
    answer.classList.toggle('active');
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('faq-search');
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
        // Show all FAQs for current category if search is empty
        filterByCategory(currentCategory);
        return;
    }

    const searchResults = allFAQs.filter(faq => {
        const matchesQuery = 
            faq.question.toLowerCase().includes(query.toLowerCase()) ||
            faq.answer.toLowerCase().includes(query.toLowerCase());
        
        const matchesCategory = currentCategory === 'all' || faq.category === currentCategory;
        
        return matchesQuery && matchesCategory;
    });

    filteredFAQs = searchResults;
    displayFAQs(filteredFAQs);
}

// Setup category filters
function setupCategoryFilters() {
    const filtersContainer = document.getElementById('category-filters');
    if (filtersContainer) {
        filtersContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('category-filter')) {
                const category = event.target.getAttribute('data-category');
                filterByCategory(category);
                
                // Update active filter
                filtersContainer.querySelectorAll('.category-filter').forEach(filter => {
                    filter.classList.remove('active');
                });
                event.target.classList.add('active');
            }
        });
    }
}

// Filter FAQs by category
function filterByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredFAQs = [...allFAQs];
    } else {
        filteredFAQs = allFAQs.filter(faq => faq.category === category);
    }
    
    // Apply search if there's a search query
    const searchInput = document.getElementById('faq-search');
    if (searchInput && searchInput.value.trim()) {
        performSearch(searchInput.value);
    } else {
        displayFAQs(filteredFAQs);
    }
}

// Scroll to specific FAQ (useful for deep linking)
function scrollToFAQ(faqId) {
    const faqIndex = filteredFAQs.findIndex(faq => faq.id === faqId);
    if (faqIndex !== -1) {
        setTimeout(() => {
            const faqElement = document.querySelector(`.faq-item:nth-child(${faqIndex + 1})`);
            if (faqElement) {
                faqElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Auto-open the FAQ
                toggleFAQ(faqIndex);
            }
        }, 100);
    }
}

// Handle URL parameters for deep linking
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const faqId = urlParams.get('faq');
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category && category !== 'all') {
        filterByCategory(category);
        // Update active filter button
        const filterButton = document.querySelector(`[data-category="${category}"]`);
        if (filterButton) {
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            filterButton.classList.add('active');
        }
    }
    
    if (search) {
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.value = search;
            performSearch(search);
        }
    }
    
    if (faqId) {
        scrollToFAQ(parseInt(faqId));
    }
}

// Add FAQ functionality for admin (if needed)
function addNewFAQ(question, answer, category) {
    const newFAQ = {
        id: Math.max(...allFAQs.map(f => f.id)) + 1,
        question: question,
        answer: answer,
        category: category || 'عام'
    };
    
    allFAQs.push(newFAQ);
    filterByCategory(currentCategory);
    setupCategories();
}

// Export FAQ data (for admin use)
function exportFAQs() {
    const dataStr = JSON.stringify(allFAQs, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faqs.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Initialize URL parameter handling after content loads
setTimeout(handleURLParameters, 500);

// Make functions globally available
window.toggleFAQ = toggleFAQ;
window.filterByCategory = filterByCategory;
window.scrollToFAQ = scrollToFAQ;
window.addNewFAQ = addNewFAQ;
window.exportFAQs = exportFAQs;
