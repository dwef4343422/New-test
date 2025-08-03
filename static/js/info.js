<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>معلومات توعوية - منصة اليقظة الدوائية العراقية</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <style>
        /* Base Styles (from your original style.css) */
        :root {
            --primary-color: #2c5aa0;
            --secondary-color: #1e3a8a;
            --accent-color: #3b82f6;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --background-light: #f8fafc;
            --background-white: #ffffff;
            --border-color: #e5e7eb;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --border-radius: 8px;
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--background-light);
            direction: rtl;
            text-align: right;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        h1, h2, h3, h4 {
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 0.5rem;
        }

        .section-title {
            text-align: center;
            margin-bottom: 3rem;
            color: var(--text-primary);
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 50%;
            transform: translateX(50%);
            width: 60px;
            height: 3px;
            background-color: var(--primary-color);
        }

        /* Navbar Styles */
        .navbar {
            background-color: var(--background-white);
            box-shadow: var(--shadow-sm);
            position: sticky;
            top: 0;
            width: 100%;
            z-index: 1000;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
            position: relative;
        }

        .nav-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary-color);
        }

        .nav-logo i {
            font-size: 1.5rem;
        }

        /* Desktop Navigation Menu */
        .nav-menu {
            display: none;
            gap: 1.5rem;
            flex-grow: 1;
            justify-content: flex-end;
        }

        .nav-menu .nav-link {
            padding: 0.5rem 0.75rem;
            border-radius: var(--border-radius);
            color: var(--text-primary);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }

        .nav-menu .nav-link:hover {
            background-color: var(--background-light);
            color: var(--primary-color);
        }

        .nav-menu .nav-link.active {
            background-color: var(--primary-color);
            color: white;
        }

        /* Hamburger Menu Toggle */
        .nav-toggle {
            display: block;
            flex-direction: column;
            cursor: pointer;
            gap: 4px;
        }

        .nav-toggle .bar {
            width: 25px;
            height: 3px;
            background-color: var(--primary-color);
            transition: var(--transition);
        }

        .nav-toggle.active .bar:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }

        .nav-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }

        .nav-toggle.active .bar:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Mobile Menu Container */
        .mobile-menu {
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            background-color: var(--background-white);
            box-shadow: var(--shadow-md);
            z-index: 999;
            display: none;
        }

        .mobile-menu.active {
            display: block;
        }

        .mobile-menu .nav-link {
            display: block;
            padding: 1rem 1.5rem;
            color: var(--text-primary);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
            border-bottom: 1px solid var(--border-color);
        }

        .mobile-menu .nav-link:hover {
            background-color: var(--background-light);
            color: var(--primary-color);
        }

        .mobile-menu .nav-link.active {
            background-color: var(--primary-color);
            color: white;
        }

        /* Desktop Media Query */
        @media (min-width: 768px) {
            .nav-menu {
                display: flex;
            }

            .nav-toggle {
                display: none !important;
            }

            .mobile-menu {
                display: none !important;
            }
        }

        /* Hero Section */
        .info-hero {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            color: white;
            padding: 80px 0;
            text-align: center;
            box-shadow: var(--shadow-lg);
            border-bottom-left-radius: 20px;
            border-bottom-right-radius: 20px;
            margin-bottom: 2rem;
        }
        
        .info-hero h1 {
            font-size: 2.5rem;
        }

        /* Main Content Styles */
        .content-tabs {
            display: flex;
            background-color: var(--background-white);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
            overflow: hidden;
        }

        .content-tab {
            flex: 1;
            padding: 1rem;
            background-color: transparent;
            border: none;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
            color: var(--text-secondary);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .content-tab:hover:not(.active) {
            background-color: var(--background-light);
            color: var(--primary-color);
        }

        .content-tab.active {
            background-color: var(--primary-color);
            color: white;
        }

        .content-section {
            display: none;
        }

        .content-section.active {
            display: block;
        }

        .search-box {
            background-color: var(--background-white);
            border: 1px solid var(--border-color);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
            margin-bottom: 2rem;
        }

        .search-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-family: inherit;
            outline: none;
            transition: var(--transition);
        }

        .search-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .loading-spinner, .no-content {
            text-align: center;
            padding: 3rem;
            color: var(--text-secondary);
            grid-column: 1 / -1;
        }
        
        .no-content i, .loading-spinner i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--border-color);
        }

        /* NEW MODERN CARD STYLES */
        .content-card {
            background-color: var(--background-white);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-md);
            overflow: hidden;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
        }

        .content-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }

        .content-card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: var(--background-white);
            border-bottom: 1px solid var(--border-color);
        }

        .content-card-icon {
            width: 50px;
            height: 50px;
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-color);
            color: white;
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .content-card-title-wrapper {
            flex-grow: 1;
        }

        .content-card-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .content-card-category {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .content-card-body {
            padding: 1.5rem;
            flex-grow: 1;
        }

        .content-card-text {
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .content-card-footer {
            padding: 0 1.5rem 1.5rem;
        }
        
        .read-more-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 0.875rem;
            transition: var(--transition);
        }
        
        .read-more-btn:hover {
            background-color: var(--secondary-color);
        }

        /* NEW GUIDELINES ACCORDION STYLES */
        .guidelines-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .guideline-item {
            background-color: var(--background-white);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
            margin-bottom: 1rem;
            overflow: hidden;
            transition: var(--transition);
        }

        .guideline-question {
            padding: 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--background-white);
            border: none;
            width: 100%;
            text-align: right;
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--text-primary);
            transition: var(--transition);
        }

        .guideline-question:hover {
            background-color: var(--background-light);
        }

        .guideline-question.active {
            background-color: var(--primary-color);
            color: white;
        }

        .guideline-question span {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .guideline-icon {
            font-size: 1rem;
            transition: var(--transition);
        }

        .guideline-question.active .guideline-icon {
            transform: rotate(180deg);
        }

        .guideline-answer {
            padding: 0 1.5rem;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
            background-color: var(--background-light);
        }

        .guideline-answer.active {
            padding: 1.5rem;
            max-height: 1000px;
        }

        .guideline-answer-content {
            color: var(--text-secondary);
            line-height: 1.8;
        }

        .guideline-answer-content h4 {
            color: var(--text-primary);
            font-weight: 600;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .guideline-answer-content ul, .guideline-answer-content ol {
            padding-right: 20px;
            margin-bottom: 1rem;
            list-style-position: inside;
        }
        
        /* Modal Styles */
        .content-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .content-modal.visible {
            opacity: 1;
            visibility: visible;
        }

        .modal-content {
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 2.5rem;
            position: relative;
            transform: scale(0.95);
            transition: transform 0.3s ease;
        }
        
        .content-modal.visible .modal-content {
            transform: scale(1);
        }

        .modal-close-btn {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: none;
            border: none;
            font-size: 1.75rem;
            cursor: pointer;
            color: var(--text-secondary);
            transition: var(--transition);
        }

        .modal-close-btn:hover {
            color: var(--primary-color);
        }
    </style>
</head>
<body>
   <!-- UPDATED NAVIGATION BAR -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-logo">
            <i class="fas fa-shield-alt"></i>
            <span>اليقظة الدوائية العراقية</span>
        </div>
        <div class="nav-menu" id="nav-menu">
                <a href="index.html" class="nav-link">الرئيسية</a>
                <a href="info.html" class="nav-link active">معلومات توعوية</a>
                <a href="report.html" class="nav-link">الإبلاغ</a>
                <a href="faq.html" class="nav-link">الأسئلة الشائعة</a>
                <a href="dashboard.html" class="nav-link auth-required" style="display: none;">لوحة التحكم</a>
                <a href="login.html" class="nav-link guest-only">تسجيل الدخول</a>
        </div>
        <div class="nav-toggle" id="nav-toggle">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
        <!-- Mobile Menu -->
        <div class="mobile-menu" id="mobile-menu">
            <a href="index.html" class="nav-link">الرئيسية</a>
            <a href="info.html" class="nav-link active">معلومات توعوية</a>
            <a href="report.html" class="nav-link">الإبلاغ</a>
            <a href="faq.html" class="nav-link">الأسئلة الشائعة</a>
            <a href="dashboard.html" class="nav-link">لوحة التحكم</a>
        </div>
    </div>
</nav>
    <section class="info-hero">
        <div class="container">
            <h1>مركز المعلومات الدوائية</h1>
            <p>دليلك الشامل للاستخدام الآمن والفعال للأدوية</p>
        </div>
    </section>
    <main style="padding: 2rem 0;">
        <div class="container">
            <div class="content-tabs">
                <button class="content-tab active" onclick="switchContentTab('educational')"><i class="fas fa-book-medical"></i> مواضيع تعليمية</button>
                <button class="content-tab" onclick="switchContentTab('guidelines')"><i class="fas fa-clipboard-list"></i> إرشادات هامة</button>
            </div>
            <div id="educational" class="content-section active">
                <div class="search-box">
                    <input type="text" class="search-input" id="search-input" placeholder="ابحث في المواضيع التعليمية...">
                </div>
                <h2 class="section-title">المواضيع التعليمية</h2>
                <div id="educational-content" class="content-grid">
                    <!-- Content will be loaded by JavaScript -->
                </div>
            </div>
            <div id="guidelines" class="content-section">
                <h2 class="section-title">الإرشادات والتوجيهات</h2>
                <div class="guidelines-container">
                    <!-- Guidelines will be populated by JavaScript -->
                </div>
            </div>
        </div>
    </main>

    <div id="modal-container"></div>

    <script src="js/auth.js"></script>
    <script>
        let currentContent = [];

document.addEventListener('DOMContentLoaded', () => {
    displayDefaultEducationalContent();
    displayGuidelines();
    setupSearch();
    setupGuidelinesAccordion();
    setupMobileMenu();
        });


        function switchContentTab(tabId) {
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelector(`.content-tab[onclick="switchContentTab('${tabId}')"]`).classList.add('active');
        }

        function displayEducationalContent(content) {
            const container = document.getElementById('educational-content');
            if (content.length === 0) {
                container.innerHTML = `<div class="no-content"><i class="fas fa-book-open"></i><h3>لا يوجد محتوى متاح حالياً</h3></div>`;
                return;
            }
            container.innerHTML = content.map(item => `
                <div class="content-card">
                    <div class="content-card-header">
                        <div class="content-card-icon"><i class="fas ${item.icon || 'fa-notes-medical'}"></i></div>
                        <div class="content-card-title-wrapper">
                            <div class="content-card-title">${item.title}</div>
                            <div class="content-card-category">${item.category || 'عام'}</div>
                        </div>
                    </div>
                    <div class="content-card-body">
                        <p class="content-card-text">${truncateText(item.summary, 150)}</p>
                    </div>
                    <div class="content-card-footer">
                        <button class="read-more-btn" onclick="showFullContent(${item.id})">اقرأ المزيد</button>
                    </div>
                </div>
            `).join('');
        }

        function displayDefaultEducationalContent() {
            const defaultContent = [
                { id: 1, title: 'فهم الوصفة الطبية', icon: 'fa-file-prescription', category: 'أساسيات الدواء', summary: 'تعلم كيفية قراءة وصفتك الطبية بشكل صحيح، فهم الجرعات، ومعرفة أهمية الالتزام بها لضمان أفضل النتائج العلاجية.', content: `<h3>أجزاء الوصفة الطبية:</h3><ul><li><b>اسم المريض:</b> للتأكد من أن الدواء للشخص الصحيح.</li><li><b>اسم الدواء:</b> الاسم العلمي أو التجاري.</li><li><b>الجرعة:</b> كمية الدواء في كل مرة (مثل 500 ملغ).</li><li><b>طريقة التناول:</b> (فموي، حقن، موضعي).</li><li><b>تكرار الاستخدام:</b> (مثال: مرتان يومياً).</li><li><b>مدة العلاج:</b> (مثال: لمدة 7 أيام).</li></ul><h3>نصائح هامة:</h3><p>لا تتردد أبداً في سؤال الصيدلي عن أي جزء غير واضح في الوصفة. تأكد من إخبار طبيبك بأي حساسية لديك تجاه أدوية معينة.</p>` },
                { id: 2, title: 'التفاعلات الدوائية الخطيرة', icon: 'fa-exclamation-triangle', category: 'سلامة الأدوية', summary: 'يمكن لبعض الأدوية أن تتفاعل مع أدوية أخرى أو أطعمة معينة. هذه التفاعلات قد تقلل من فعالية الدواء أو تزيد من آثاره الجانبية.', content: `<h3>أنواع التفاعلات:</h3><ul><li><b>دواء مع دواء:</b> قد يزيد دواء من تأثير دواء آخر أو يبطله.</li><li><b>دواء مع طعام:</b> عصير الجريب فروت، منتجات الألبان، والكحول هي أمثلة شائعة لأطعمة تتفاعل مع بعض الأدوية.</li><li><b>دواء مع حالة مرضية:</b> بعض الأدوية قد تكون خطيرة إذا كنت تعاني من أمراض معينة مثل أمراض الكلى أو القلب.</li></ul><h3>كيفية تجنبها:</h3><p>أخبر طبيبك والصيدلي بجميع الأدوية والمكملات التي تتناولها. اقرأ النشرة المرفقة مع الدواء دائماً.</p>` },
                { id: 3, title: 'التخزين والتخلص الآمن', icon: 'fa-trash-alt', category: 'إرشادات منزلية', summary: 'الطريقة التي تخزن بها الأدوية وتتخلص منها تؤثر على سلامتها وسلامة البيئة. التخزين الخاطئ قد يفسد الدواء.', content: `<h3>التخزين الصحيح:</h3><ul><li>احفظ الأدوية في مكان بارد وجاف، بعيداً عن ضوء الشمس المباشر. الحمام ليس مكاناً جيداً بسبب الرطوبة.</li><li>احفظها بعيداً عن متناول الأطفال والحيوانات الأليفة.</li><li>لا تقم بإزالة الأدوية من عبواتها الأصلية.</li></ul><h3>التخلص الآمن:</h3><p>لا ترمِ الأدوية في المرحاض أو القمامة مباشرة. استشر الصيدلي عن أفضل الطرق للتخلص من الأدوية منتهية الصلاحية أو غير المستخدمة.</p>` },
                { id: 4, title: 'الأدوية أثناء الحمل والرضاعة', icon: 'fa-female', category: 'حالات خاصة', summary: 'يجب التعامل مع الأدوية بحذر شديد أثناء فترتي الحمل والرضاعة، حيث يمكن لبعضها أن يؤثر على الجنين أو الرضيع.', content: `<h3>قاعدة أساسية:</h3><p><b>لا تتناولي أي دواء أو مكمل غذائي دون استشارة طبيبك أولاً.</b> هذا يشمل الأدوية التي لا تحتاج لوصفة طبية والمسكنات البسيطة.</p><h3>معلومات هامة:</h3><ul><li>بعض الأدوية آمنة تماماً، بينما البعض الآخر قد يسبب تشوهات خلقية.</li><li>طبيبك سيوازن بين حاجتك للدواء والمخاطر المحتملة على الجنين.</li><li>أخبري طبيبك إذا كنتِ تخططين للحمل لمراجعة أدويتك الحالية.</li></ul>` },
                { id: 5, title: 'كيفية التعرف على الأدوية المغشوشة', icon: 'fa-search-plus', category: 'توعية المستهلك', summary: 'الأدوية المغشوشة تشكل خطراً كبيراً على الصحة. قد تحتوي على مكونات خاطئة، أو لا تحتوي على أي مكون فعال.', content: `<h3>علامات تحذيرية:</h3><ul><li><b>العبوة:</b> أخطاء إملائية، طباعة رديئة، أو عبوة تبدو مختلفة عن المعتاد.</li><li><b>الدواء نفسه:</b> لون أو شكل أو حجم أو طعم غير متوقع. يتكسر بسهولة.</li><li><b>السعر:</b> سعر منخفض بشكل غير طبيعي مقارنة بالصيدليات الموثوقة.</li><li><b>المصدر:</b> الشراء من مصادر غير موثوقة عبر الإنترنت أو بائعين متجولين.</li></ul><h3>ماذا تفعل؟</h3><p>اشترِ الأدوية من الصيدليات المرخصة فقط. إذا شككت في دواء، لا تتناوله وأبلغ الصيدلي أو السلطات الصحية فوراً.</p>` },
                { id: 6, title: 'أهمية إكمال جرعة المضاد الحيوي', icon: 'fa-pills', category: 'سلامة الأدوية', summary: 'التوقف عن تناول المضاد الحيوي بمجرد الشعور بالتحسن هو خطأ شائع وخطير. إكمال الجرعة كاملة ضروري للقضاء على البكتيريا.', content: `<h3>لماذا هو مهم؟</h3><ul><li><b>القضاء على العدوى بالكامل:</b> التوقف المبكر قد يترك البكتيريا الأقوى حية، مما قد يسبب عودة المرض بشكل أشد.</li><li><b>منع مقاومة المضادات الحيوية:</b> البكتيريا التي تنجو تتعلم كيفية مقاومة الدواء، مما يجعل العدوى المستقبلية أصعب في العلاج. هذه مشكلة صحية عالمية خطيرة.</li></ul><h3>القاعدة الذهبية:</h3><p>دائماً أكمل دورة المضاد الحيوي كاملة كما وصفها الطبيب، حتى لو شعرت بتحسن تام قبل انتهائها.</p>` }
            ];
            currentContent = defaultContent;
            displayEducationalContent(defaultContent);
        }

        function displayGuidelines() {
            const guidelines = [
                { title: 'إرشادات الإبلاغ عن الآثار الجانبية', icon: 'fa-file-signature', content: `<h4>خطوات الإبلاغ:</h4><ol><li>اجمع المعلومات الأساسية عن الدواء والمريض.</li><li>اكتب وصفاً مفصلاً للأعراض التي ظهرت.</li><li>حدد تاريخ بداية وانتهاء الأعراض إن أمكن.</li><li>اذكر أي أدوية أخرى يتم تناولها لتجنب التفاعلات.</li><li>أرسل التقرير عبر المنصة من قسم "الإبلاغ".</li></ol><h4>معلومات مهمة:</h4><ul><li>يمكن الإبلاغ بشكل مجهول لحماية خصوصيتك.</li><li>جميع التقارير سرية وتُعامل بأهمية بالغة.</li><li>كل تقرير مهم حتى لو كان الأثر الجانبي معروفاً.</li></ul>` },
                { title: 'معايير سلامة الأدوية', icon: 'fa-shield-alt', content: `<h4>المعايير الأساسية:</h4><ul><li>تأكد من أن جميع الأدوية مسجلة لدى وزارة الصحة.</li><li>تحقق من تاريخ انتهاء الصلاحية قبل الاستخدام دائماً.</li><li>احفظ الأدوية في ظروف مناسبة بعيداً عن الحرارة والرطوبة.</li><li>لا تشارك الأدوية الموصوفة لك مع الآخرين.</li></ul><h4>علامات الأدوية المشبوهة:</h4><ul><li>عبوة تالفة، مفتوحة، أو ذات طباعة رديئة.</li><li>لون، رائحة، أو طعم غير طبيعي للدواء.</li><li>عدم وجود معلومات واضحة باللغة العربية على العبوة.</li></ul>` },
                { title: 'دليل الأطباء والمهنيين الصحيين', icon: 'fa-user-md', content: `<h4>دوركم في اليقظة الدوائية:</h4><ul><li>مراقبة المرضى بشكل فعال للآثار الجانبية المحتملة.</li><li>تقييم العلاقة السببية بين الدواء والأثر الجانبي.</li><li>الإبلاغ الفوري عن الحالات الخطيرة وغير المتوقعة.</li><li>تثقيف المرضى حول المخاطر المحتملة وكيفية التعامل معها.</li></ul><h4>متى يجب الإبلاغ:</h4><ul><li>عند ظهور أي أثر جانبي خطير أو غير متوقع.</li><li>عند ملاحظة زيادة في شدة أو تكرار الآثار المعروفة.</li><li>عند الشك في فشل فعالية الدواء (عدم الاستجابة العلاجية).</li><li>عند ملاحظة تفاعلات دوائية جديدة لم تكن مسجلة.</li></ul>` }
            ];
            const container = document.querySelector('.guidelines-container');
            container.innerHTML = guidelines.map(g => `
                <div class="guideline-item">
                    <button class="guideline-question">
                        <span><i class="fas ${g.icon}"></i> ${g.title}</span>
                        <i class="fas fa-chevron-down guideline-icon"></i>
                    </button>
                    <div class="guideline-answer"><div class="guideline-answer-content">${g.content}</div></div>
                </div>
            `).join('');
        }

        function setupSearch() {
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = currentContent.filter(item =>
                    item.title.toLowerCase().includes(query) ||
                    item.summary.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query)
                );
                displayEducationalContent(filtered);
            });
        }

        function setupGuidelinesAccordion() {
            const container = document.querySelector('.guidelines-container');
            container.addEventListener('click', (e) => {
                const question = e.target.closest('.guideline-question');
                if (!question) return;
                
                const answer = question.nextElementSibling;
                question.classList.toggle('active');
                answer.classList.toggle('active');
            });
        }

        function showFullContent(id) {
            const content = currentContent.find(item => item.id === id);
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

        function truncateText(text, length) {
            return text.length > length ? text.substring(0, length) + '...' : text;
        }
    </script>
</body>
</html>
